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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return res.status(500).json({ error: 'Stripe secret key not configured' });

  try {
    const { customerId, priceId, paymentMethodId, trialPeriodDays: rawTrialDays } = req.body;
    const trialPeriodDays = rawTrialDays != null ? rawTrialDays : 14;

    await stripeRequest(
      `/v1/customers/${customerId}`,
      'POST',
      { 'invoice_settings[default_payment_method]': paymentMethodId },
      key
    );

    const result = await stripeRequest('/v1/subscriptions', 'POST', {
      'customer': customerId,
      'items[0][price]': priceId,
      'default_payment_method': paymentMethodId,
      'trial_period_days': String(trialPeriodDays),
      'expand[]': 'latest_invoice.payment_intent',
    }, key);

    if (result.status !== 200) {
      return res.status(500).json({ error: result.body.error?.message || 'Failed to create subscription' });
    }

    res.json({ subscription: result.body });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: error.message });
  }
}
