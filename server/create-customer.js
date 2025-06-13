
const express = require('express');
const Stripe = require('stripe');

const app = express();
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.post('/api/create-customer', async (req, res) => {
  try {
    const { email, name, metadata } = req.body;

    const customer = await stripe.customers.create({
      email,
      name,
      metadata: metadata || {},
    });

    res.json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;
