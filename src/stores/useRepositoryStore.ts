import { create } from 'zustand';

export type RepositoryState = 'NORMAL' | 'MERGING' | 'REBASING';

interface RepositoryStore {
  currentState: RepositoryState;
  currentBranch: string;
  setRepositoryState: (state: RepositoryState) => void;
  setCurrentBranch: (branch: string) => void;
  
  // For mock demonstration, a way to toggle state
  toggleMergeState: () => void;
}

export const useRepositoryStore = create<RepositoryStore>((set) => ({
  currentState: 'NORMAL',
  currentBranch: 'main',
  setRepositoryState: (state) => set({ currentState: state }),
  setCurrentBranch: (branch) => set({ currentBranch: branch }),
  
  toggleMergeState: () => set((state) => ({ 
    currentState: state.currentState === 'NORMAL' ? 'MERGING' : 'NORMAL' 
  })),
}));
