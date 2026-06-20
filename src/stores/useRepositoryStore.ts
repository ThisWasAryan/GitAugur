import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type RepositoryState = 'NORMAL' | 'MERGING' | 'REBASING';

interface RepositoryStore {
  repoPath: string | null;
  currentState: RepositoryState;
  currentBranch: string;
  setRepoPath: (path: string | null) => void;
  setRepositoryState: (state: RepositoryState) => void;
  setCurrentBranch: (branch: string) => void;
  
  // For mock demonstration, a way to toggle state
  toggleMergeState: () => void;
}

export const useRepositoryStore = create<RepositoryStore>()(
  persist(
    (set) => ({
      repoPath: null, // null means no repo is open, show Launch Screen
      currentState: 'NORMAL',
      currentBranch: 'main',
      setRepoPath: (path) => set({ repoPath: path }),
      setRepositoryState: (state) => set({ currentState: state }),
      setCurrentBranch: (branch) => set({ currentBranch: branch }),
      
      toggleMergeState: () => set((state) => ({ 
        currentState: state.currentState === 'NORMAL' ? 'MERGING' : 'NORMAL' 
      })),
    }),
    {
      name: 'repository-storage',
    }
  )
);
