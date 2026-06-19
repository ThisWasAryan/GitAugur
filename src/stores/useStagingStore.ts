import { create } from 'zustand';

export type FileStatus = 'modified' | 'added' | 'deleted' | 'untracked';

export interface FileChange {
  path: string;
  status: FileStatus;
}

interface StagingState {
  stagedFiles: FileChange[];
  unstagedFiles: FileChange[];
  commitMessage: string;
  
  // Actions
  setCommitMessage: (msg: string) => void;
  stageFile: (path: string) => void;
  unstageFile: (path: string) => void;
  stageAll: () => void;
  unstageAll: () => void;
  commit: () => void;
}

// Initial mock data
const initialUnstaged: FileChange[] = [
  { path: 'src/App.tsx', status: 'modified' },
  { path: 'src/components/layout/Sidebar.tsx', status: 'modified' },
  { path: 'src/features/staging/StagingPanel.tsx', status: 'untracked' },
];

const initialStaged: FileChange[] = [
  { path: 'src/types/git.ts', status: 'added' },
  { path: 'docs/roadmap.md', status: 'modified' },
];

export const useStagingStore = create<StagingState>((set) => ({
  stagedFiles: initialStaged,
  unstagedFiles: initialUnstaged,
  commitMessage: '',

  setCommitMessage: (msg) => set({ commitMessage: msg }),

  stageFile: (path) => set((state) => {
    const file = state.unstagedFiles.find(f => f.path === path);
    if (!file) return state;
    return {
      unstagedFiles: state.unstagedFiles.filter(f => f.path !== path),
      stagedFiles: [...state.stagedFiles, file].sort((a, b) => a.path.localeCompare(b.path))
    };
  }),

  unstageFile: (path) => set((state) => {
    const file = state.stagedFiles.find(f => f.path === path);
    if (!file) return state;
    return {
      stagedFiles: state.stagedFiles.filter(f => f.path !== path),
      unstagedFiles: [...state.unstagedFiles, file].sort((a, b) => a.path.localeCompare(b.path))
    };
  }),

  stageAll: () => set((state) => ({
    stagedFiles: [...state.stagedFiles, ...state.unstagedFiles].sort((a, b) => a.path.localeCompare(b.path)),
    unstagedFiles: []
  })),

  unstageAll: () => set((state) => ({
    unstagedFiles: [...state.unstagedFiles, ...state.stagedFiles].sort((a, b) => a.path.localeCompare(b.path)),
    stagedFiles: []
  })),

  commit: () => set((state) => {
    if (state.stagedFiles.length === 0 || !state.commitMessage) return state;
    
    // In a real app, this would call Tauri IPC
    console.log("Committing files:", state.stagedFiles, "with message:", state.commitMessage);
    
    return {
      stagedFiles: [],
      commitMessage: ''
    };
  })
}));
