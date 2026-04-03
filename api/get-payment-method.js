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

function supabaseVerify(token, supabaseUrl) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(`${supabaseUrl}/auth/v1/user`);
    const options = {
      hostname: parsed.hostname, port: 443, path: parsed.pathname, method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'apikey': token },
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

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
