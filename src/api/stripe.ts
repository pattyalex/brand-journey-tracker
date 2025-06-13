
// Client-side Stripe service that calls our backend endpoints

export const createPaymentIntent = async (amount: number, currency: string = 'usd') => {
  const response = await fetch('/api/create-payment-intent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amount * 100, // Convert to cents
      currency,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create payment intent');
  }

  return response.json();
};

export const createCustomer = async (email: string, name: string) => {
  const response = await fetch('/api/create-customer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      name,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create customer');
  }

  return response.json();
};

export const createSubscription = async (customerId: string, priceId: string) => {
  const response = await fetch('/api/create-subscription', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customerId,
      priceId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create subscription');
  }

  return response.json();
};

export const getSubscription = async (customerId: string) => {
  const response = await fetch(`/api/subscription?customerId=${customerId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get subscription');
  }

  return response.json();
};

export const cancelSubscription = async (subscriptionId: string) => {
  const response = await fetch(`/api/subscription/${subscriptionId}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to cancel subscription');
  }

  return response.json();
};

export const updateSubscription = async (subscriptionId: string, priceId: string) => {
  const response = await fetch(`/api/subscription/${subscriptionId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      priceId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to update subscription');
  }

  return response.json();
};
