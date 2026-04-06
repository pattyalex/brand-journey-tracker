import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  BrandDeal,
  getUserBrandDeals,
  createBrandDeal,
  updateBrandDealWithDeliverables,
  deleteBrandDeal,
  archiveBrandDeal,
  unarchiveBrandDeal,
} from '@/services/brandDealsService';
import { toast } from 'sonner';

interface BrandDealsContextValue {
  deals: BrandDeal[];
  isLoading: boolean;
  error: string | null;
  addDeal: (deal: Omit<BrandDeal, 'id' | 'createdAt'>) => Promise<void>;
  updateDeal: (id: string, updates: Partial<BrandDeal>) => Promise<void>;
  deleteDeal: (id: string) => Promise<void>;
  archiveDeal: (id: string) => Promise<void>;
  unarchiveDeal: (id: string) => Promise<void>;
  refreshDeals: () => Promise<void>;
}

const BrandDealsContext = createContext<BrandDealsContextValue | null>(null);

export const BrandDealsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthLoaded } = useAuth();
  const [deals, setDeals] = useState<BrandDeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadedForUser, setLoadedForUser] = useState<string | null>(null);

  const loadDeals = useCallback(async () => {
    if (!user?.id) {
      setDeals([]);
      setIsLoading(false);
      return;
    }

    // Don't show loading spinner if we already have data for this user
    if (loadedForUser !== user.id) {
      setIsLoading(true);
    }

    try {
      setError(null);
      const data = await getUserBrandDeals(user.id);
      setDeals(data);
      setLoadedForUser(user.id);
    } catch (err) {
      console.error('Error loading brand deals:', err);
      setError('Failed to load brand deals');
      toast.error('Failed to load brand deals');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, loadedForUser]);

  useEffect(() => {
    if (isAuthLoaded) {
      loadDeals();
    }
  }, [isAuthLoaded, loadDeals]);

  const addDeal = useCallback(async (dealData: Omit<BrandDeal, 'id' | 'createdAt'>) => {
    if (!user?.id) {
      toast.error('You must be logged in to add deals');
      return;
    }
    try {
      const newDeal = await createBrandDeal(user.id, dealData);
      setDeals(prev => [newDeal, ...prev]);
      toast.success(`${newDeal.brandName} added successfully`);
    } catch (err) {
      console.error('Error adding brand deal:', err);
      toast.error('Failed to add brand deal');
      throw err;
    }
  }, [user?.id]);

  const updateDeal = useCallback(async (id: string, updates: Partial<BrandDeal>) => {
    if (!user?.id) {
      toast.error('You must be logged in to update deals');
      return;
    }

    // Optimistic update: apply changes to UI immediately
    const previousDeals = deals;
    setDeals(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));

    try {
      const updatedDeal = await updateBrandDealWithDeliverables(id, updates);
      setDeals(prev => prev.map(d => d.id === id ? updatedDeal : d));
    } catch (err) {
      console.error('Error updating brand deal:', err);
      // Revert on failure
      setDeals(previousDeals);
      toast.error('Failed to update brand deal');
      throw err;
    }
  }, [user?.id, deals]);

  const deleteDeal = useCallback(async (id: string) => {
    if (!user?.id) {
      toast.error('You must be logged in to delete deals');
      return;
    }
    try {
      await deleteBrandDeal(id);
      setDeals(prev => prev.filter(d => d.id !== id));
      toast.success('Deal deleted');
    } catch (err) {
      console.error('Error deleting brand deal:', err);
      toast.error('Failed to delete brand deal');
      throw err;
    }
  }, [user?.id]);

  const archiveDeal = useCallback(async (id: string) => {
    if (!user?.id) {
      toast.error('You must be logged in to archive deals');
      return;
    }
    try {
      const archivedDeal = await archiveBrandDeal(id);
      setDeals(prev => prev.map(d => d.id === id ? archivedDeal : d));
      toast.success('Deal archived', {
        description: 'You can view archived deals from the Active Deals card',
      });
    } catch (err) {
      console.error('Error archiving brand deal:', err);
      toast.error('Failed to archive brand deal');
      throw err;
    }
  }, [user?.id]);

  const unarchiveDeal = useCallback(async (id: string) => {
    if (!user?.id) {
      toast.error('You must be logged in to restore deals');
      return;
    }
    try {
      const restoredDeal = await unarchiveBrandDeal(id);
      setDeals(prev => prev.map(d => d.id === id ? restoredDeal : d));
      toast.success('Deal restored');
    } catch (err) {
      console.error('Error restoring brand deal:', err);
      toast.error('Failed to restore brand deal');
      throw err;
    }
  }, [user?.id]);

  return (
    <BrandDealsContext.Provider value={{
      deals,
      isLoading,
      error,
      addDeal,
      updateDeal,
      deleteDeal,
      archiveDeal,
      unarchiveDeal,
      refreshDeals: loadDeals,
    }}>
      {children}
    </BrandDealsContext.Provider>
  );
};

export const useBrandDealsContext = () => {
  const ctx = useContext(BrandDealsContext);
  if (!ctx) throw new Error('useBrandDealsContext must be used within BrandDealsProvider');
  return ctx;
};
