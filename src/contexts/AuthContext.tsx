import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';
import { StorageKeys, getString, remove, setString } from '@/lib/storage';

interface AuthContextType {
  isAuthenticated: boolean;
  isAuthLoaded: boolean;
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
  const { isSignedIn, user, isLoaded } = useUser();
  const clerk = useClerk();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  // Helper to get user-specific localStorage key
  const getOnboardingKey = (userId: string) => `${StorageKeys.hasCompletedOnboarding}_${userId}`;

  // One-time cleanup: Remove old generic localStorage key that could cause cross-user issues
  useEffect(() => {
    // Remove the old generic key (without user ID) to prevent stale data
    const oldGenericValue = getString(StorageKeys.hasCompletedOnboarding);
    if (oldGenericValue) {
      console.log('🧹 Cleaning up old generic onboarding localStorage key');
      remove(StorageKeys.hasCompletedOnboarding);
    }
  }, []);

  // Check onboarding status from Supabase profile
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      setCheckingOnboarding(true);

      if (isSignedIn && user) {
        const userOnboardingKey = getOnboardingKey(user.id);

        // First check user-specific localStorage - if they've completed onboarding before, trust it
        const storedOnboarding = getString(userOnboardingKey);
        if (storedOnboarding === 'true') {
          console.log('✅ Onboarding already completed (from localStorage) for user:', user.id);
          setHasCompletedOnboarding(true);
          setCheckingOnboarding(false);
          return;
        }

        console.log('🔍 Checking onboarding status for user:', user.id);

        try {
          // Check if user profile exists in Supabase
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, stripe_subscription_id, subscription_status')
            .eq('id', user.id)
            .single();

          console.log('📊 Profile data from Supabase:', profile);

          if (profile) {
            // User has a profile - they're an existing user, allow them in
            console.log('✅ User profile exists, marking onboarding complete');
            setHasCompletedOnboarding(true);
            setString(userOnboardingKey, 'true');
          } else if (profileError?.code === 'PGRST116') {
            // No profile found (PGRST116 = no rows returned) - new user needs onboarding
            console.log('❌ No profile found, new user needs onboarding');
            setHasCompletedOnboarding(false);
          } else {
            // Profile exists but may have an error, let them through
            console.log('⚠️ Profile check returned unexpected result, allowing access');
            setHasCompletedOnboarding(true);
          }
        } catch (error) {
          console.error('Error checking onboarding:', error);
          // On error, let them through rather than blocking
          setHasCompletedOnboarding(true);
        }
      } else {
        // Not signed in
        setHasCompletedOnboarding(false);
      }

      setCheckingOnboarding(false);
    };

    if (isLoaded) {
      checkOnboardingStatus();
    }

    // Timeout fallback - if checking takes too long, stop loading
    const timeout = setTimeout(() => {
      if (checkingOnboarding) {
        console.warn('⚠️ Onboarding check timed out, proceeding anyway');
        setCheckingOnboarding(false);
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [isSignedIn, user, isLoaded]);

  // Sync user to Supabase when they sign in with Clerk
  useEffect(() => {
    const syncUserToSupabase = async () => {
      if (isSignedIn && user) {
        console.log('✅ User signed in with Clerk:', user.id);

        // Check if user profile exists in Supabase
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        if (!existingProfile) {
          console.log('Creating user profile in Supabase...');
          try {
            const trialEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            const { data, error } = await supabase.from('profiles').insert([{
              id: user.id,
              full_name: user.fullName || user.firstName || 'User',
              email: user.primaryEmailAddress?.emailAddress,
              is_on_trial: true,
              trial_ends_at: trialEndDate.toISOString()
            }]);

            if (error) {
              console.error('❌ Supabase insert error:', error);
              console.error('Error details:', JSON.stringify(error, null, 2));
            } else {
              console.log('✅ User profile created in Supabase');
            }
          } catch (error) {
            console.error('⚠️ Failed to create Supabase profile:', error);
          }
        } else {
          console.log('✅ Profile already exists in Supabase');
        }
      }
    };

    if (isLoaded) {
      syncUserToSupabase();
    }
  }, [isSignedIn, user, isLoaded]);

  // Check for ?login=true query parameter to open login modal
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('login') === 'true') {
      setLoginOpen(true);
      // Remove the query parameter from URL without page reload
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  const login = useCallback(() => {
    // With Clerk, this is just for marking onboarding as complete
    setLoginOpen(false);
  }, []);

  const logout = async () => {
    try {
      // Sign out from Clerk
      await clerk.signOut();

      // DON'T clear hasCompletedOnboarding from localStorage
      // It will be re-checked from Supabase on next sign-in
      remove(StorageKeys.user);

      // Reset onboarding state
      setHasCompletedOnboarding(false);

      // Redirect to landing page
      window.location.href = '/landing.html';

      return true;
    } catch (error) {
      console.error("Error signing out:", error);
      // Still clear local state even if Clerk fails
      remove(StorageKeys.user);
      setHasCompletedOnboarding(false);

      // Still redirect even on error
      window.location.href = '/landing.html';

      return false;
    }
  };

  const completeOnboarding = () => {
    setHasCompletedOnboarding(true);
    // Store with user-specific key to prevent cross-user localStorage issues
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

  // Show loading state while Clerk loads or checking onboarding
  // DISABLED: Removed loading check to fix hanging issue
  // if (!isLoaded || checkingOnboarding) {
  //   return (
  //     <>
  //       <div className="min-h-screen flex items-center justify-center">
  //         <div className="animate-pulse flex flex-col items-center">
  //           <div className="w-20 h-20 bg-muted rounded-full mb-4"></div>
  //           <div className="h-4 w-32 bg-muted rounded"></div>
  //         </div>
  //       </div>
  //     </>
  //   );
  // }

  return (
    <AuthContext.Provider value={{
      isAuthenticated: !!isSignedIn,
      isAuthLoaded: isLoaded && !checkingOnboarding,
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
