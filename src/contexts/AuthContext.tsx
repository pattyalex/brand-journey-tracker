import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { StorageKeys, getString, remove, setString, setActiveUserId } from '@/lib/storage';

interface AuthContextType {
  isAuthenticated: boolean;
  isAuthLoaded: boolean;
  user: User | null;
  session: Session | null;
  hasCompletedOnboarding: boolean;
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
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setActiveUserId(session?.user?.id ?? null);
      setSession(session);
      setUser(session?.user ?? null);
      setIsAuthLoaded(true);
      await syncPendingOnboardingResponses(session?.user?.id);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setActiveUserId(session?.user?.id ?? null);
        setSession(session);
        setUser(session?.user ?? null);
        setIsAuthLoaded(true);

        // Ensure profile exists for this user
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', session.user.id)
            .single();

          if (!profile) {
            await supabase.from('profiles').insert([{
              id: session.user.id,
              full_name: session.user.user_metadata?.full_name || '',
              email: session.user.email,
              is_on_trial: true,
              trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            }]);
            console.log('✅ Profile created for existing user:', session.user.email);
          }
        }

        // Sync any pending onboarding responses saved before session was available
        await syncPendingOnboardingResponses(session?.user?.id);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Check onboarding status from Supabase profile
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      setCheckingOnboarding(true);

      if (user) {
        const userOnboardingKey = getOnboardingKey(user.id);

        // Check localStorage first (only trust it if set after onboarding truly completed)
        const storedOnboarding = getString(userOnboardingKey);
        if (storedOnboarding === 'true') {
          console.log('✅ Onboarding already completed (from localStorage) for user:', user.id);
          setHasCompletedOnboarding(true);
          setCheckingOnboarding(false);
          return;
        }
        // Clear any stale localStorage value so we re-check DB
        localStorage.removeItem(userOnboardingKey);

        console.log('🔍 Checking onboarding status for user:', user.id);

        // Check if profile exists and onboarding is complete
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id, has_completed_onboarding')
          .eq('id', user.id)
          .single();

        console.log('📊 Profile data from Supabase:', profile);

        if (profile?.has_completed_onboarding) {
          console.log('✅ Onboarding complete');
          setHasCompletedOnboarding(true);
          setString(userOnboardingKey, 'true');
        } else {
          console.log('❌ Onboarding not yet complete');
          setHasCompletedOnboarding(false);
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

    // Timeout fallback
    const timeout = setTimeout(() => {
      if (checkingOnboarding) {
        console.warn('⚠️ Onboarding check timed out, proceeding anyway');
        setCheckingOnboarding(false);
      }
    }, 3000);

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
