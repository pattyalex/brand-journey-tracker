import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface StripePaymentFormProps {
  billingPlan: 'monthly' | 'annual';
  onSuccess: () => void;
  onBack: () => void;
  userId: string;
  userEmail: string;
  userName: string;
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
};

export const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  billingPlan,
  onSuccess,
  onBack,
  userId,
  userEmail,
  userName,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setError('Stripe has not loaded yet. Please wait a moment and try again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      console.log('Creating Stripe customer...');
      // Step 1: Create Stripe customer
      const customerResponse = await fetch('http://localhost:3001/api/create-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          name: userName,
          userId: userId,
        }),
      });

      if (!customerResponse.ok) {
        const errorText = await customerResponse.text();
        throw new Error(`Failed to create customer: ${errorText}`);
      }

      const { customerId } = await customerResponse.json();
      console.log('Customer created:', customerId);

      // Step 2: Create payment method
      console.log('Creating payment method...');
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: userName,
          email: userEmail,
        },
      });

      if (pmError) {
        throw new Error(pmError.message || 'Failed to create payment method');
      }

      console.log('Payment method created:', paymentMethod.id);

      // Step 3: Attach payment method to customer
      console.log('Attaching payment method to customer...');
      const attachResponse = await fetch('http://localhost:3001/api/attach-payment-method', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          customerId: customerId,
        }),
      });

      if (!attachResponse.ok) {
        const errorText = await attachResponse.text();
        throw new Error(`Failed to attach payment method: ${errorText}`);
      }

      console.log('Payment method attached successfully');

      // Step 4: Create subscription with trial
      const priceId = billingPlan === 'annual'
        ? import.meta.env.VITE_STRIPE_PRICE_ANNUAL
        : import.meta.env.VITE_STRIPE_PRICE_MONTHLY;

      console.log('Creating subscription with price:', priceId);
      const subscriptionResponse = await fetch('http://localhost:3001/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customerId,
          priceId: priceId,
          paymentMethodId: paymentMethod.id,
        }),
      });

      if (!subscriptionResponse.ok) {
        const errorText = await subscriptionResponse.text();
        throw new Error(`Failed to create subscription: ${errorText}`);
      }

      const { subscription } = await subscriptionResponse.json();
      console.log('Subscription created:', subscription.id);

      // Step 5: Update user profile in Supabase
      const { supabase } = await import('@/lib/supabase');
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          subscription_status: subscription.status,
          plan_type: billingPlan,
          is_on_trial: subscription.status === 'trialing',
          trial_ends_at: subscription.trial_end
            ? new Date(subscription.trial_end * 1000).toISOString()
            : null,
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Failed to update profile:', updateError);
        // Don't throw - subscription was created successfully
      }

      console.log('✅ Payment setup completed successfully!');
      onSuccess();
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Card Information
        </label>
        <div className="border rounded-md p-3 bg-background">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
        <p className="text-sm text-muted-foreground">
          Test card: 4242 4242 4242 4242 • Any future date • Any 3 digits
        </p>
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          disabled={loading}
          className="flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-1"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back
        </Button>
        <Button type="submit" className="flex-1 ml-4" disabled={!stripe || loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Start 7-Day Free Trial'
          )}
        </Button>
      </div>
    </form>
  );
};
