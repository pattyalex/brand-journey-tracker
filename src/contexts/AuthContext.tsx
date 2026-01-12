import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';
import { StorageKeys, getString, remove, setString } from '@/lib/storage';

interface AuthContextType {
  isAuthenticated: boolean;
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

  // Check onboarding status from Supabase profile
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      setCheckingOnboarding(true);

      // First check localStorage - if they've completed onboarding before, trust it
      const storedOnboarding = getString(StorageKeys.hasCompletedOnboarding);
      if (storedOnboarding === 'true') {
        console.log('✅ Onboarding already completed (from localStorage)');
        setHasCompletedOnboarding(true);
        setCheckingOnboarding(false);
        return;
      }

      if (isSignedIn && user) {
        console.log('🔍 Checking onboarding status for user:', user.id);

        try {
          // Check if user has completed payment setup in Supabase
          const { data: profile } = await supabase
            .from('profiles')
            .select('stripe_subscription_id, subscription_status')
            .eq('id', user.id)
            .single();

          console.log('📊 Profile data from Supabase:', profile);

          if (profile?.stripe_subscription_id) {
            // User has a subscription, they've completed onboarding
            console.log('✅ User has subscription, marking onboarding complete');
            setHasCompletedOnboarding(true);
            setString(StorageKeys.hasCompletedOnboarding, 'true');
          } else {
            // No subscription found, they need to complete onboarding
            console.log('❌ No subscription found, needs onboarding');
            setHasCompletedOnboarding(false);
            remove(StorageKeys.hasCompletedOnboarding);
          }
        } catch (error) {
          console.error('Error checking onboarding:', error);
          // On error, assume they need onboarding
          setHasCompletedOnboarding(false);
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

      return true;
    } catch (error) {
      console.error("Error signing out:", error);
      // Still clear local state even if Clerk fails
      remove(StorageKeys.user);
      setHasCompletedOnboarding(false);
      return false;
    }
  };

  const completeOnboarding = () => {
    setHasCompletedOnboarding(true);
    setString(StorageKeys.hasCompletedOnboarding, 'true');
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
