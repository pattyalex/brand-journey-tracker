module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return res.status(500).json({ error: 'Stripe secret key not configured' });

  try {
    const { customerId, priceId, paymentMethodId, trialPeriodDays = 14 } = req.body;

    // Set default payment method on customer
    const updateParams = new URLSearchParams();
    updateParams.append('invoice_settings[default_payment_method]', paymentMethodId);

    await fetch(`https://api.stripe.com/v1/customers/${customerId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: updateParams.toString(),
    });

    // Create subscription
    const subParams = new URLSearchParams();
    subParams.append('customer', customerId);
    subParams.append('items[0][price]', priceId);
    subParams.append('default_payment_method', paymentMethodId);
    subParams.append('trial_period_days', String(trialPeriodDays));
    subParams.append('expand[]', 'latest_invoice.payment_intent');

    const response = await fetch('https://api.stripe.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: subParams.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || 'Failed to create subscription' });
    }

    res.json({ subscription: data });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: error.message });
  }
};
