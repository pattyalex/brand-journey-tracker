import React, { useState } from 'react';
import { CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lock, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface StripePaymentFormProps {
  billingPlan: 'monthly' | 'annual';
  onSuccess: () => void;
  onBack: () => void;
  userId: string;
  userEmail: string;
  userName: string;
  hasUsedTrial?: boolean;
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#1a1523',
      fontFamily: "'DM Sans', sans-serif",
      fontSmoothing: 'antialiased',
      fontSize: '15px',
      '::placeholder': {
        color: '#9ca3af',
      },
      lineHeight: '24px',
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444',
    },
  },
  disableLink: true,
};

export const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  billingPlan,
  onSuccess,
  onBack,
  userId,
  userEmail,
  userName,
  hasUsedTrial = false,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardholderName, setCardholderName] = useState('');

  const fetchWithTimeout = async (url: string, options: RequestInit, ms = 15000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), ms);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      return res;
    } finally {
      clearTimeout(id);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setError('Stripe has not loaded yet. Please wait a moment and try again.');
      return;
    }

    setLoading(true);
    setError(null);

    let succeeded = false;

    try {
      const cardNumberElement = elements.getElement(CardNumberElement);
      if (!cardNumberElement) {
        throw new Error('Card element not found');
      }

      // Check price IDs are configured
      const priceId = billingPlan === 'annual'
        ? import.meta.env.VITE_STRIPE_PRICE_ANNUAL
        : import.meta.env.VITE_STRIPE_PRICE_MONTHLY;

      if (!priceId) {
        throw new Error('Payment configuration error: price ID not set. Please contact support.');
      }

      // Use session from auth context (already loaded, no network call needed)
      if (!session) {
        throw new Error('Not authenticated. Please log in and try again.');
      }

      console.log('Creating Stripe customer...');
      // Step 1: Create Stripe customer
      const customerResponse = await fetchWithTimeout('/api/create-customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
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
      const pmResult = await Promise.race([
        stripe.createPaymentMethod({
          type: 'card',
          card: cardNumberElement,
          billing_details: {
            name: cardholderName || userName,
            email: userEmail,
          },
        }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Payment method creation timed out')), 15000))
      ]);
      const { error: pmError, paymentMethod } = pmResult as Awaited<ReturnType<typeof stripe.createPaymentMethod>>;

      if (pmError) {
        throw new Error(pmError.message || 'Failed to create payment method');
      }

      console.log('Payment method created:', paymentMethod!.id);

      // Step 3: Attach payment method to customer
      console.log('Attaching payment method to customer...');
      const attachResponse = await fetchWithTimeout('/api/attach-payment-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod!.id,
          customerId: customerId,
        }),
      });

      if (!attachResponse.ok) {
        const errorText = await attachResponse.text();
        throw new Error(`Failed to attach payment method: ${errorText}`);
      }

      console.log('Payment method attached successfully');

      // Step 4: Create subscription with trial
      console.log('Creating subscription with price:', priceId);
      const subscriptionResponse = await fetchWithTimeout('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          customerId: customerId,
          priceId: priceId,
          paymentMethodId: paymentMethod!.id,
          trialPeriodDays: hasUsedTrial ? 0 : 14,
        }),
      });

      if (!subscriptionResponse.ok) {
        const errorText = await subscriptionResponse.text();
        throw new Error(`Failed to create subscription: ${errorText}`);
      }

      const { subscription } = await subscriptionResponse.json();
      console.log('Subscription created:', subscription.id);

      // Step 5: Update user profile in Supabase
      // If user already used their trial, force is_on_trial=false regardless of Stripe response
      const isTrialing = hasUsedTrial ? false : subscription.status === 'trialing';
      const trialEnd = hasUsedTrial ? null : (subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null);
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          subscription_status: hasUsedTrial ? 'active' : subscription.status,
          plan_type: billingPlan,
          is_on_trial: isTrialing,
          trial_ends_at: trialEnd,
          has_used_trial: true,
        })
        .eq('id', userId);

      // Record email in trial_history to prevent trial reuse after account deletion
      if (!hasUsedTrial) {
        supabase.from('trial_history').upsert({ email: userEmail }, { onConflict: 'email' }).then(({ error: thError }) => {
          if (thError) console.error('Failed to record trial history:', thError);
        });
      }

      if (updateError) {
        console.error('Failed to update profile:', updateError);
        // Don't throw - subscription was created successfully
      }

      console.log('✅ Payment setup completed successfully!');

      // Send confirmation email for resubscribes
      if (hasUsedTrial) {
        try {
          await fetch('/api/send-resubscription-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              email: userEmail,
              name: userName,
              planType: billingPlan,
            }),
          });
        } catch (emailErr) {
          console.error('Failed to send resubscription email:', emailErr);
        }
      }

      succeeded = true;
      onSuccess();
    } catch (err: any) {
      console.error('Payment error:', err);
      if (err?.name === 'AbortError' || err?.message?.includes('timed out') || err?.message?.includes('timeout')) {
        setError('Request timed out. Please check your connection and try again.');
      } else {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
      }
    } finally {
      if (!succeeded) {
        setLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <Alert variant="destructive" className="mb-5">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Cardholder Name */}
      <div className="space-y-1.5">
        <label
          htmlFor="cardholder-name"
          className="text-sm font-medium"
          style={{ color: '#1a1523' }}
        >
          Cardholder Name
        </label>
        <input
          id="cardholder-name"
          type="text"
          placeholder="Name on card"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          required
          className="w-full px-3.5 py-2.5 rounded-lg border transition-all outline-none text-sm"
          style={{
            borderColor: '#e5e5e5',
            color: '#1a1523',
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = '#8B7082'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#e5e5e5'}
        />
      </div>

      {/* Card Number */}
      <div className="space-y-1.5">
        <label
          className="text-sm font-medium"
          style={{ color: '#1a1523' }}
        >
          Card Number
        </label>
        <div
          className="w-full px-3.5 py-2.5 rounded-lg border transition-all"
          style={{ borderColor: '#e5e5e5' }}
        >
          <CardNumberElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>

      {/* Expiry and CVC Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label
            className="text-sm font-medium"
            style={{ color: '#1a1523' }}
          >
            Expiration Date
          </label>
          <div
            className="w-full px-3.5 py-2.5 rounded-lg border transition-all"
            style={{ borderColor: '#e5e5e5' }}
          >
            <CardExpiryElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            className="text-sm font-medium"
            style={{ color: '#1a1523' }}
          >
            CVC
          </label>
          <div
            className="w-full px-3.5 py-2.5 rounded-lg border transition-all"
            style={{ borderColor: '#e5e5e5' }}
          >
            <CardCvcElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>
      </div>

      {/* Test Card Info */}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-gray-100 disabled:opacity-50"
          style={{ color: '#6b6478' }}
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
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 py-3.5 rounded-xl text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #7a3868 0%, #612a4f 50%, #4e2040 100%)',
            boxShadow: '0 4px 12px rgba(97, 42, 79, 0.25)'
          }}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            hasUsedTrial ? 'Subscribe Now' : 'Start 14-Day Free Trial'
          )}
        </button>
      </div>

      {/* Security trust bar */}
      <div className="flex items-center justify-center gap-4 pt-3 pb-1">
        <div className="flex items-center gap-1.5 text-xs" style={{ color: '#8B7082' }}>
          <Lock size={13} strokeWidth={2.5} />
          <span>Encrypted & secure</span>
        </div>
        <div className="w-px h-3" style={{ backgroundColor: '#E8E4E6' }} />
        <div className="flex items-center gap-1.5 text-xs" style={{ color: '#8B7082' }}>
          <ShieldCheck size={13} strokeWidth={2.5} />
          <span>PCI-compliant payments</span>
        </div>
      </div>
    </form>
  );
};
