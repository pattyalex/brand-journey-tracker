import https from 'https';
import crypto from 'crypto';

// Supabase REST helper
function supabasePatch(path, body) {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase not configured: url=' + !!url + ' key=' + !!key);

  const hostname = new URL(url).hostname;
  const data = JSON.stringify(body);

  return new Promise((resolve, reject) => {
    const options = {
      hostname,
      port: 443,
      path: `/rest/v1/${path}`,
      method: 'PATCH',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
        'Content-Length': Buffer.byteLength(data),
      },
    };
    const req = https.request(options, (res) => {
      let result = '';
      res.on('data', (chunk) => { result += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body: result }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Verify Stripe webhook signature
function verifyStripeSignature(payload, sigHeader, secret) {
  const parts = {};
  for (const item of sigHeader.split(',')) {
    const idx = item.indexOf('=');
    if (idx !== -1) {
      parts[item.slice(0, idx)] = item.slice(idx + 1);
    }
  }

  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Disable Vercel body parsing so we get the raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

function getRawBody(req) {
  // Vercel with bodyParser:false provides body as a Buffer on req.body
  if (Buffer.isBuffer(req.body)) {
    return Promise.resolve(req.body.toString('utf8'));
  }
  if (typeof req.body === 'string') {
    return Promise.resolve(req.body);
  }
  if (req.body && typeof req.body === 'object') {
    return Promise.resolve(JSON.stringify(req.body));
  }
  // Fallback: read from stream
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let rawBody;

    try {
      rawBody = await getRawBody(req);
    } catch (bodyErr) {
      console.error('Failed to read body:', bodyErr);
      return res.status(400).json({ error: 'Failed to read request body' });
    }

    console.log('Webhook received, body length:', rawBody.length);

    // Verify signature if webhook secret is configured
    if (webhookSecret) {
      const sigHeader = req.headers['stripe-signature'];
      if (!sigHeader) {
        return res.status(400).json({ error: 'Missing stripe-signature header' });
      }
      try {
        const valid = verifyStripeSignature(rawBody, sigHeader, webhookSecret);
        if (!valid) {
          console.error('Invalid webhook signature');
          return res.status(400).json({ error: 'Invalid signature' });
        }
      } catch (sigErr) {
        console.error('Signature verification error:', sigErr.message);
        return res.status(400).json({ error: 'Signature verification failed: ' + sigErr.message });
      }
    }

    const event = JSON.parse(rawBody);
    console.log('Stripe webhook event:', event.type);

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const status = subscription.status;
        const priceId = subscription.items?.data?.[0]?.price?.id;

        const monthlyPriceId = process.env.STRIPE_PRICE_MONTHLY || process.env.VITE_STRIPE_PRICE_MONTHLY;
        const planType = priceId === monthlyPriceId ? 'monthly' : 'annual';
        const isTrialing = status === 'trialing';
        const trialEnd = subscription.trial_end
          ? new Date(subscription.trial_end * 1000).toISOString()
          : null;

        const result = await supabasePatch(
          `profiles?stripe_customer_id=eq.${customerId}`,
          {
            subscription_status: status,
            stripe_subscription_id: subscription.id,
            plan_type: planType,
            is_on_trial: isTrialing,
            trial_ends_at: trialEnd,
          }
        );
        console.log(`Updated subscription for ${customerId}: ${status}, supabase status: ${result.status}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        const result = await supabasePatch(
          `profiles?stripe_customer_id=eq.${customerId}`,
          { subscription_status: 'canceled', is_on_trial: false }
        );
        console.log(`Subscription canceled for ${customerId}, supabase status: ${result.status}`);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        if (invoice.amount_paid === 0) {
          console.log('Skipping trial invoice (amount=0)');
          break;
        }

        const result = await supabasePatch(
          `profiles?stripe_customer_id=eq.${customerId}`,
          { subscription_status: 'active', is_on_trial: false }
        );
        console.log(`Payment succeeded for ${customerId}, supabase status: ${result.status}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        const result = await supabasePatch(
          `profiles?stripe_customer_id=eq.${customerId}`,
          { subscription_status: 'past_due' }
        );
        console.log(`Payment failed for ${customerId}, supabase status: ${result.status}`);
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err.message, err.stack);
    return res.status(500).json({ error: err.message || 'Webhook handler failed' });
  }
}
