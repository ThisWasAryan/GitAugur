import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import type { GitHistory, GitCommit } from '../types/git';
import { initialMockState } from './mockStateSeed';
import { useRepositoryStore } from '../stores/useRepositoryStore';

export type FileState = 'added' | 'modified' | 'deleted' | 'untracked';

export interface FileStatus {
  path: string;
  status: FileState;
  diff?: string; // Optional diff content for the file
}

export interface PreviewState {
  active: boolean;
  type: 'COMMIT' | 'MERGE' | 'DELETE' | null;
  ghostCommit?: GitCommit;
  impact?: {
    commitsAdded: number;
    filesModified: number;
    conflicts: number;
    health: string;
  };
}

interface GitEngineState {
  history: GitHistory;
  HEAD: string; // The branch name or commit hash we are currently on
  
  // Working Directory
  unstagedFiles: FileStatus[];
  stagedFiles: FileStatus[];
  
  // Preview System
  preview: PreviewState;

  // Selection
  selectedFile: string | null;
  selectedFileDiff: string | null;

  // Actions
  stageFile: (path: string) => void;
  unstageFile: (path: string) => void;
  stageAll: () => void;
  unstageAll: () => void;
  selectFile: (path: string) => void;
  clearSelection: () => void;
  
  // Workflows
  previewCommit: (message: string) => void;
  clearPreview: () => void;
  commit: (message: string) => void;
  
  checkout: (ref: string) => void;
  previewMerge: (sourceBranch: string, targetBranch: string) => void;
  
  // Tauri Backend Methods
  fetchRepoState: (repoPath: string) => Promise<void>;
}

