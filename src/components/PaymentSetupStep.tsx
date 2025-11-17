import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import { StripePaymentForm } from './StripePaymentForm';

interface PaymentSetupStepProps {
  user: {
    id: string;
    primaryEmailAddress?: { emailAddress: string } | null;
    fullName?: string | null;
    firstName?: string | null;
  };
  onSuccess: () => void;
  onBack: () => void;
}

export const PaymentSetupStep: React.FC<PaymentSetupStepProps> = ({ user, onSuccess, onBack }) => {
  const [billingPlan, setBillingPlan] = useState<'monthly' | 'annual'>('monthly');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const handleContinue = () => {
    if (!termsAccepted) {
      alert('Please accept the terms and conditions to continue');
      return;
    }
    setShowPaymentForm(true);
  };

  if (showPaymentForm) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Enter payment information</CardTitle>
          <CardDescription>
            You won't be charged today. After 7 days, your trial will convert into a paid subscription.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Temporary skip button for development */}
          <Button
            onClick={onSuccess}
            variant="outline"
            className="w-full"
          >
            Skip Payment (Development)
          </Button>

          <Elements stripe={stripePromise}>
            <StripePaymentForm
              billingPlan={billingPlan}
              onSuccess={onSuccess}
              onBack={() => setShowPaymentForm(false)}
              userId={user.id}
              userEmail={user.primaryEmailAddress?.emailAddress || ''}
              userName={user.fullName || user.firstName || 'User'}
            />
          </Elements>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Select your plan</CardTitle>
        <CardDescription>
          You won't be charged today. After 7 days, your trial will convert into a paid subscription.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Plan Selection */}
        <div className="space-y-3">
          <Label>Select a Plan</Label>
          <RadioGroup value={billingPlan} onValueChange={(value) => setBillingPlan(value as 'monthly' | 'annual')}>
            <div className="flex items-start space-x-2 border rounded-md p-4 hover:bg-muted/50 transition-colors cursor-pointer">
              <RadioGroupItem value="monthly" id="monthly" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="monthly" className="font-medium text-lg cursor-pointer">
                  Monthly Plan
                </Label>
                <p className="text-muted-foreground text-sm mt-1">
                  $17 per month, billed monthly
                </p>
                <div className="mt-2">
                  <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">
                    Most popular
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-2 border rounded-md p-4 hover:bg-muted/50 transition-colors cursor-pointer">
              <RadioGroupItem value="annual" id="annual" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="annual" className="font-medium text-lg cursor-pointer">
                  Annual Plan
                </Label>
                <p className="text-muted-foreground text-sm mt-1">
                  $14 per month, billed annually ($168)
                </p>
                <div className="mt-2">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                    Save 18%
                  </span>
                </div>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Accepted Payment Methods */}
        <div className="flex items-center justify-center gap-2">
          <svg className="h-6 w-6 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4,4h16c1.1,0,2,0.9,2,2v12c0,1.1-0.9,2-2,2H4c-1.1,0-2-0.9-2-2V6C2,4.9,2.9,4,4,4z" />
          </svg>
          <svg className="h-6 w-6 text-muted-foreground" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="#EB001B" opacity="0.6" />
            <circle cx="12" cy="12" r="10" fill="#F79E1B" opacity="0.6" style={{ transform: 'translateX(4px)' }} />
          </svg>
          <svg className="h-6 w-6 text-muted-foreground" viewBox="0 0 24 24">
            <path d="M22,12c0,5.5-4.5,10-10,10S2,17.5,2,12S6.5,2,12,2S22,6.5,22,12z" fill="#006FCF" opacity="0.6" />
          </svg>
          <svg className="h-6 w-6 text-muted-foreground" viewBox="0 0 24 24">
            <path d="M2.5,10.5l2,-4.5h15l2,4.5" fill="#FF5F00" opacity="0.6" />
            <path d="M2.5,10.5v5.5h19v-5.5" fill="#EB001B" opacity="0.6" />
          </svg>
        </div>

        {/* Terms and Conditions */}
        <div className="flex items-start space-x-3">
          <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(checked as boolean)} />
          <div className="space-y-1 leading-none">
            <label htmlFor="terms" className="text-sm font-medium leading-none cursor-pointer">
              I agree to the{' '}
              <a href="#" className="text-primary hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-primary hover:underline">
                Privacy Policy
              </a>
            </label>
            <p className="text-sm text-muted-foreground">
              Your card will not be charged until after your 7-day trial ends.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center">
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
          <Button onClick={handleContinue} className="flex-1 ml-4" disabled={!termsAccepted}>
            Continue to Payment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
