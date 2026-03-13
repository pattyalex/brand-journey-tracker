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

  // Initialize auth session
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setActiveUserId(session?.user?.id ?? null);
      setSession(session);
      setUser(session?.user ?? null);
      setIsAuthLoaded(true);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setActiveUserId(session?.user?.id ?? null);
        setSession(session);
        setUser(session?.user ?? null);
        setIsAuthLoaded(true);
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

        // Check localStorage first
        const storedOnboarding = getString(userOnboardingKey);
        if (storedOnboarding === 'true') {
          console.log('✅ Onboarding already completed (from localStorage) for user:', user.id);
          setHasCompletedOnboarding(true);
          setCheckingOnboarding(false);
          return;
        }

        console.log('🔍 Checking onboarding status for user:', user.id);

        // Check if profile exists in Supabase
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id, stripe_subscription_id')
          .eq('id', user.id)
          .single();

        console.log('📊 Profile data from Supabase:', profile);

        if (profile) {
          // Profile exists - user has completed onboarding
          console.log('✅ User profile exists, marking onboarding complete');
          setHasCompletedOnboarding(true);
          setString(userOnboardingKey, 'true');
        } else if (error?.code === 'PGRST116') {
          // No profile found - new user needs onboarding
          console.log('❌ No profile found, new user needs onboarding');
          setHasCompletedOnboarding(false);
        } else {
          // Error checking - let them through
          console.log('⚠️ Profile check returned unexpected result, allowing access');
          setHasCompletedOnboarding(true);
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
      remove(StorageKeys.user);
      setHasCompletedOnboarding(false);
      window.location.href = '/landing.html';
      return true;
    } catch (error) {
      console.error("Error signing out:", error);
      remove(StorageKeys.user);
      setHasCompletedOnboarding(false);
      window.location.href = '/landing.html';
      return false;
    }
  };

  const completeOnboarding = () => {
    setHasCompletedOnboarding(true);
    if (user?.id) {
      setString(getOnboardingKey(user.id), 'true');
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
