
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// For webhook signature verification, we need raw body
app.use('/webhook', express.raw({ type: 'application/json' }));

// API endpoints
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
    });

    res.send({
      client_secret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).send({ error: error.message });
  }
});

app.post('/api/create-customer', async (req, res) => {
  try {
    const { email, name } = req.body;

    const customer = await stripe.customers.create({
      email,
      name,
    });

    res.send(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).send({ error: error.message });
  }
});

app.post('/api/create-subscription', async (req, res) => {
  try {
    const { customerId, priceId } = req.body;

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    res.send({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).send({ error: error.message });
  }
});

app.get('/api/subscription', async (req, res) => {
  try {
    // In a real app, you'd get the customer ID from the authenticated user
    const { customerId } = req.query;
    
    if (!customerId) {
      return res.status(400).send({ error: 'Customer ID required' });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
    });

    const subscription = subscriptions.data[0]; // Get the first subscription
    res.send({ subscription });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).send({ error: error.message });
  }
});

app.post('/api/subscription/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    
    const subscription = await stripe.subscriptions.update(id, {
      cancel_at_period_end: true,
    });

    res.send(subscription);
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).send({ error: error.message });
  }
});

app.patch('/api/subscription/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { priceId } = req.body;

    const subscription = await stripe.subscriptions.retrieve(id);
    
    const updatedSubscription = await stripe.subscriptions.update(id, {
      items: [{
        id: subscription.items.data[0].id,
        price: priceId,
      }],
    });

    res.send(updatedSubscription);
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).send({ error: error.message });
  }
});

// Webhook endpoint for Stripe events
app.post('/webhook', (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful!');
      // Handle successful payment
      break;
    case 'customer.subscription.created':
      const subscription = event.data.object;
      console.log('Subscription created:', subscription.id);
      // Handle new subscription
      break;
    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object;
      console.log('Subscription cancelled:', deletedSubscription.id);
      // Handle cancelled subscription
      break;
    case 'invoice.payment_succeeded':
      const invoice = event.data.object;
      console.log('Invoice payment succeeded:', invoice.id);
      // Handle successful payment
      break;
    case 'invoice.payment_failed':
      const failedInvoice = event.data.object;
      console.log('Invoice payment failed:', failedInvoice.id);
      // Handle failed payment
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Stripe server running on port ${PORT}`);
});
