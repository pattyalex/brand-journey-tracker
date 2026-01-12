import { useState, useEffect } from 'react';
import { StorageKeys, getString, remove, setString } from '@/lib/storage';

export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has seen the onboarding before
    const hasSeenOnboarding = getString(StorageKeys.hasSeenGoalsOnboarding);

    if (!hasSeenOnboarding) {
      // Show onboarding for first-time users
      setShowOnboarding(true);
    }
  }, []);

  const completeOnboarding = () => {
    setString(StorageKeys.hasSeenGoalsOnboarding, 'true');
    setShowOnboarding(false);
  };

  const resetOnboarding = () => {
    remove(StorageKeys.hasSeenGoalsOnboarding);
    setShowOnboarding(true);
  };

  return {
    showOnboarding,
    completeOnboarding,
    resetOnboarding
  };
};
