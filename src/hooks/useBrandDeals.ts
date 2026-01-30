import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import {
  BrandDeal,
  Deliverable,
  getUserBrandDeals,
  createBrandDeal,
  updateBrandDealWithDeliverables,
  deleteBrandDeal,
  archiveBrandDeal,
  unarchiveBrandDeal,
} from '@/services/brandDealsService';
import { toast } from 'sonner';

// Re-export types for convenience
export type { BrandDeal, Deliverable } from '@/services/brandDealsService';

interface UseBrandDealsReturn {
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

export const useBrandDeals = (): UseBrandDealsReturn => {
  const { user, isLoaded } = useUser();
  const [deals, setDeals] = useState<BrandDeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load deals from Supabase
  const loadDeals = useCallback(async () => {
    if (!user?.id) {
      setDeals([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await getUserBrandDeals(user.id);
      setDeals(data);
    } catch (err) {
      console.error('Error loading brand deals:', err);
      setError('Failed to load brand deals');
      toast.error('Failed to load brand deals');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Load deals on mount and when user changes
  useEffect(() => {
    if (isLoaded) {
      loadDeals();
    }
  }, [isLoaded, loadDeals]);

  // Add a new deal
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

  // Update a deal
  const updateDeal = useCallback(async (id: string, updates: Partial<BrandDeal>) => {
    if (!user?.id) {
      toast.error('You must be logged in to update deals');
      return;
    }

    try {
      const updatedDeal = await updateBrandDealWithDeliverables(id, updates);
      setDeals(prev => prev.map(d => d.id === id ? updatedDeal : d));
    } catch (err) {
      console.error('Error updating brand deal:', err);
      toast.error('Failed to update brand deal');
      throw err;
    }
  }, [user?.id]);

  // Delete a deal
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

  // Archive a deal
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

  // Unarchive a deal
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

  // Refresh deals (manual reload)
  const refreshDeals = useCallback(async () => {
    await loadDeals();
  }, [loadDeals]);

  return {
    deals,
    isLoading,
    error,
    addDeal,
    updateDeal,
    deleteDeal,
    archiveDeal,
    unarchiveDeal,
    refreshDeals,
  };
};
