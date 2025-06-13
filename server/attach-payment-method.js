
const express = require('express');
const Stripe = require('stripe');

const app = express();
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.post('/api/attach-payment-method', async (req, res) => {
  try {
    const { paymentMethodId, customerId } = req.body;

    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error attaching payment method:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;
