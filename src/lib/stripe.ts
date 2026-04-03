
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '@/lib/supabase';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export { stripePromise };

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Not authenticated');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
  };
}

// Stripe service functions
export const StripeService = {
  // Create a payment intent
  async createPaymentIntent(amount: number, currency: string = 'usd') {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          amount: amount * 100, // Convert to cents
          currency,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },

  // Create a customer
  async createCustomer(email: string, name: string) {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/create-customer', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email,
          name,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create customer');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  },

  // Create a subscription
  async createSubscription(customerId: string, priceId: string) {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          customerId,
          priceId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create subscription');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  },
};
