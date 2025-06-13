
// This would typically be in a backend service, but for demo purposes
// we'll create the structure here. In production, move this to a secure backend.

const STRIPE_SECRET_KEY = import.meta.env.STRIPE_SECRET_KEY;

// Note: This is a client-side example. In production, these should be server-side endpoints
export const createPaymentIntent = async (amount: number, currency: string = 'usd') => {
  // This should be called from your backend server
  const response = await fetch('https://api.stripe.com/v1/payment_intents', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      amount: (amount * 100).toString(),
      currency,
    }),
  });

  return response.json();
};

export const createCustomer = async (email: string, name: string) => {
  const response = await fetch('https://api.stripe.com/v1/customers', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      email,
      name,
    }),
  });

  return response.json();
};

export const createSubscription = async (customerId: string, priceId: string) => {
  const response = await fetch('https://api.stripe.com/v1/subscriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      customer: customerId,
      'items[0][price]': priceId,
    }),
  });

  return response.json();
};
