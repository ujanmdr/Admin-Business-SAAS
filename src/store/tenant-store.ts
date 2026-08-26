import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockBusinesses, mockBranches } from '@/lib/tenant-data';

interface TenantState {
  activeBusinessId: string;
  activeBranchId: string; // can be a branch ID or 'OVERALL'
  setActiveBusiness: (id: string) => void;
  setActiveBranch: (id: string) => void;
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set, get) => ({
      activeBusinessId: 'b1', // default to Aura Beauty Lounge
      activeBranchId: 'OVERALL', // default to overall

      setActiveBusiness: (id: string) => {
        // When switching businesses, default the branch to OVERALL
        set({ activeBusinessId: id, activeBranchId: 'OVERALL' });
      },
      
      setActiveBranch: (id: string) => {
        set({ activeBranchId: id });
      },
    }),
    {
      name: 'brg-tenant-storage',
    }
  )
);
