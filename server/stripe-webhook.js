const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create customer endpoint
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

// Attach payment method endpoint
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

// Create subscription endpoint
app.post('/api/create-subscription', async (req, res) => {
  try {
    const { customerId, priceId, paymentMethodId, trialPeriodDays = 7 } = req.body;

    // Set the payment method as default
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      default_payment_method: paymentMethodId,
      trial_period_days: trialPeriodDays,
      expand: ['latest_invoice.payment_intent'],
    });

    res.json(subscription);
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook endpoint for Stripe events
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created':
      console.log('Subscription created:', event.data.object);
      break;
    case 'customer.subscription.updated':
      console.log('Subscription updated:', event.data.object);
      break;
    case 'customer.subscription.deleted':
      console.log('Subscription canceled:', event.data.object);
      break;
    case 'invoice.payment_succeeded':
      console.log('Payment succeeded:', event.data.object);
      break;
    case 'invoice.payment_failed':
      console.log('Payment failed:', event.data.object);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Stripe server running on port ${PORT}`);
});