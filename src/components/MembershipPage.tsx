import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, Calendar, AlertCircle, ArrowLeft, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '@/lib/api-base';

interface SubscriptionData {
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  plan_type: string | null;
  is_on_trial: boolean | null;
  trial_ends_at: string | null;
  has_used_trial: boolean | null;
}

export const MembershipPage: React.FC = () => {
  const { user, isAuthLoaded } = useAuth();
  const navigate = useNavigate();
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
        .select('stripe_customer_id, stripe_subscription_id, subscription_status, plan_type, is_on_trial, trial_ends_at, has_used_trial')
        .eq('id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching subscription data:', error);
      } else {
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
      const response = await fetch(`${API_BASE}/api/get-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: subscriptionData.stripe_customer_id })
      });

      if (!response.ok) throw new Error('Failed to fetch subscription from Stripe');

      const { subscription } = await response.json();

      if (subscription) {
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
      const response = await fetch(`${API_BASE}/api/create-portal-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: subscriptionData?.stripe_customer_id,
          returnUrl: window.location.origin + '/production'
        })
      });

      if (!response.ok) throw new Error('Failed to create portal session');

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error opening billing portal:', error);
      alert('Failed to open billing portal. Please try again.');
      setPortalLoading(false);
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

  const getStatusConfig = (status: string | null) => {
    switch (status) {
      case 'active':
        return { label: 'Active', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' };
      case 'trialing':
        return { label: 'Trial', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' };
      case 'past_due':
        return { label: 'Past Due', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' };
      case 'canceled':
        return { label: 'Cancelled', bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };
      default:
        return { label: status || 'Unknown', bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f9f7f5' }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#612a4f' }} />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen" style={{ background: '#f9f7f5', fontFamily: "'DM Sans', sans-serif" }}>
        <div
          className="relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #7a3868 0%, #612a4f 50%, #4e2040 100%)' }}
        >
          <div className="max-w-2xl mx-auto px-6 md:px-8 py-12 md:py-16 text-center">
            <h1
              className="text-3xl md:text-4xl text-white mb-3"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
            >
              Membership
            </h1>
            <p className="text-white/60 text-sm">Manage your HeyMeg subscription</p>
          </div>
        </div>
        <div className="max-w-md mx-auto px-6 md:px-8 py-12 text-center">
          <div
            className="bg-white/80 rounded-[20px] p-8"
            style={{
              boxShadow: '0 4px 24px rgba(45, 42, 38, 0.04)',
              border: '1px solid rgba(139, 115, 130, 0.06)',
            }}
          >
            <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: 'rgba(97, 42, 79, 0.08)' }}>
              <CreditCard className="w-6 h-6" style={{ color: '#612a4f' }} />
            </div>
            <h2
              className="text-xl mb-2"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, color: '#2d2a26' }}
            >
              Log in to continue
            </h2>
            <p className="text-sm mb-6" style={{ color: '#8B7082' }}>
              Please log in to view your subscription details or resubscribe.
            </p>
            <a
              href="/login"
              className="inline-block w-full py-3 px-6 rounded-xl text-white font-medium text-sm transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #7a3868 0%, #612a4f 50%, #4e2040 100%)' }}
            >
              Log in
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Active subscription — go to dashboard (manage membership via Settings)
  if (subscriptionData?.subscription_status === 'active' || subscriptionData?.subscription_status === 'trialing') {
    window.location.href = '/production';
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f9f7f5' }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#612a4f' }} />
      </div>
    );
  }

  // No subscription or cancelled
  if (!subscriptionData?.stripe_subscription_id || subscriptionData?.subscription_status === 'canceled') {
    const isCancelled = subscriptionData?.subscription_status === 'canceled' || !!subscriptionData?.stripe_customer_id;
    return (
      <div className={`min-h-screen ${isCancelled ? 'flex items-center justify-center' : ''}`} style={{ background: '#f9f7f5', fontFamily: "'DM Sans', sans-serif" }}>
        {!isCancelled && (
          <div
            className="relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #7a3868 0%, #612a4f 50%, #4e2040 100%)' }}
          >
            <div className="max-w-2xl mx-auto px-6 md:px-8 py-12 md:py-16 text-center">
              <h1
                className="text-3xl md:text-4xl text-white mb-3"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
              >
                Get Started
              </h1>
              <p className="text-white/60 text-sm">
                Start your journey with HeyMeg
              </p>
            </div>
          </div>
        )}
        <div className="max-w-md mx-auto px-6 md:px-8 py-12">
          <div
            className="bg-white/80 rounded-[20px] p-8 text-center"
            style={{
              boxShadow: '0 4px 24px rgba(45, 42, 38, 0.04)',
              border: '1px solid rgba(139, 115, 130, 0.06)',
            }}
          >
            <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{
              background: isCancelled ? 'linear-gradient(135deg, #7a3868 0%, #612a4f 50%, #4e2040 100%)' : 'rgba(97, 42, 79, 0.08)',
              boxShadow: isCancelled ? '0 4px 16px rgba(97, 42, 79, 0.3)' : 'none',
            }}>
              {isCancelled
                ? <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 700, color: 'white' }}>M</span>
                : <CreditCard className="w-6 h-6" style={{ color: '#612a4f' }} />
              }
            </div>
            <h2
              className="text-xl mb-2"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, color: '#2d2a26' }}
            >
              {isCancelled ? 'Subscription Ended' : 'No Active Subscription'}
            </h2>
            <p className="text-sm mb-2" style={{ color: '#8B7082' }}>
              {isCancelled
                ? 'Your subscription has been cancelled.'
                : 'You don\'t have an active subscription yet.'}
            </p>
            <p className="text-sm mb-6" style={{ color: '#4d3e48' }}>
              {isCancelled
                ? 'Resubscribe to regain access to all your content and features.'
                : subscriptionData?.has_used_trial
                  ? 'Subscribe to access all features.'
                  : 'Start your 14-day free trial to access all features.'}
            </p>
            <button
              onClick={() => window.location.href = '/onboarding?step=payment-entry'}
              className="w-full py-3 px-6 rounded-xl text-white font-medium text-sm transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #7a3868 0%, #612a4f 50%, #4e2040 100%)' }}
            >
              {isCancelled ? 'Resubscribe' : subscriptionData?.has_used_trial ? 'Subscribe Now' : 'Start Free Trial'}
            </button>
            <p className="text-xs mt-5" style={{ color: '#8B7082' }}>
              Questions? Reach out to us at{' '}
              <a href="mailto:contact@heymeg.ai" className="underline hover:no-underline" style={{ color: '#612a4f' }}>
                contact@heymeg.ai
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Active subscription view
  const statusConfig = getStatusConfig(subscriptionData.subscription_status);

  return (
    <div className="min-h-screen" style={{ background: '#f9f7f5', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #7a3868 0%, #612a4f 50%, #4e2040 100%)' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 60% 50% at 20% 80%, rgba(139, 106, 126, 0.3) 0%, transparent 60%),
              radial-gradient(ellipse 40% 60% at 80% 20%, rgba(97, 42, 79, 0.2) 0%, transparent 60%)
            `,
          }}
        />
        <div className="max-w-2xl mx-auto px-6 md:px-8 py-12 md:py-16 relative z-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/60 hover:text-white/90 transition-colors mb-8 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1
            className="text-3xl md:text-4xl text-white mb-3"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
          >
            Membership
          </h1>
          <p className="text-white/60 text-sm">Manage your subscription and billing</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 md:px-8 py-10 md:py-14 space-y-6">

        {/* Subscription Details Card */}
        <section
          className="bg-white/80 rounded-[20px] p-6 md:p-8"
          style={{
            boxShadow: '0 4px 24px rgba(45, 42, 38, 0.04)',
            border: '1px solid rgba(139, 115, 130, 0.06)',
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-lg"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, color: '#2d2a26' }}
            >
              Subscription Details
            </h2>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
              {statusConfig.label}
            </span>
          </div>

          <div className="space-y-5">
            {/* Current Plan */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(97, 42, 79, 0.08)' }}>
                <CreditCard className="w-5 h-5" style={{ color: '#612a4f' }} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium uppercase tracking-wide" style={{ color: '#8B7082' }}>Current Plan</p>
                <p className="text-base font-semibold capitalize" style={{ color: '#2d2a26' }}>
                  {subscriptionData.plan_type === 'annual' ? 'Annual Plan' : 'Monthly Plan'}
                </p>
              </div>
              <p className="text-sm font-semibold" style={{ color: '#2d2a26' }}>
                {subscriptionData.plan_type === 'annual' ? '$168/year' : '$17/month'}
              </p>
            </div>

            {/* Trial Info */}
            {subscriptionData.is_on_trial && subscriptionData.trial_ends_at && (
              <div
                className="flex items-center gap-4 p-4 rounded-xl"
                style={{
                  background: 'linear-gradient(145deg, rgba(59, 130, 246, 0.06) 0%, rgba(59, 130, 246, 0.03) 100%)',
                  border: '1px solid rgba(59, 130, 246, 0.1)',
                }}
              >
                <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Trial Active</p>
                  <p className="text-xs text-blue-700">
                    Your trial ends on {formatDate(subscriptionData.trial_ends_at)}. You won't be charged until then.
                  </p>
                </div>
              </div>
            )}

            {/* Next Billing Date */}
            {subscriptionData.trial_ends_at && !subscriptionData.is_on_trial && (
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(97, 42, 79, 0.08)' }}>
                  <Calendar className="w-5 h-5" style={{ color: '#612a4f' }} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide" style={{ color: '#8B7082' }}>Next Billing Date</p>
                  <p className="text-sm font-medium" style={{ color: '#2d2a26' }}>
                    {formatDate(subscriptionData.trial_ends_at)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Manage Billing Card */}
        <section
          className="bg-white/80 rounded-[20px] p-6 md:p-8"
          style={{
            boxShadow: '0 4px 24px rgba(45, 42, 38, 0.04)',
            border: '1px solid rgba(139, 115, 130, 0.06)',
          }}
        >
          <h2
            className="text-lg mb-2"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, color: '#2d2a26' }}
          >
            Billing
          </h2>
          <p className="text-sm mb-5" style={{ color: '#8B7082' }}>
            Update your payment method, view invoices, or manage your subscription.
          </p>
          <button
            onClick={handleManageBilling}
            disabled={portalLoading}
            className="w-full py-3 px-6 rounded-xl text-white font-medium text-sm transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #7a3868 0%, #612a4f 50%, #4e2040 100%)' }}
          >
            {portalLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Opening Billing Portal...
              </>
            ) : (
              <>
                Manage Billing
                <ExternalLink className="w-4 h-4" />
              </>
            )}
          </button>
        </section>

        {/* Help Card */}
        <section
          className="rounded-[20px] p-6 md:p-8"
          style={{
            background: 'linear-gradient(145deg, rgba(97, 42, 79, 0.06) 0%, rgba(139, 106, 126, 0.03) 100%)',
            border: '1px solid rgba(139, 115, 130, 0.08)',
          }}
        >
          <p className="text-sm" style={{ color: '#8B7082' }}>
            Need help with your subscription? Contact us at{' '}
            <a href="mailto:contact@heymeg.ai" className="font-medium hover:underline" style={{ color: '#612a4f' }}>
              contact@heymeg.ai
            </a>
          </p>
        </section>
      </div>
    </div>
  );
};
