
const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');

const app = express();
const port = 3001;

// Initialize Stripe
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_...');

app.use(cors());
app.use(express.json());

// Create customer endpoint
app.post('/create-customer', async (req, res) => {
  try {
    const { email, name, userId } = req.body;
    
    console.log('Creating Stripe customer:', { email, name, userId });
    
    const customer = await stripe.customers.create({
      email: email,
      name: name,
      metadata: {
        supabase_user_id: userId
      }
    });
    
    console.log('Stripe customer created:', customer.id);
    
    res.json({ customerId: customer.id });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: error.message });
  }
});

// Attach payment method endpoint
app.post('/attach-payment-method', async (req, res) => {
  try {
    const { paymentMethodId, customerId } = req.body;
    
    console.log('Attaching payment method:', { paymentMethodId, customerId });
    
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
    
    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
    
    console.log('Payment method attached and set as default');
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error attaching payment method:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create subscription endpoint
app.post('/create-subscription', async (req, res) => {
  try {
    const { customerId, priceId, paymentMethodId } = req.body;
    
    console.log('Creating subscription:', { customerId, priceId, paymentMethodId });
    
    // Create subscription with trial
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      default_payment_method: paymentMethodId,
      trial_period_days: 7,
      expand: ['latest_invoice.payment_intent'],
    });
    
    console.log('Subscription created:', subscription.id);
    
    res.json({ subscription });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`API server running at http://0.0.0.0:${port}`);
});
