import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import { StripePaymentForm } from './StripePaymentForm';
import { Check, Shield, Zap, ChevronLeft } from 'lucide-react';

interface PaymentSetupStepProps {
  user: {
    id: string;
    primaryEmailAddress?: { emailAddress: string } | null;
    fullName?: string | null;
    firstName?: string | null;
  };
  showPaymentForm?: boolean;
  onContinueToPayment?: () => void;
  onSuccess?: () => void;
  onBack?: () => void;
}

export const PaymentSetupStep: React.FC<PaymentSetupStepProps> = ({
  user,
  showPaymentForm = false,
  onContinueToPayment,
  onSuccess,
  onBack
}) => {
  const [billingPlan, setBillingPlan] = useState<'monthly' | 'annual'>('annual');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleContinue = () => {
    if (!termsAccepted) {
      alert('Please accept the terms and conditions to continue');
      return;
    }
    if (onContinueToPayment) {
      onContinueToPayment();
    }
  };

  // Brand gradient style
  const brandGradient = 'linear-gradient(135deg, #7a3868 0%, #612a4f 50%, #4e2040 100%)';

  // Payment Entry View
  if (showPaymentForm) {
    return (
      <div className="w-full max-w-lg mx-auto" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: '#ffffff',
            boxShadow: '0 25px 60px -12px rgba(97, 42, 79, 0.15), 0 0 0 1px rgba(139, 112, 130, 0.08)'
          }}
        >
          <div className="p-8">
            <h2 className="text-2xl font-normal mb-2" style={{ color: '#1a1523', fontFamily: "'Instrument Serif', serif" }}>
              Enter payment details
            </h2>
            <p className="text-sm mb-6" style={{ color: '#6b6478' }}>
              Your card won't be charged until your 7-day free trial ends.
            </p>

            {/* Temporary skip button for development */}
            <Button
              onClick={onSuccess}
              variant="outline"
              className="w-full mb-4"
            >
              Skip Payment (Development)
            </Button>

            <Elements stripe={stripePromise}>
              <StripePaymentForm
                billingPlan={billingPlan}
                onSuccess={onSuccess || (() => {})}
                onBack={onBack || (() => {})}
                userId={user.id}
                userEmail={user.primaryEmailAddress?.emailAddress || ''}
                userName={user.fullName || user.firstName || 'User'}
              />
            </Elements>
          </div>
        </div>
      </div>
    );
  }

  // Plan Selection View
  return (
    <div className="w-full max-w-lg mx-auto" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div
        className="rounded-3xl overflow-hidden"
        style={{
          background: '#ffffff',
          boxShadow: '0 25px 60px -12px rgba(97, 42, 79, 0.15), 0 0 0 1px rgba(139, 112, 130, 0.08)'
        }}
      >
        {/* Header Section */}
        <div className="px-8 pt-8 pb-6 text-center">
          <h2 className="text-2xl font-normal mb-2" style={{ color: '#1a1523', fontFamily: "'Instrument Serif', serif" }}>
            Select your plan
          </h2>
          <p className="text-sm" style={{ color: '#6b6478' }}>
            Start your 7-day free trial. Cancel anytime.
          </p>
        </div>

        <div className="px-8 pb-8">
          {/* Plan Selection */}
          <div className="space-y-3 mb-6">
            {/* Annual Plan - Recommended */}
            <button
              type="button"
              onClick={() => setBillingPlan('annual')}
              className="w-full text-left rounded-2xl p-5 transition-all relative"
              style={{
                background: billingPlan === 'annual'
                  ? 'linear-gradient(135deg, rgba(122, 56, 104, 0.08) 0%, rgba(97, 42, 79, 0.05) 100%)'
                  : '#fafafa',
                border: billingPlan === 'annual'
                  ? '1px solid #7a3868'
                  : '1px solid transparent',
                boxShadow: billingPlan === 'annual'
                  ? '0 4px 12px rgba(97, 42, 79, 0.1)'
                  : 'none'
              }}
            >
              {/* Best Value Badge */}
              <div
                className="absolute -top-3 left-5 px-3 py-1 rounded-full text-xs font-semibold text-white"
                style={{ background: brandGradient }}
              >
                Best Value
              </div>

              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-lg" style={{ color: '#1a1523' }}>
                      Annual Plan
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ background: '#dcfce7', color: '#166534' }}
                    >
                      Save 18%
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold" style={{ color: '#1a1523' }}>$14</span>
                    <span className="text-sm" style={{ color: '#6b6478' }}>/month</span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: '#8a7a85' }}>
                    Billed annually ($168/year)
                  </p>
                </div>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                  style={{
                    background: billingPlan === 'annual' ? brandGradient : '#e5e5e5',
                    transition: 'all 0.2s'
                  }}
                >
                  {billingPlan === 'annual' && <Check className="w-4 h-4 text-white" />}
                </div>
              </div>
            </button>

            {/* Monthly Plan */}
            <button
              type="button"
              onClick={() => setBillingPlan('monthly')}
              className="w-full text-left rounded-2xl p-5 transition-all"
              style={{
                background: billingPlan === 'monthly'
                  ? 'linear-gradient(135deg, rgba(122, 56, 104, 0.08) 0%, rgba(97, 42, 79, 0.05) 100%)'
                  : '#fafafa',
                border: billingPlan === 'monthly'
                  ? '1px solid #7a3868'
                  : '1px solid transparent',
                boxShadow: billingPlan === 'monthly'
                  ? '0 4px 12px rgba(97, 42, 79, 0.1)'
                  : 'none'
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <span className="font-semibold text-lg block mb-1" style={{ color: '#1a1523' }}>
                    Monthly Plan
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold" style={{ color: '#1a1523' }}>$17</span>
                    <span className="text-sm" style={{ color: '#6b6478' }}>/month</span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: '#8a7a85' }}>
                    Billed monthly
                  </p>
                </div>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                  style={{
                    background: billingPlan === 'monthly' ? brandGradient : '#e5e5e5',
                    transition: 'all 0.2s'
                  }}
                >
                  {billingPlan === 'monthly' && <Check className="w-4 h-4 text-white" />}
                </div>
              </div>
            </button>
          </div>

          {/* Trial notice */}
          <p className="text-center text-sm mb-6" style={{ color: '#8a7a85' }}>
            Your card won't be charged until after your 7-day trial.
          </p>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex items-center gap-1.5 text-xs" style={{ color: '#8a7a85' }}>
              <Shield className="w-4 h-4" />
              <span>Secure payment</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: '#8a7a85' }}>
              <Zap className="w-4 h-4" />
              <span>Cancel anytime</span>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
              style={{
                borderColor: termsAccepted ? '#7a3868' : undefined,
                backgroundColor: termsAccepted ? '#7a3868' : undefined
              }}
            />
            <label htmlFor="terms" className="text-sm cursor-pointer" style={{ color: '#4d3e48' }}>
              I agree to the{' '}
              <a href="/terms" className="font-medium hover:underline" style={{ color: '#612a4f' }}>
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="font-medium hover:underline" style={{ color: '#612a4f' }}>
                Privacy Policy
              </a>
            </label>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleContinue}
            disabled={!termsAccepted}
            className="w-full py-3.5 rounded-xl text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: termsAccepted ? brandGradient : '#d1d5db',
              boxShadow: termsAccepted ? '0 4px 12px rgba(97, 42, 79, 0.25)' : 'none'
            }}
          >
            Continue to Payment
          </button>
        </div>
      </div>
    </div>
  );
};
