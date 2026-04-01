import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Crown, Check, FileText, Loader2, AlertTriangle, Download, ExternalLink } from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { cancelSubscription, updateSubscription, getPaymentMethod, getInvoices } from "@/api/stripe";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const MembershipSection = () => {
  const {
    subscriptionStatus, isOnTrial, trialEndsAt, hasUsedTrial,
    stripeSubscriptionId, stripeCustomerId, planType, user, refreshSubscription,
  } = useAuth();

  const [canceling, setCanceling] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showSwitchConfirm, setShowSwitchConfirm] = useState<'monthly' | 'annual' | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<{
    id: string; brand: string; last4: string; expMonth: number; expYear: number;
  } | null>(null);
  const [invoices, setInvoices] = useState<{
    id: string; date: number; amount: number; currency: string; status: string;
    invoicePdf: string | null; hostedUrl: string | null;
  }[]>([]);
  const [loadingBilling, setLoadingBilling] = useState(false);

  useEffect(() => {
    if (!stripeCustomerId) return;
    setLoadingBilling(true);
    Promise.all([
      getPaymentMethod(stripeCustomerId).catch(() => ({ paymentMethod: null })),
      getInvoices(stripeCustomerId).catch(() => ({ invoices: [] })),
    ]).then(([pmResult, invResult]) => {
      setPaymentMethod(pmResult.paymentMethod);
      setInvoices(invResult.invoices || []);
    }).finally(() => setLoadingBilling(false));
  }, [stripeCustomerId]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const daysRemaining = () => {
    if (!trialEndsAt) return 0;
    const diff = new Date(trialEndsAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const planLabel = planType === 'annual' ? 'Premium Annual' : 'Premium Monthly';
  const priceAmount = planType === 'annual' ? '$14' : '$17';
  const priceInterval = planType === 'annual' ? '/month (billed annually)' : '/month';

  const handleCancel = async () => {
    if (!stripeSubscriptionId) {
      toast.error('No active subscription found.');
      return;
    }
    setCanceling(true);
    try {
      await cancelSubscription(stripeSubscriptionId);
      // Update Supabase profile immediately so UI reflects the change
      if (user?.id) {
        await supabase.from('profiles').update({
          subscription_status: 'canceled',
          is_on_trial: false,
        }).eq('id', user.id);
      }
      await refreshSubscription();
      toast.success('Subscription canceled. You will retain access until the end of your billing period.');
    } catch (err) {
      console.error('Cancel error:', err);
      toast.error('Failed to cancel subscription. Please try again.');
    } finally {
      setCanceling(false);
      setShowCancelConfirm(false);
    }
  };

  const handleSwitchPlan = async (targetPlan: 'monthly' | 'annual') => {
    if (!stripeSubscriptionId) {
      toast.error('No active subscription found.');
      return;
    }
    const newPriceId = targetPlan === 'annual'
      ? import.meta.env.VITE_STRIPE_PRICE_ANNUAL
      : import.meta.env.VITE_STRIPE_PRICE_MONTHLY;
    if (!newPriceId) {
      toast.error('Price configuration missing.');
      return;
    }
    setSwitching(true);
    try {
      await updateSubscription(stripeSubscriptionId, newPriceId);
      if (user?.id) {
        await supabase.from('profiles').update({ plan_type: targetPlan }).eq('id', user.id);
      }
      await refreshSubscription();
      toast.success(`Switched to ${targetPlan} plan.`);
    } catch (err) {
      console.error('Switch plan error:', err);
      toast.error('Failed to switch plan. Please try again.');
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div
        className="bg-white/80 rounded-[20px] p-6"
        style={{
          boxShadow: '0 4px 24px rgba(45, 42, 38, 0.04)',
          border: '1px solid rgba(139, 115, 130, 0.06)',
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(145deg, #8b6a7e 0%, #4a3442 100%)',
              boxShadow: '0 4px 12px rgba(107, 74, 94, 0.2)',
            }}
          >
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg text-[#2d2a26]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
              Membership
            </h2>
            <p className="text-xs text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Manage your subscription
            </p>
          </div>
        </div>

        {/* Trial Banner */}
        {isOnTrial && trialEndsAt && subscriptionStatus !== 'canceled' && (
          <div
            className="p-4 rounded-xl mb-6 flex items-center justify-between"
            style={{
              background: 'linear-gradient(145deg, rgba(97, 42, 79, 0.08) 0%, rgba(74, 52, 66, 0.05) 100%)',
              border: '1px solid rgba(97, 42, 79, 0.15)',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#612a4f] animate-pulse"></div>
              <div>
                <p className="text-sm font-medium text-[#612a4f]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Free Trial Active
                </p>
                <p className="text-xs text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {daysRemaining()} days left — ends on {formatDate(trialEndsAt)}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 rounded-lg text-xs border-red-200 text-red-500 hover:bg-red-50"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
              onClick={() => setShowCancelConfirm(true)}
              disabled={canceling}
            >
              {canceling ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Cancel Trial'}
            </Button>
          </div>
        )}

        {/* Canceled Banner */}
        {subscriptionStatus === 'canceled' && (
          <div
            className="p-4 rounded-xl mb-6 flex items-center justify-between"
            style={{
              background: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.15)',
            }}
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-600" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Subscription Canceled
                </p>
                <p className="text-xs text-red-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {trialEndsAt ? `Access until ${formatDate(trialEndsAt)}` : 'Your access has ended'}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              className="h-8 px-4 rounded-lg text-xs bg-[#612a4f] hover:bg-[#4d2140] text-white"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
              onClick={() => window.location.href = '/onboarding?step=payment-setup'}
            >
              Resubscribe
            </Button>
          </div>
        )}

        {/* Past Due Banner */}
        {subscriptionStatus === 'past_due' && (
          <div
            className="p-4 rounded-xl mb-6 flex items-center justify-between"
            style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
            }}
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-700" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Payment Failed
                </p>
                <p className="text-xs text-amber-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Please update your payment method to keep your subscription active.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Current Plan */}
        {(subscriptionStatus === 'active' || subscriptionStatus === 'trialing') && (
          <div className="p-5 rounded-xl bg-[#8B7082]/5 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-[#2d2a26]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {planLabel}
                </p>
                <p className="text-2xl font-semibold text-[#612a4f] mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {priceAmount}<span className="text-sm font-normal text-[#8B7082]">{priceInterval}</span>
                </p>
                {trialEndsAt && !isOnTrial && (
                  <p className="text-xs text-[#8B7082] mt-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    Next billing: {formatDate(trialEndsAt)}
                  </p>
                )}
              </div>
              <span
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  background: 'linear-gradient(145deg, #612a4f 0%, #4a3442 100%)',
                  color: 'white',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Current Plan
              </span>
            </div>
          </div>
        )}

        {/* Plan Options */}
        {subscriptionStatus !== 'canceled' && (
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-5 rounded-xl ${planType === 'monthly' || !planType ? 'border-2 border-[#612a4f]/20 bg-[#612a4f]/5' : 'border border-[#E8E4E6]'}`}>
              <p className="text-sm font-medium text-[#2d2a26] mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Monthly
              </p>
              <p className="text-xl font-semibold text-[#612a4f]" style={{ fontFamily: "'Playfair Display', serif" }}>
                $17<span className="text-xs font-normal text-[#8B7082]">/mo</span>
              </p>
              <p className="text-[10px] text-[#8B7082] mb-3">&nbsp;</p>
              <ul className="space-y-2">
                {['Unlimited projects', 'Advanced features', 'Priority support'].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-xs text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    <Check className="w-3 h-3 text-[#612a4f]" />
                    {feature}
                  </li>
                ))}
              </ul>
              {planType === 'annual' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-8 rounded-lg text-xs border-[#8B7082]/30 text-[#612a4f] hover:bg-[#612a4f]/5 mt-3"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                  onClick={() => setShowSwitchConfirm('monthly')}
                  disabled={switching}
                >
                  {switching ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                  Switch to Monthly
                </Button>
              )}
            </div>

            <div className={`p-5 rounded-xl ${planType === 'annual' ? 'border-2 border-[#612a4f]/20 bg-[#612a4f]/5' : 'border border-[#E8E4E6] hover:border-[#8B7082]/30 transition-colors'}`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-[#2d2a26]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Annual
                </p>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700">
                  Save 18%
                </span>
              </div>
              <p className="text-xl font-semibold text-[#2d2a26]" style={{ fontFamily: "'Playfair Display', serif" }}>
                $14<span className="text-xs font-normal text-[#8B7082]">/mo</span>
              </p>
              <p className="text-[10px] text-[#8B7082] mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Billed annually ($168)
              </p>
              <ul className="space-y-2 mb-3">
                {['Everything in Monthly', 'Save 18% on your subscription', 'Lock in your price for 12 months'].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-xs text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    <Check className="w-3 h-3 text-[#612a4f]" />
                    {feature}
                  </li>
                ))}
              </ul>
              {planType !== 'annual' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-8 rounded-lg text-xs border-[#8B7082]/30 text-[#612a4f] hover:bg-[#612a4f]/5"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                  onClick={() => setShowSwitchConfirm('annual')}
                  disabled={switching}
                >
                  {switching ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                  Switch to Annual
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Cancel subscription (for active non-trial users) */}
        {subscriptionStatus === 'active' && !isOnTrial && stripeSubscriptionId && (
          <div className="mt-6 pt-4 border-t border-[#E8E4E6]">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-red-400 hover:text-red-500 hover:bg-red-50"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
              onClick={() => setShowCancelConfirm(true)}
              disabled={canceling}
            >
              {canceling ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
              Cancel Subscription
            </Button>
          </div>
        )}
      </div>

      {/* Payment Method */}
      {stripeCustomerId && (
        <div
          className="bg-white/80 rounded-[20px] p-6"
          style={{
            boxShadow: '0 4px 24px rgba(45, 42, 38, 0.04)',
            border: '1px solid rgba(139, 115, 130, 0.06)',
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(145deg, #8b6a7e 0%, #4a3442 100%)',
                boxShadow: '0 4px 12px rgba(107, 74, 94, 0.2)',
              }}
            >
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg text-[#2d2a26]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
                Payment Method
              </h2>
              <p className="text-xs text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Your card on file
              </p>
            </div>
          </div>

          {loadingBilling ? (
            <div className="flex items-center gap-2 text-sm text-[#8B7082] py-3">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading...
            </div>
          ) : paymentMethod ? (
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#8B7082]/5">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-[#612a4f]" />
                <div>
                  <p className="text-sm font-medium text-[#2d2a26] capitalize" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    {paymentMethod.brand} ending in {paymentMethod.last4}
                  </p>
                  <p className="text-xs text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    Expires {String(paymentMethod.expMonth).padStart(2, '0')}/{paymentMethod.expYear}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#8B7082] py-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {isOnTrial ? 'Your card will be charged when your trial ends.' : 'No payment method on file.'}
            </p>
          )}
        </div>
      )}

      {/* Billing History */}
      {stripeCustomerId && (
        <div
          className="bg-white/80 rounded-[20px] p-6"
          style={{
            boxShadow: '0 4px 24px rgba(45, 42, 38, 0.04)',
            border: '1px solid rgba(139, 115, 130, 0.06)',
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(145deg, #8b6a7e 0%, #4a3442 100%)',
                boxShadow: '0 4px 12px rgba(107, 74, 94, 0.2)',
              }}
            >
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg text-[#2d2a26]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
                Billing History
              </h2>
              <p className="text-xs text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Past invoices and receipts
              </p>
            </div>
          </div>

          {loadingBilling ? (
            <div className="flex items-center gap-2 text-sm text-[#8B7082] py-3">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading...
            </div>
          ) : invoices.length > 0 ? (
            <div className="space-y-2">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-[#8B7082]/5 transition-colors"
                >
                  <div>
                    <p className="text-sm text-[#2d2a26]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      {new Date(invoice.date * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      ${(invoice.amount / 100).toFixed(2)} — <span className="capitalize">{invoice.status}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {invoice.invoicePdf && (
                      <a
                        href={invoice.invoicePdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:bg-[#8B7082]/10 transition-colors"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4 text-[#8B7082]" />
                      </a>
                    )}
                    {invoice.hostedUrl && (
                      <a
                        href={invoice.hostedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:bg-[#8B7082]/10 transition-colors"
                        title="View invoice"
                      >
                        <ExternalLink className="w-4 h-4 text-[#8B7082]" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#8B7082] py-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {isOnTrial ? 'No invoices yet — your first invoice will be generated after your trial ends.' : 'No invoices found.'}
            </p>
          )}
        </div>
      )}

      {/* No subscription state */}
      {!subscriptionStatus && !isOnTrial && (
        <div
          className="bg-white/80 rounded-[20px] p-6 text-center"
          style={{
            boxShadow: '0 4px 24px rgba(45, 42, 38, 0.04)',
            border: '1px solid rgba(139, 115, 130, 0.06)',
          }}
        >
          <p className="text-sm text-[#8B7082] mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            No active subscription
          </p>
          <Button
            className="bg-[#612a4f] hover:bg-[#4d2140] text-white rounded-xl"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
            onClick={() => window.location.href = '/onboarding?step=payment-setup'}
          >
            Subscribe
          </Button>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle style={{ fontFamily: "'Playfair Display', serif" }}>
              {isOnTrial ? 'Cancel Free Trial?' : 'Cancel Subscription?'}
            </AlertDialogTitle>
            <AlertDialogDescription style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {isOnTrial
                ? `You still have ${daysRemaining()} days left to explore HeyMeg. After your trial ends, you'll lose access to your account. You can always resubscribe later.`
                : 'You will retain access until the end of your current billing period. Your data will be kept safe and you can resubscribe at any time.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="rounded-xl"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {isOnTrial ? 'Keep Trial' : 'Keep Subscription'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={canceling}
              className="rounded-xl bg-red-500 hover:bg-red-600 text-white"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {canceling ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Yes, Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Switch Plan Confirmation Dialog */}
      <AlertDialog open={!!showSwitchConfirm} onOpenChange={(open) => !open && setShowSwitchConfirm(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle style={{ fontFamily: "'Playfair Display', serif" }}>
              Switch to {showSwitchConfirm === 'annual' ? 'Annual' : 'Monthly'}?
            </AlertDialogTitle>
            <AlertDialogDescription style={{ fontFamily: "'DM Sans', sans-serif" }} asChild>
              <div>
                {showSwitchConfirm === 'annual' ? (
                  isOnTrial ? (
                    <p>After your free trial ends on <strong>{formatDate(trialEndsAt)}</strong>, you will be billed <strong>$168/year</strong> ($14/month). You save 18% compared to monthly billing.</p>
                  ) : (
                    <p>Your plan will switch to annual billing at <strong>$168/year</strong> ($14/month). You'll receive a prorated credit for any unused time on your current monthly plan.</p>
                  )
                ) : (
                  isOnTrial ? (
                    <p>After your free trial ends on <strong>{formatDate(trialEndsAt)}</strong>, you will be billed <strong>$17/month</strong>.</p>
                  ) : (
                    <p>Your plan will switch to monthly billing at <strong>$17/month</strong>. The change takes effect at your next billing cycle.</p>
                  )
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="rounded-xl"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Keep Current Plan
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (showSwitchConfirm) handleSwitchPlan(showSwitchConfirm);
              }}
              disabled={switching}
              className="rounded-xl bg-[#612a4f] hover:bg-[#4d2140] text-white"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {switching ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Yes, Switch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MembershipSection;
