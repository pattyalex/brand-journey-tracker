/**
 * Run this script once to set up your Stripe products and prices
 * Usage: node server/setup-stripe-products.cjs
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const Stripe = require('stripe');

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY not found in .env file');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function setupStripeProducts() {
  try {
    console.log('🚀 Setting up Stripe products and prices...\n');

    // Create the main product
    const product = await stripe.products.create({
      name: 'HeyMegan Pro',
      description: 'AI-powered workspace for content creators',
      metadata: {
        app: 'heymegan',
        plan_type: 'pro'
      }
    });

    console.log('✅ Product created:', product.id);
    console.log('   Name:', product.name);
    console.log('');

    // Create Monthly Price
    const monthlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: 1700, // $17.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
        trial_period_days: 7
      },
      metadata: {
        plan_name: 'Monthly Plan',
        billing_period: 'monthly'
      }
    });

    console.log('✅ Monthly Price created:', monthlyPrice.id);
    console.log('   Amount: $17.00/month');
    console.log('   Trial: 7 days');
    console.log('');

    // Create Annual Price
    const annualPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: 16800, // $168.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'year',
        trial_period_days: 7
      },
      metadata: {
        plan_name: 'Annual Plan',
        billing_period: 'annual',
        monthly_equivalent: '$14.00'
      }
    });

    console.log('✅ Annual Price created:', annualPrice.id);
    console.log('   Amount: $168.00/year ($14/month)');
    console.log('   Trial: 7 days');
    console.log('');

    // Output the IDs for use in your app
    console.log('📋 SAVE THESE IDS - Add them to your .env file:\n');
    console.log(`STRIPE_PRODUCT_ID=${product.id}`);
    console.log(`STRIPE_PRICE_MONTHLY=${monthlyPrice.id}`);
    console.log(`STRIPE_PRICE_ANNUAL=${annualPrice.id}`);
    console.log('');

    console.log('✅ Setup complete! Add the above environment variables to your .env file.');

    return {
      productId: product.id,
      monthlyPriceId: monthlyPrice.id,
      annualPriceId: annualPrice.id
    };
  } catch (error) {
    console.error('❌ Error setting up Stripe products:', error.message);
    throw error;
  }
}

// Run the setup
setupStripeProducts()
  .then(() => {
    console.log('');
    console.log('🎉 All done! Your Stripe products are ready to use.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
