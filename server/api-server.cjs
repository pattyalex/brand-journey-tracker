// Load environment variables from .env file
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');

const app = express();
const port = 3001;

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('⚠️  STRIPE_SECRET_KEY not configured. Payment features will not work.');
} else {
  console.log('✅ Stripe configured successfully');
}
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

app.use(cors());
app.use(express.json());

// Clerk webhook handler for user deletion
app.post('/api/webhooks/clerk', async (req, res) => {
  try {
    const { type, data } = req.body;

    console.log('Clerk webhook received:', type);

    // Handle user deletion
    if (type === 'user.deleted') {
      const userId = data.id;
      console.log('User deleted in Clerk:', userId);

      // Import Supabase (you'll need to set this up properly)
      // For now, we'll just handle Stripe deletion

      // Find and delete Stripe customer
      const customers = await stripe.customers.list({
        limit: 100
      });

      const customer = customers.data.find(c => c.metadata.clerk_user_id === userId);

      if (customer) {
        console.log('Deleting Stripe customer:', customer.id);
        await stripe.customers.del(customer.id);
        console.log('Stripe customer deleted successfully');
      } else {
        console.log('No Stripe customer found for user:', userId);
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Create customer endpoint
app.post('/api/create-customer', async (req, res) => {
  try {
    const { email, name, userId } = req.body;

    console.log('Creating Stripe customer:', { email, name, userId });

    // Check if customer already exists with this Clerk user ID
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1
    });

    if (existingCustomers.data.length > 0) {
      console.log('Customer already exists:', existingCustomers.data[0].id);
      return res.json({ customerId: existingCustomers.data[0].id });
    }

    const customer = await stripe.customers.create({
      email: email,
      name: name,
      metadata: {
        clerk_user_id: userId // Store Clerk user ID
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
app.post('/api/attach-payment-method', async (req, res) => {
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
app.post('/api/create-subscription', async (req, res) => {
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

// Get customer by email
app.post('/api/get-customer-by-email', async (req, res) => {
  try {
    const { email } = req.body;

    console.log('Looking up customer by email:', email);

    const customers = await stripe.customers.list({
      email: email,
      limit: 1
    });

    if (customers.data.length > 0) {
      console.log('Customer found:', customers.data[0].id);
      res.json({ customerId: customers.data[0].id, customer: customers.data[0] });
    } else {
      console.log('No customer found for email');
      res.json({ customerId: null });
    }
  } catch (error) {
    console.error('Error finding customer:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get subscription for a customer
app.post('/api/get-subscription', async (req, res) => {
  try {
    const { customerId } = req.body;

    console.log('Fetching subscriptions for customer:', customerId);

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
      expand: ['data.items.data.price']
    });

    if (subscriptions.data.length > 0) {
      console.log('Subscription found:', subscriptions.data[0].id);
      res.json({ subscription: subscriptions.data[0] });
    } else {
      console.log('No subscriptions found for customer');
      res.json({ subscription: null });
    }
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create billing portal session endpoint
app.post('/api/create-portal-session', async (req, res) => {
  try {
    const { customerId, returnUrl } = req.body;

    console.log('Creating billing portal session:', { customerId, returnUrl });

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    console.log('Billing portal session created:', session.id);

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating billing portal session:', error);
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
