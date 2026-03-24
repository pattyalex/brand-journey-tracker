import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, Calendar, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface SubscriptionData {
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  plan_type: string | null;
  is_on_trial: boolean | null;
  trial_ends_at: string | null;
}

export const MembershipPage: React.FC = () => {
  const { user, isAuthLoaded } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (!isAuthLoaded) return;
    if (user) {
      fetchSubscriptionData();
    } else {
      setLoading(false);
    }
  }, [user, isAuthLoaded]);

  // Timeout fallback — never spin forever
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) setLoading(false);
    }, 3000);
    return () => clearTimeout(timeout);
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('stripe_customer_id, stripe_subscription_id, subscription_status, plan_type, is_on_trial, trial_ends_at')
        .eq('id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching subscription data:', error);
      } else {
        console.log('Subscription data from Supabase:', data);
        setSubscriptionData(data);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const syncSubscriptionFromStripe = async () => {
    if (!subscriptionData?.stripe_customer_id) {
      alert('No Stripe customer ID found. Please complete onboarding first.');
      return;
    }

    setLoading(true);
    try {
      // Fetch fresh subscription data from Stripe via our API
      const response = await fetch('http://localhost:3001/api/get-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: subscriptionData.stripe_customer_id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscription from Stripe');
      }

      const { subscription } = await response.json();

      if (subscription) {
        // Update Supabase with the subscription data
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            stripe_subscription_id: subscription.id,
            subscription_status: subscription.status,
            plan_type: subscription.items.data[0]?.price.recurring?.interval === 'year' ? 'annual' : 'monthly',
            is_on_trial: subscription.status === 'trialing',
            trial_ends_at: subscription.trial_end
              ? new Date(subscription.trial_end * 1000).toISOString()
              : null,
          })
          .eq('id', user?.id);

        if (updateError) {
          console.error('Failed to update profile:', updateError);
          alert('Failed to sync subscription data');
        } else {
          alert('Subscription synced successfully!');
          await fetchSubscriptionData();
        }
      }
    } catch (error) {
      console.error('Error syncing subscription:', error);
      alert('Failed to sync subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      // Create a Stripe billing portal session
      const response = await fetch('http://localhost:3001/api/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: subscriptionData?.stripe_customer_id,
          returnUrl: window.location.origin + '/home-page'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error opening billing portal:', error);
      alert('Failed to open billing portal. Please try again.');
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <h2 className="text-xl font-semibold">Log in to manage your membership</h2>
        <p className="text-muted-foreground">Please log in to view your subscription details or resubscribe.</p>
        <a href="/login" className="py-3 px-6 rounded-lg bg-purple-600 text-white font-medium hover:opacity-90 transition-opacity">
          Log in
        </a>
      </div>
    );
  }

  if (!subscriptionData?.stripe_subscription_id || subscriptionData?.subscription_status === 'canceled') {
    const isCancelled = subscriptionData?.subscription_status === 'canceled' || subscriptionData?.stripe_customer_id;
    return (
      <Card>
        <CardHeader>
          <CardTitle>{isCancelled ? 'Subscription Ended' : 'No Active Subscription'}</CardTitle>
          <CardDescription>
            {isCancelled
              ? 'Your subscription has been cancelled. Your data is being kept for 90 days.'
              : 'You don\'t have an active subscription yet.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {isCancelled
              ? 'Resubscribe to regain access to all your content and features.'
              : 'Start your 14-day free trial to access all features.'}
          </p>
          <Button onClick={() => window.location.href = '/onboarding?step=payment-setup'} className="w-full">
            {isCancelled ? 'Resubscribe' : 'Start Free Trial'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'trialing':
        return <Badge className="bg-blue-500">Trial</Badge>;
      case 'past_due':
        return <Badge variant="destructive">Past Due</Badge>;
      case 'canceled':
        return <Badge variant="secondary">Canceled</Badge>;
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Subscription Details</CardTitle>
              <CardDescription>Manage your billing and subscription</CardDescription>
            </div>
            {getStatusBadge(subscriptionData.subscription_status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Plan */}
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Current Plan</p>
              <p className="text-lg font-semibold capitalize">
                {subscriptionData.plan_type === 'annual' ? 'Annual Plan' : 'Monthly Plan'}
              </p>
              <p className="text-sm text-muted-foreground">
                {subscriptionData.plan_type === 'annual'
                  ? '$168/year ($14/month)'
                  : '$17/month'}
              </p>
            </div>
          </div>

          {/* Trial Information */}
          {subscriptionData.is_on_trial && subscriptionData.trial_ends_at && (
            <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Trial Period Active
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Your trial ends on {formatDate(subscriptionData.trial_ends_at)}.
                  You won't be charged until then.
                </p>
              </div>
            </div>
          )}

          {/* Billing Period */}
          {subscriptionData.trial_ends_at && !subscriptionData.is_on_trial && (
            <div className="flex items-start gap-4">
              <div className="p-2 bg-muted rounded-lg">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Next Billing Date</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(subscriptionData.trial_ends_at)}
                </p>
              </div>
            </div>
          )}

          {/* Manage Billing Button */}
          <div className="pt-4 border-t">
            <Button
              onClick={handleManageBilling}
              disabled={portalLoading}
              className="w-full"
            >
              {portalLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Opening Billing Portal...
                </>
              ) : (
                'Manage Billing & Payment Methods'
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Update payment method, view invoices, or cancel subscription
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Need Help?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            If you have any questions about your subscription or need assistance,
            please contact our support team.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
