import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { StorageKeys, getString, remove, setString, setActiveUserId } from '@/lib/storage';

interface AuthContextType {
  isAuthenticated: boolean;
  isAuthLoaded: boolean;
  user: User | null;
  session: Session | null;
  hasCompletedOnboarding: boolean;
  isPasswordRecovery: boolean;
  subscriptionStatus: string | null;
  hasActiveSubscription: boolean;
  hasUsedTrial: boolean;
  isOnTrial: boolean;
  trialEndsAt: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  planType: string | null;
  refreshSubscription: () => Promise<void>;
  login: () => void;
  logout: () => void;
  completeOnboarding: () => void;
  loginOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [hasUsedTrial, setHasUsedTrial] = useState(false);
  const [isOnTrial, setIsOnTrial] = useState(false);
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
  const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null);
  const [stripeSubscriptionId, setStripeSubscriptionId] = useState<string | null>(null);
  const [planType, setPlanType] = useState<string | null>(null);
  // Ref to track onboarding completion across effect closures (avoids stale state)
  const onboardingConfirmedRef = useRef(false);

  // Get user-specific localStorage key
  const getOnboardingKey = (userId: string) => `${StorageKeys.hasCompletedOnboarding}_${userId}`;

  // Sync any onboarding responses saved before session was available
  const syncPendingOnboardingResponses = async (userId: string | undefined) => {
    if (!userId) return;
    const pending = localStorage.getItem('pending_onboarding_responses');
    if (!pending) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ preferences: { onboarding_responses: JSON.parse(pending) } })
        .eq('id', userId);
      if (!error) {
        localStorage.removeItem('pending_onboarding_responses');
        console.log('✅ Pending onboarding responses synced to profiles.preferences');
      }
    } catch (err) {
      console.error('Failed to sync pending onboarding responses:', err);
    }
  };

  // Initialize auth session
  useEffect(() => {
    // Get initial session with timeout to prevent hanging forever
    const sessionTimeout = setTimeout(() => {
      console.warn('⚠️ getSession timed out — clearing stale tokens and proceeding');
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-')) localStorage.removeItem(key);
      });
      setSession(null);
      setUser(null);
      setIsAuthLoaded(true);
    }, 8000);

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      clearTimeout(sessionTimeout);
      setActiveUserId(session?.user?.id ?? null);
      setSession(session);
      setUser(session?.user ?? null);
      setIsAuthLoaded(true);
      await syncPendingOnboardingResponses(session?.user?.id);
    }).catch(() => {
      clearTimeout(sessionTimeout);
      setIsAuthLoaded(true);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        // Detect password recovery flow — user should stay on reset page
        if (_event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true);
        }

        setActiveUserId(session?.user?.id ?? null);
        setSession(session);
        setUser(session?.user ?? null);
        // Only re-check onboarding for genuinely new sessions (not token refreshes)
        // If onboarding is already confirmed, skip the re-check to avoid unmounting pages
        if (session?.user && !onboardingConfirmedRef.current) {
          setCheckingOnboarding(true);
        }
        setIsAuthLoaded(true);

        // Profile is created automatically by the handle_new_user() database trigger.
        // Do NOT insert from the client — it causes race conditions and permission errors.

        // Sync any pending onboarding responses saved before session was available
        await syncPendingOnboardingResponses(session?.user?.id);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Check onboarding status from Supabase profile
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      // If onboarding is already confirmed, don't re-check (prevents page unmounting)
      if (onboardingConfirmedRef.current) {
        setCheckingOnboarding(false);
        return;
      }

      setCheckingOnboarding(true);

      if (user) {
        const userOnboardingKey = getOnboardingKey(user.id);

        // Check localStorage first for onboarding status
        const storedOnboarding = getString(userOnboardingKey);
        if (storedOnboarding === 'true') {
          console.log('✅ Onboarding already completed (from localStorage) for user:', user.id);
          setHasCompletedOnboarding(true);
          onboardingConfirmedRef.current = true;
        }

        console.log('🔍 Fetching profile for user:', user.id);

        // Always fetch profile to get subscription data
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id, has_completed_onboarding, subscription_status, is_on_trial, trial_ends_at, has_used_trial, stripe_customer_id, stripe_subscription_id, plan_type')
          .eq('id', user.id)
          .single();

        console.log('📊 Profile data from Supabase:', profile);

        if (profile?.has_completed_onboarding) {
          console.log('✅ Onboarding complete');
          setHasCompletedOnboarding(true);
          onboardingConfirmedRef.current = true;
          setString(userOnboardingKey, 'true');
        } else if (storedOnboarding !== 'true') {
          console.log('❌ Onboarding not yet complete');
          setHasCompletedOnboarding(false);
        }

        // Set subscription status
        if (profile) {
          setSubscriptionStatus(profile.subscription_status);
          setHasUsedTrial(profile.has_used_trial ?? false);
          setIsOnTrial(profile.is_on_trial ?? false);
          setTrialEndsAt(profile.trial_ends_at ?? null);
          setStripeCustomerId(profile.stripe_customer_id ?? null);
          setStripeSubscriptionId(profile.stripe_subscription_id ?? null);
          setPlanType(profile.plan_type ?? null);
          console.log('📊 Subscription status:', profile.subscription_status);
        }
      } else {
        // Not signed in
        setHasCompletedOnboarding(false);
      }

      setCheckingOnboarding(false);
    };

    if (isAuthLoaded) {
      checkOnboardingStatus();
    }

    // Timeout fallback — if DB is slow, stop blocking but do NOT assume
    // onboarding is complete. Users who haven't finished onboarding should
    // stay on the onboarding flow, not skip to the dashboard.
    const timeout = setTimeout(() => {
      if (checkingOnboarding) {
        console.warn('⚠️ Onboarding check timed out — stopping spinner but keeping current onboarding state');
        setCheckingOnboarding(false);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [user, isAuthLoaded]);

  const login = useCallback(() => {
    setLoginOpen(false);
  }, []);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      // Clear Supabase session tokens from localStorage as a safety net
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-')) localStorage.removeItem(key);
      });
      remove(StorageKeys.user);
      setActiveUserId(null);
      setHasCompletedOnboarding(false);
      window.location.replace('/landing.html');
    }
  };

  const completeOnboarding = () => {
    setHasCompletedOnboarding(true);
    if (user?.id) {
      setString(getOnboardingKey(user.id), 'true');
      supabase.from('profiles')
        .update({ has_completed_onboarding: true })
        .eq('id', user.id)
        .then(({ error }) => { if (error) console.error('Failed to mark onboarding complete:', error); });
    }
  };

  // User has access if subscription is active, trialing, not yet set (during onboarding),
  // or canceled but trial/billing period hasn't ended yet (cancel_at_period_end)
  const canceledButStillHasTime = subscriptionStatus === 'canceled' && trialEndsAt && new Date(trialEndsAt) > new Date();
  const hasActiveSubscription = subscriptionStatus === 'active' || subscriptionStatus === 'trialing' || subscriptionStatus === null || canceledButStillHasTime;

  const refreshSubscription = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('subscription_status, is_on_trial, trial_ends_at, has_used_trial, stripe_customer_id, stripe_subscription_id, plan_type')
      .eq('id', user.id)
      .single();
    if (data) {
      setSubscriptionStatus(data.subscription_status);
      setIsOnTrial(data.is_on_trial ?? false);
      setTrialEndsAt(data.trial_ends_at ?? null);
      setHasUsedTrial(data.has_used_trial ?? false);
      setStripeCustomerId(data.stripe_customer_id ?? null);
      setStripeSubscriptionId(data.stripe_subscription_id ?? null);
      setPlanType(data.plan_type ?? null);
    }
  }, [user]);

  const openLoginModal = useCallback(() => {
    setLoginOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setLoginOpen(false);
  }, []);

  return (
    <AuthContext.Provider value={{
      isAuthenticated: !!session,
      isAuthLoaded: isAuthLoaded && !checkingOnboarding,
      user,
      session,
      hasCompletedOnboarding,
      isPasswordRecovery,
      subscriptionStatus,
      hasActiveSubscription,
      hasUsedTrial,
      isOnTrial,
      trialEndsAt,
      stripeCustomerId,
      stripeSubscriptionId,
      planType,
      refreshSubscription,
      login,
      logout,
      completeOnboarding,
      loginOpen,
      openLoginModal,
      closeLoginModal
    }}>
      {children}
    </AuthContext.Provider>
  );
};
