import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type RepositoryState = 'NORMAL' | 'MERGING' | 'REBASING' | 'CHERRY_PICKING' | 'REVERTING';

interface RepositoryStore {
  repoPath: string | null;
  currentState: RepositoryState;
  currentBranch: string;
  setRepoPath: (path: string | null) => void;
  setRepositoryState: (state: RepositoryState) => void;
  setCurrentBranch: (branch: string) => void;
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
    }),
    {
      name: 'repository-storage',
    }
  )
);