export const useGitEngineStore = create<GitEngineState>((set, get) => ({
  history: initialMockState.history,
  HEAD: initialMockState.HEAD,
  unstagedFiles: initialMockState.unstagedFiles,
  stagedFiles: initialMockState.stagedFiles,
  preview: { active: false, type: null },
  selectedFile: null,
  selectedFileDiff: null,

  selectFile: async (path) => {
    set({ selectedFile: path, selectedFileDiff: null });
    const repoPath = useRepositoryStore.getState().repoPath;
    if (repoPath && repoPath !== 'demo') {
      try {
        // We assume it's unstaged first. If not found in unstaged, we might need to check if it's staged
        // For simplicity, we just run git diff. If it returns empty, run git diff --cached.
        let diffData: any = await invoke('git_diff', { repoPath, file: path, cached: false });
        if (!diffData.stdout) {
          diffData = await invoke('git_diff', { repoPath, file: path, cached: true });
        }
        set({ selectedFileDiff: diffData.stdout });
      } catch (err) {
        console.error("Failed to fetch diff:", err);
      }
    } else {
      // Mock diff
      set({ selectedFileDiff: `@@ -1,3 +1,3 @@\n-const mock = true;\n+const mock = false;` });
    }
  },

  clearSelection: () => set({ selectedFile: null, selectedFileDiff: null }),

  stageFile: async (path) => {
    const repoPath = useRepositoryStore.getState().repoPath;
    if (repoPath && repoPath !== 'demo') {
      try {
        await invoke('git_add', { repoPath, files: [path] });
        get().fetchRepoState(repoPath);
      } catch (err) {
        console.error(err);
      }
      return;
    }

    set((state) => {
      const file = state.unstagedFiles.find(f => f.path === path);
      if (!file) return state;
      return {
        unstagedFiles: state.unstagedFiles.filter(f => f.path !== path),
        stagedFiles: [...state.stagedFiles, file]
      };
    });
  },

  unstageFile: async (path) => {
    const repoPath = useRepositoryStore.getState().repoPath;
    if (repoPath && repoPath !== 'demo') {
      try {
        await invoke('git_reset', { repoPath, files: [path] });
        get().fetchRepoState(repoPath);
      } catch (err) {
        console.error(err);
      }
      return;
    }

    set((state) => {
      const file = state.stagedFiles.find(f => f.path === path);
      if (!file) return state;
      return {
        stagedFiles: state.stagedFiles.filter(f => f.path !== path),
        unstagedFiles: [...state.unstagedFiles, file]
      };
    });
  },

  stageAll: () => set((state) => ({
    stagedFiles: [...state.stagedFiles, ...state.unstagedFiles],
    unstagedFiles: []
  })),

  unstageAll: () => set((state) => ({
    unstagedFiles: [...state.unstagedFiles, ...state.stagedFiles],
    stagedFiles: []
  })),

  previewCommit: (message) => {
    const state = get();
    if (state.stagedFiles.length === 0 || !message.trim()) return;

    // Find current commit
    const currentBranch = state.history.branches.find(b => b.isCurrent);
    const parentHash = currentBranch ? currentBranch.commitHash : state.HEAD;

    const ghostHash = `ghost-${Date.now().toString().slice(-6)}`;
    const ghostCommit: GitCommit = {
      hash: ghostHash,
      message,
      author: { name: "Current User", email: "user@example.com" },
      timestamp: new Date().toISOString(),
      parentHashes: [parentHash],
      isGhost: true // We'll add this to the type
    };

    set({
      preview: {
        active: true,
        type: 'COMMIT',
        ghostCommit,
        impact: {
          commitsAdded: 1,
          filesModified: state.stagedFiles.length,
          conflicts: 0,
          health: "Healthy"
        }
      }
    });
  },

  clearPreview: () => set({ preview: { active: false, type: null } }),

  commit: async (message) => {
    const repoPath = useRepositoryStore.getState().repoPath;
    if (repoPath && repoPath !== 'demo') {
      try {
        await invoke('git_commit', { repoPath, message });
        set({ preview: { active: false, type: null } });
        get().fetchRepoState(repoPath);
      } catch (err) {
        console.error(err);
      }
      return;
    }

    set((state) => {
      if (state.stagedFiles.length === 0 || !message.trim()) return state;

      const currentBranch = state.history.branches.find(b => b.isCurrent);
      const parentHash = currentBranch ? currentBranch.commitHash : state.HEAD;
      
      const newHash = `h-${Date.now().toString().slice(-6)}`;
      const newCommit: GitCommit = {
        hash: newHash,
        message,
        author: { name: "Current User", email: "user@example.com" },
        timestamp: new Date().toISOString(),
        parentHashes: [parentHash]
      };

      const newCommits = [newCommit, ...state.history.commits];
      
      // Update branch pointer
      let newBranches = state.history.branches;
      if (currentBranch) {
        newBranches = newBranches.map(b => 
          b.name === currentBranch.name ? { ...b, commitHash: newHash } : b
        );
      }

      return {
        history: {
          ...state.history,
          commits: newCommits,
          branches: newBranches
        },
        HEAD: currentBranch ? currentBranch.name : newHash,
        stagedFiles: [],
        preview: { active: false, type: null }
      };
    });
  },

  checkout: async (ref) => {
    const repoPath = useRepositoryStore.getState().repoPath;
    if (repoPath && repoPath !== 'demo') {
      try {
        await invoke('git_checkout', { repoPath, branch: ref });
        get().fetchRepoState(repoPath);
      } catch (err) {
        console.error("Failed to checkout:", err);
      }
      return;
    }
    
    // Demo fallback
    set((state) => {
      return {
        HEAD: ref,
        history: {
          ...state.history,
          branches: state.history.branches.map(b => ({
            ...b,
            isCurrent: b.name === ref
          }))
        }
      };
    });
  },

  previewMerge: (sourceBranch, targetBranch) => {
    const state = get();
    const sourceCommitHash = state.history.branches.find(b => b.name === sourceBranch)?.commitHash;
    const targetCommitHash = state.history.branches.find(b => b.name === targetBranch)?.commitHash;

    if (!sourceCommitHash || !targetCommitHash) return;

    const ghostHash = `ghost-merge-${Date.now().toString().slice(-6)}`;
    const ghostCommit: GitCommit = {
      hash: ghostHash,
      message: `Merge branch '${sourceBranch}' into '${targetBranch}'`,
      author: { name: "Current User", email: "user@example.com" },
      timestamp: new Date().toISOString(),
      parentHashes: [targetCommitHash, sourceCommitHash], // Two parents for a merge commit
      isGhost: true
    };

    set({
      preview: {
        active: true,
        type: 'MERGE',
        ghostCommit,
        impact: {
          commitsAdded: 1,
          filesModified: 0,
          conflicts: 0,
          health: "Healthy"
        }
      }
    });
  },

  fetchRepoState: async (repoPath: string) => {
    try {
      if (repoPath === 'demo') {
        // Fallback to mock state
        set({ history: initialMockState.history, HEAD: initialMockState.HEAD });
        return;
      }

      // Invoke Tauri command
      const historyData: any = await invoke('get_repo_state', { repoPath });
      
      // We need to map the backend GitHistoryData to frontend GitHistory
      // The backend provides branches, commits, tags.
      
      // Determine HEAD (simplistic for now, first branch or first commit)
      const currentBranch = historyData.branches.find((b: any) => b.isCurrent) || historyData.branches[0];
      const head = currentBranch ? currentBranch.name : (historyData.commits[0]?.hash || 'HEAD');
      
      if (currentBranch) {
        currentBranch.isCurrent = true;
      }

      // If backend didn't supply some fields, fallback to empty
      set({
        history: {
          commits: historyData.commits || [],
          branches: historyData.branches || [],
          tags: historyData.tags || [],
        },
        HEAD: head,
        stagedFiles: historyData.stagedFiles || [],
        unstagedFiles: historyData.unstagedFiles || []
      });
      
    } catch (err) {
      console.error("Failed to fetch repo state:", err);
    }
  }
}));
