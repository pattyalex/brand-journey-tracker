import https from 'https';

function stripeGet(path, key) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.stripe.com',
      port: 443,
      path,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${key}`,
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
    req.end();
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return res.status(500).json({ error: 'Stripe key not configured' });

  const { customerId } = req.query;
  if (!customerId) return res.status(400).json({ error: 'customerId is required' });

  try {
    const result = await stripeGet(
      `/v1/payment_methods?customer=${encodeURIComponent(customerId)}&type=card&limit=1`,
      key
    );

    if (result.status !== 200) {
      return res.status(result.status).json({ error: result.body.error?.message || 'Failed to fetch payment method' });
    }

    const card = result.body.data?.[0]?.card || null;
    const paymentMethodId = result.body.data?.[0]?.id || null;

    res.json({
      paymentMethod: card ? {
        id: paymentMethodId,
        brand: card.brand,
        last4: card.last4,
        expMonth: card.exp_month,
        expYear: card.exp_year,
      } : null,
    });
  } catch (error) {
    console.error('Error fetching payment method:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
