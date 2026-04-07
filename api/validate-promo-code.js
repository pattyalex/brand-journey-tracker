import https from 'https';

function stripeRequest(path, method, params, key) {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams(params).toString();
    const options = {
      hostname: 'api.stripe.com',
      port: 443,
      path: path + (method === 'GET' && body ? '?' + body : ''),
      method,
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        ...(method !== 'GET' ? { 'Content-Length': Buffer.byteLength(body) } : {}),
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
    if (method !== 'GET') req.write(body);
    req.end();
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://www.heymeg.ai');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return res.status(500).json({ error: 'Stripe secret key not configured' });

  try {
    const { code } = req.body;
    if (!code || !code.trim()) {
      return res.status(400).json({ error: 'Promotion code is required' });
    }

    // Look up the promotion code by its customer-facing code
    const result = await stripeRequest('/v1/promotion_codes', 'GET', {
      'code': code.trim(),
      'active': 'true',
      'limit': '1',
    }, key);

    if (result.status !== 200 || !result.body.data || result.body.data.length === 0) {
      return res.status(404).json({ error: 'Invalid or expired promotion code' });
    }

    const promoCode = result.body.data[0];
    const couponId = typeof promoCode.coupon === 'string' ? promoCode.coupon : promoCode.coupon?.id;

    if (!couponId) {
      console.error('No couponId found. promoCode.coupon:', JSON.stringify(promoCode.coupon));
      return res.status(404).json({ error: 'This promotion code is no longer valid' });
    }

    // Fetch the full coupon object
    const couponResult = await stripeRequest(`/v1/coupons/${couponId}`, 'GET', {}, key);
    console.log('Coupon fetch result:', JSON.stringify({ status: couponResult.status, valid: couponResult.body.valid, id: couponResult.body.id }));
    if (couponResult.status !== 200 || !couponResult.body.valid) {
      console.error('Coupon validation failed. Full response:', JSON.stringify(couponResult));
      return res.status(404).json({ error: 'This promotion code is no longer valid' });
    }

    const coupon = couponResult.body;

    // Build discount description
    let discountText = '';
    if (coupon.percent_off) {
      discountText = `${coupon.percent_off}% off`;
    } else if (coupon.amount_off) {
      discountText = `$${(coupon.amount_off / 100).toFixed(2)} off`;
    }
    if (coupon.duration === 'once') {
      discountText += ' (first payment)';
    } else if (coupon.duration === 'repeating' && coupon.duration_in_months) {
      discountText += ` for ${coupon.duration_in_months} months`;
    } else if (coupon.duration === 'forever') {
      discountText += ' forever';
    }

    res.json({
      valid: true,
      promotionCodeId: promoCode.id,
      discountText,
      fullDiscount: coupon.percent_off === 100,
    });
  } catch (error) {
    console.error('Error validating promo code:', error);
    res.status(500).json({ error: error.message });
  }
}
