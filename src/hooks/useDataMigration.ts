import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import {
  hasMigrationCompleted,
  migrateAllDataToSupabase,
  clearMigratedLocalStorageData,
} from '@/utils/migrateLocalStorageToSupabase';

interface MigrationStatus {
  isChecking: boolean;
  isMigrating: boolean;
  isCompleted: boolean;
  error: string | null;
  results: {
    brandDeals?: number;
    strategy?: number;
    goals?: number;
    planner?: number;
    production?: number;
    preferences?: number;
    collab?: number;
    contentIdeas?: number;
  } | null;
}

export const useDataMigration = () => {
  const { user, isLoaded } = useUser();
  const [status, setStatus] = useState<MigrationStatus>({
    isChecking: true,
    isMigrating: false,
    isCompleted: false,
    error: null,
    results: null,
  });

  // Check if migration is needed and run it automatically
  useEffect(() => {
    const checkAndMigrate = async () => {
      if (!isLoaded || !user?.id) {
        setStatus(prev => ({ ...prev, isChecking: false }));
        return;
      }

      // Check if migration already completed
      if (hasMigrationCompleted()) {
        setStatus({
          isChecking: false,
          isMigrating: false,
          isCompleted: true,
          error: null,
          results: null,
        });
        return;
      }

      // Check if there's data to migrate
      const hasLocalData = checkForLocalData();
      if (!hasLocalData) {
        setStatus({
          isChecking: false,
          isMigrating: false,
          isCompleted: true,
          error: null,
          results: null,
        });
        return;
      }

      // Run migration
      setStatus(prev => ({ ...prev, isChecking: false, isMigrating: true }));

      try {
        const results = await migrateAllDataToSupabase(user.id);

        setStatus({
          isChecking: false,
          isMigrating: false,
          isCompleted: results.overallSuccess,
          error: results.overallSuccess ? null : 'Some data failed to migrate',
          results: {
            brandDeals: results.brandDeals.migratedCount,
            strategy: results.strategy.migratedCount,
            goals: results.goals.migratedCount,
            planner: results.planner.migratedCount,
            production: results.production.migratedCount,
            preferences: results.preferences.migratedCount,
            collab: results.collab.migratedCount,
            contentIdeas: results.contentIdeas.migratedCount,
          },
        });

        // Optionally clear localStorage after successful migration
        if (results.overallSuccess) {
          // Uncomment the line below to clear localStorage after migration
          // clearMigratedLocalStorageData();
          console.log('Migration completed successfully. localStorage data preserved as backup.');
        }
      } catch (error) {
        console.error('Migration error:', error);
        setStatus(prev => ({
          ...prev,
          isMigrating: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }));
      }
    };

    checkAndMigrate();
  }, [isLoaded, user?.id]);

  // Manual migration trigger
  const triggerMigration = useCallback(async () => {
    if (!user?.id) return;

    setStatus(prev => ({ ...prev, isMigrating: true, error: null }));

    try {
      const results = await migrateAllDataToSupabase(user.id);

      setStatus({
        isChecking: false,
        isMigrating: false,
        isCompleted: results.overallSuccess,
        error: results.overallSuccess ? null : 'Some data failed to migrate',
        results: {
          brandDeals: results.brandDeals.migratedCount,
          strategy: results.strategy.migratedCount,
          goals: results.goals.migratedCount,
          planner: results.planner.migratedCount,
          production: results.production.migratedCount,
          preferences: results.preferences.migratedCount,
          collab: results.collab.migratedCount,
          contentIdeas: results.contentIdeas.migratedCount,
        },
      });
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        isMigrating: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  }, [user?.id]);

  // Clear migrated data from localStorage
  const clearLocalData = useCallback(() => {
    clearMigratedLocalStorageData();
  }, []);

  return {
    ...status,
    triggerMigration,
    clearLocalData,
  };
};

// Helper to check if there's any local data to migrate
const checkForLocalData = (): boolean => {
  const keysToCheck = [
    'brandDeals',
    'brandValues',
    'missionStatement',
    'contentValues',
    'monthlyGoalsData',
    'shortTermGoals',
    'longTermGoals',
    'plannerData',
    'allTasks',
    'productionKanban',
    'collabBrands',
    'bankOfIdeas',
    'contentIdeas',
  ];

  return keysToCheck.some(key => {
    const value = localStorage.getItem(key);
    if (!value) return false;
    try {
      const parsed = JSON.parse(value);
      // Check if it's non-empty
      if (Array.isArray(parsed)) return parsed.length > 0;
      if (typeof parsed === 'object') return Object.keys(parsed).length > 0;
      return !!parsed;
    } catch {
      return !!value;
    }
  });
};
