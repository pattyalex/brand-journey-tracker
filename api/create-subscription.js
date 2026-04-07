import https from 'https';

function stripeRequest(path, method, params, key) {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams(params).toString();
    const options = {
      hostname: 'api.stripe.com',
      port: 443,
      path,
      method,
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch (e) { reject(new Error('Invalid JSON from Stripe')); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function supabaseVerify(token, supabaseUrl) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(`${supabaseUrl}/auth/v1/user`);
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
    const options = {
      hostname: parsed.hostname, port: 443, path: parsed.pathname, method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'apikey': anonKey },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch (e) { resolve({ status: res.statusCode, body: {} }); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://www.heymeg.ai');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Verify auth
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No authorization header' });
  const userToken = authHeader.replace('Bearer ', '');
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const verifyResult = await supabaseVerify(userToken, supabaseUrl);
  if (verifyResult.status !== 200 || !verifyResult.body.id) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return res.status(500).json({ error: 'Stripe secret key not configured' });

  try {
    const { customerId, priceId, paymentMethodId, trialPeriodDays: rawTrialDays, promotionCodeId } = req.body;
    const trialPeriodDays = rawTrialDays != null ? rawTrialDays : 14;

    if (paymentMethodId) {
      await stripeRequest(
        `/v1/customers/${customerId}`,
        'POST',
        { 'invoice_settings[default_payment_method]': paymentMethodId },
        key
      );
    }

    const subscriptionParams = {
      'customer': customerId,
      'items[0][price]': priceId,
      'trial_period_days': String(trialPeriodDays),
      'expand[]': 'latest_invoice.payment_intent',
    };

    if (paymentMethodId) {
      subscriptionParams['default_payment_method'] = paymentMethodId;
    }

    if (promotionCodeId) {
      subscriptionParams['discounts[0][promotion_code]'] = promotionCodeId;
    }

    const result = await stripeRequest('/v1/subscriptions', 'POST', subscriptionParams, key);

    if (result.status !== 200) {
      return res.status(500).json({ error: result.body.error?.message || 'Failed to create subscription' });
    }

    res.json({ subscription: result.body });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: error.message });
  }
}
