import https from 'https';
import crypto from 'crypto';

// Supabase REST helper (no external dependencies needed)
function supabaseRequest(path, method, body) {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase not configured');

  const hostname = new URL(url).hostname;
  const data = JSON.stringify(body);

  return new Promise((resolve, reject) => {
    const options = {
      hostname,
      port: 443,
      path: `/rest/v1/${path}`,
      method,
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': method === 'PATCH' ? 'return=minimal' : 'return=representation',
        'Content-Length': Buffer.byteLength(data),
      },
    };
    const req = https.request(options, (res) => {
      let result = '';
      res.on('data', (chunk) => { result += chunk; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: result ? JSON.parse(result) : null }); }
        catch { resolve({ status: res.statusCode, body: result }); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function supabaseGet(path) {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase not configured');

  const hostname = new URL(url).hostname;

  return new Promise((resolve, reject) => {
    const options = {
      hostname,
      port: 443,
      path: `/rest/v1/${path}`,
      method: 'GET',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Accept': 'application/json',
      },
    };
    const req = https.request(options, (res) => {
      let result = '';
      res.on('data', (chunk) => { result += chunk; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(result) }); }
        catch { resolve({ status: res.statusCode, body: result }); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

// Verify Stripe webhook signature
function verifyStripeSignature(payload, sigHeader, secret) {
  const parts = sigHeader.split(',').reduce((acc, part) => {
    const [key, value] = part.split('=');
    acc[key] = value;
    return acc;
  }, {});

  const timestamp = parts.t;
  const signature = parts.v1;

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

// Need raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

function getRawBody(req) {
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

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const rawBody = await getRawBody(req);

  // Verify signature if webhook secret is configured
  if (webhookSecret) {
    const sigHeader = req.headers['stripe-signature'];
    if (!sigHeader) {
      return res.status(400).json({ error: 'Missing stripe-signature header' });
    }
    try {
      const valid = verifyStripeSignature(rawBody, sigHeader, webhookSecret);
      if (!valid) {
        return res.status(400).json({ error: 'Invalid signature' });
      }
    } catch (err) {
      console.error('Signature verification failed:', err.message);
      return res.status(400).json({ error: 'Signature verification failed' });
    }
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  console.log('Stripe webhook received:', event.type);

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const status = subscription.status;
        const priceId = subscription.items?.data?.[0]?.price?.id;

        // Determine plan type from price ID
        const monthlyPriceId = process.env.STRIPE_PRICE_MONTHLY || process.env.VITE_STRIPE_PRICE_MONTHLY;
        const planType = priceId === monthlyPriceId ? 'monthly' : 'annual';

        const isTrialing = status === 'trialing';
        const trialEnd = subscription.trial_end
          ? new Date(subscription.trial_end * 1000).toISOString()
          : null;

        // Update the profile in Supabase
        await supabaseRequest(
          `profiles?stripe_customer_id=eq.${customerId}`,
          'PATCH',
          {
            subscription_status: status,
            stripe_subscription_id: subscription.id,
            plan_type: planType,
            is_on_trial: isTrialing,
            trial_ends_at: trialEnd,
          }
        );

        console.log(`Updated subscription for customer ${customerId}: ${status}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        await supabaseRequest(
          `profiles?stripe_customer_id=eq.${customerId}`,
          'PATCH',
          {
            subscription_status: 'canceled',
            is_on_trial: false,
          }
        );

        console.log(`Subscription canceled for customer ${customerId}`);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        // Skip trial invoices (amount = 0)
        if (invoice.amount_paid === 0) break;

        // Update subscription status to active (payment confirmed)
        await supabaseRequest(
          `profiles?stripe_customer_id=eq.${customerId}`,
          'PATCH',
          {
            subscription_status: 'active',
            is_on_trial: false,
          }
        );

        console.log(`Payment succeeded for customer ${customerId}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        await supabaseRequest(
          `profiles?stripe_customer_id=eq.${customerId}`,
          'PATCH',
          {
            subscription_status: 'past_due',
          }
        );

        console.log(`Payment failed for customer ${customerId}`);
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}
