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
  if (!key) return res.status(500).json({ error: 'Stripe key not configured' });

  const { subscriptionId } = req.body;
  if (!subscriptionId) return res.status(400).json({ error: 'subscriptionId is required' });

  try {
    // Cancel at period end — user retains access until current billing cycle ends
    const result = await stripeRequest(
      `/v1/subscriptions/${subscriptionId}`,
      'POST',
      { cancel_at_period_end: 'true' },
      key
    );

    if (result.status !== 200) {
      console.error('Stripe cancel error:', result.body);
      return res.status(result.status).json({ error: result.body.error?.message || 'Failed to cancel subscription' });
    }

    res.json({ subscription: result.body });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
