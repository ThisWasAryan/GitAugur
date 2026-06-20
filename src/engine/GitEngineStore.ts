import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { toast } from 'sonner';
import type { GitHistory, GitCommit } from '../types/git';
import { useRepositoryStore } from '../stores/useRepositoryStore';
import { useFileStore } from '../stores/useFileStore';

export type FileState = 'added' | 'modified' | 'deleted' | 'untracked' | 'conflicted';

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
  targetBranch?: string;
}

export interface Stash {
  id: string;
  message: string;
}

interface GitEngineState {
  history: GitHistory;
  HEAD: string; // The branch name or commit hash we are currently on
  
  // Working Directory
  unstagedFiles: FileStatus[];
  stagedFiles: FileStatus[];
  stashes: Stash[];
  
  // Preview System
  preview: PreviewState;

  // Selection
  selectedFile: string | null;
  selectedFileDiff: string | null;
  selectedFileIsStaged: boolean;

  // Actions
  stageFile: (path: string) => void;
  unstageFile: (path: string) => void;
  stageAll: () => void;
  unstageAll: () => void;
  selectFile: (path: string) => void;
  selectCommitFile: (commitHash: string, path: string) => void;
  clearSelection: () => void;
  
  // Workflows
  previewCommit: (message: string) => void;
  clearPreview: () => void;
  commit: (message: string) => void;
  
  checkout: (ref: string) => void;
  createBranch: (name: string) => void;
  previewMerge: (sourceBranch: string, targetBranch: string) => Promise<void>;
  rebase: (targetBranch: string) => Promise<void>;
  merge: (sourceBranch: string) => Promise<void>;
  undo: () => Promise<void>;
  fetchReflog: () => Promise<any[]>;
  
  // Interactive toolsrkflows
  stageHunk: (patch: string) => Promise<void>;
  unstageHunk: (patch: string) => Promise<void>;
  rebaseInteractive: (branch: string, instructions: string) => Promise<void>;
  
  // Tauri Backend Methods
  fetchRepoState: (repoPath: string) => Promise<void>;
}

export const useGitEngineStore = create<GitEngineState>((set, get) => ({
  history: { commits: [], branches: [], tags: [] },
  HEAD: '',
  unstagedFiles: [],
  stagedFiles: [],
  stashes: [],
  preview: { active: false, type: null },
  selectedFile: null,
  selectedFileDiff: null,
  selectedFileIsStaged: false,

  selectFile: async (path) => {
    set({ selectedFile: path, selectedFileDiff: null });
    const repoPath = useRepositoryStore.getState().repoPath;
    if (repoPath) {
      try {
        // We assume it's unstaged first. If not found in unstaged, we might need to check if it's staged
        // For simplicity, we just run git diff. If it returns empty, run git diff --cached.
        let diffData: any = await invoke('git_diff', { repoPath, file: path, cached: false });
        if (!diffData.stdout) {
          diffData = await invoke('git_diff', { repoPath, file: path, cached: true });
          set({ selectedFileDiff: diffData.stdout, selectedFileIsStaged: true });
        } else {
          set({ selectedFileDiff: diffData.stdout, selectedFileIsStaged: false });
        }
      } catch (err) {
        toast.error(`Failed to fetch diff: ${err}`);
      }
    } else {
      set({ selectedFileDiff: null });
    }
  },

  selectCommitFile: async (commitHash, path) => {
    set({ selectedFile: path, selectedFileDiff: null });
    const repoPath = useRepositoryStore.getState().repoPath;
    if (repoPath) {
      try {
        await invoke('git_exec', { 
          repoPath, 
          args: ['show', `${commitHash}:${path}`] 
        });
        
        // Wait, git show <commit>:<path> gets the full file content, not the diff!
        // To get the diff for the file in that commit compared to its parent:
        const diffPatch: any = await invoke('git_exec', {
          repoPath,
          args: ['show', commitHash, '--', path]
        });

        // The patch includes the commit message, so we might want format=%b or just use diff
        const actualDiff: any = await invoke('git_exec', {
          repoPath,
          args: ['diff', `${commitHash}~1`, commitHash, '--', path]
        });
        
        let stdout = actualDiff.stdout;
        if (!stdout && diffPatch.stdout) {
            // fallback if it's the first commit (no ~1 parent)
            stdout = diffPatch.stdout;
        }

        set({ selectedFileDiff: stdout });
      } catch (err) {
        toast.error(`Failed to fetch commit file diff: ${err}`);
      }
    }
  },

  clearSelection: () => set({ selectedFile: null, selectedFileDiff: null }),

  stageFile: async (path) => {
    const repoPath = useRepositoryStore.getState().repoPath;
    if (repoPath) {
      try {
        await invoke('git_add', { repoPath, files: [path] });
        get().fetchRepoState(repoPath);
      } catch (err) {
        toast.error(String(err));
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
    if (repoPath) {
      try {
        await invoke('git_reset', { repoPath, files: [path] });
        get().fetchRepoState(repoPath);
      } catch (err) {
        toast.error(String(err));
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

  stageAll: async () => {
    const repoPath = useRepositoryStore.getState().repoPath;
    if (repoPath) {
      const state = get();
      if (state.unstagedFiles.length === 0) return;
      try {
        await invoke('git_add', { repoPath, files: state.unstagedFiles.map(f => f.path) });
        get().fetchRepoState(repoPath);
      } catch (err) {
        toast.error(String(err));
      }
      return;
    }

    set((state) => ({
      stagedFiles: [...state.stagedFiles, ...state.unstagedFiles],
      unstagedFiles: []
    }));
  },

  unstageAll: async () => {
    const repoPath = useRepositoryStore.getState().repoPath;
    if (repoPath) {
      const state = get();
      if (state.stagedFiles.length === 0) return;
      try {
        await invoke('git_reset', { repoPath, files: state.stagedFiles.map(f => f.path) });
        get().fetchRepoState(repoPath);
      } catch (err) {
        toast.error(String(err));
      }
      return;
    }

    set((state) => ({
      unstagedFiles: [...state.unstagedFiles, ...state.stagedFiles],
      stagedFiles: []
    }));
  },

  previewCommit: async (message) => {
    const state = get();
    if (state.stagedFiles.length === 0 || !message.trim()) return;

    const currentBranch = state.history.branches.find(b => b.isCurrent);
    let parentHash = state.HEAD;
    if (currentBranch) {
      parentHash = currentBranch.commitHash;
    } else {
      const branchByName = state.history.branches.find(b => b.name === state.HEAD);
      if (branchByName) {
        parentHash = branchByName.commitHash;
      }
    }

    const ghostHash = `ghost-${Date.now().toString().slice(-6)}`;
    const ghostCommit: GitCommit = {
      hash: ghostHash,
      message,
      author: { name: "Current User", email: "user@example.com" },
      timestamp: new Date().toISOString(),
      parentHashes: [parentHash],
      isGhost: true
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
    if (repoPath) {
      try {
        await invoke('git_commit', { repoPath, message });
        set({ preview: { active: false, type: null } });
        get().fetchRepoState(repoPath);
      } catch (err) {
        toast.error(String(err));
      }
    }
  },

  checkout: async (ref) => {
    const repoPath = useRepositoryStore.getState().repoPath;
    if (repoPath) {
      try {
        let args = ['checkout', ref];
        
        // Find if this is a known remote branch
        const branchObj = get().history.branches.find(b => b.name === ref);
        const isRemoteBranch = branchObj?.isRemote || ref.includes('/');

        if (isRemoteBranch) {
          let localName = ref;
          if (ref.includes('/')) {
            localName = ref.split('/').slice(1).join('/');
          } else {
            // For some reason it's a remote without a slash (e.g. 'origin')
            // This is unsafe to checkout as a local branch named 'origin' directly.
            // But we'll try to use the name anyway, since git checkout origin detaches HEAD.
          }
          
          if (localName) {
            // Look for existing local branch
            const localExists = get().history.branches.some(b => b.name === localName && !b.isRemote);
            
            if (!localExists) {
              // Create tracking branch
              args = ['checkout', '-b', localName, '--track', ref];
            } else {
              // Local exists, just checkout local
              args = ['checkout', localName];
            }
          }
        }

        const result: any = await invoke('git_exec', { repoPath, args });
        if (result && result.success === false) {
          throw new Error(result.stderr || 'Git checkout failed without an error message.');
        }

        get().fetchRepoState(repoPath);
      } catch (err) {
        toast.error(`Checkout failed: ${err}`);
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

  createBranch: async (name) => {
    const repoPath = useRepositoryStore.getState().repoPath;
    if (repoPath) {
      try {
        await invoke('git_switch', { repoPath, branchName: name, create: true });
        get().fetchRepoState(repoPath);
      } catch (err) {
        toast.error(`Failed to create branch: ${err}`);
      }
      return;
    }
  },

  previewMerge: async (sourceBranch, targetBranch) => {
    const state = get();
    const sourceCommitHash = state.history.branches.find(b => b.name === sourceBranch)?.commitHash;
    const targetCommitHash = state.history.branches.find(b => b.name === targetBranch)?.commitHash;

    if (!sourceCommitHash || !targetCommitHash) return;

    let conflictsCount = 0;
    const repoPath = useRepositoryStore.getState().repoPath;
    
    if (repoPath) {
      try {
        const result: any = await invoke('git_merge_tree', { repoPath, targetBranch: sourceBranch });
        if (result.stdout) {
          conflictsCount = (result.stdout.match(/<<<<<<</g) || []).length;
        }
      } catch (e) {
        toast.error(String(e));
      }
    }

    const ghostHash = `ghost-merge-${Date.now().toString().slice(-6)}`;
    const ghostCommit: GitCommit = {
      hash: ghostHash,
      message: `Merge branch '${sourceBranch}' into '${targetBranch}'`,
      author: { name: "Current User", email: "user@example.com" },
      timestamp: new Date().toISOString(),
      parentHashes: [targetCommitHash, sourceCommitHash],
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
          conflicts: conflictsCount,
          health: conflictsCount > 0 ? "Conflicts Detected" : "Healthy"
        }
      }
    });
  },

  rebase: async (targetBranch: string) => {
    const repoPath = useRepositoryStore.getState().repoPath;
    if (repoPath) {
      try {
        await invoke('git_exec', { repoPath, args: ['rebase', targetBranch] });
        get().fetchRepoState(repoPath);
      } catch (err) {
        toast.error(`Failed to rebase: ${err}`);
      }
    }
  },

  merge: async (sourceBranch: string) => {
    const repoPath = useRepositoryStore.getState().repoPath;
    if (repoPath) {
      try {
        await invoke('git_exec', { repoPath, args: ['merge', sourceBranch] });
        get().fetchRepoState(repoPath);
      } catch (err) {
        console.error("Failed to merge:", err);
      }
    }
  },

  fetchReflog: async () => {
    const repoPath = useRepositoryStore.getState().repoPath;
    if (repoPath) {
      try {
        const res: any = await invoke('git_reflog', { repoPath });
        if (res.success && res.stdout) {
          return res.stdout.split('\n').filter(Boolean).map((line: string) => {
            const parts = line.split(' ');
            return { hash: parts[0], action: parts.slice(1).join(' ') };
          });
        }
      } catch (err) {
        console.error("Failed to fetch reflog:", err);
      }
    }
    return [];
  },

  undo: async () => {
    const repoPath = useRepositoryStore.getState().repoPath;
    if (repoPath) {
      try {
        await invoke('git_exec', { repoPath, args: ['reset', '--hard', 'HEAD@{1}'] });
        get().fetchRepoState(repoPath);
        toast.success("Successfully undone last action");
      } catch (err) {
        toast.error("Failed to undo");
        console.error("Failed to undo:", err);
      }
    }
  },

  stageHunk: async (patch: string) => {
    const repoPath = useRepositoryStore.getState().repoPath;
    if (repoPath) {
      try {
        await invoke('git_apply_cached', { repoPath, patch, reverse: false });
        get().fetchRepoState(repoPath);
      } catch (err) {
        toast.error(`Failed to stage hunk: ${err}`);
      }
    }
  },

  unstageHunk: async (patch: string) => {
    const repoPath = useRepositoryStore.getState().repoPath;
    if (repoPath) {
      try {
        await invoke('git_apply_cached', { repoPath, patch, reverse: true });
        get().fetchRepoState(repoPath);
      } catch (err) {
        toast.error(`Failed to unstage hunk: ${err}`);
      }
    }
  },

  rebaseInteractive: async (branch: string, instructions: string) => {
    const repoPath = useRepositoryStore.getState().repoPath;
    if (repoPath) {
      try {
        await invoke('git_rebase_interactive', { repoPath, branch, instructions });
        get().fetchRepoState(repoPath);
      } catch (err) {
        toast.error(`Interactive rebase failed: ${err}`);
      }
    }
  },

  fetchRepoState: async (repoPath: string) => {
    try {
      if (!repoPath) {
        return;
      }

      // Invoke Tauri command
      const historyData: any = await invoke('get_repo_state', { repoPath });
      await useFileStore.getState().fetchFiles(repoPath);
      
      // Map backend GitHistoryData to frontend GitHistory
      
      const head = historyData.head || 'HEAD';
      const currentBranch = historyData.branches.find((b: any) => b.isCurrent);
      
      if (currentBranch) {
        currentBranch.isCurrent = true;
      }

      // Fetch Stashes
      let parsedStashes: Stash[] = [];
      try {
        const stashData: any = await invoke('git_stash_list', { repoPath });
        if (stashData.success && stashData.stdout) {
          const lines = stashData.stdout.split('\n').filter(Boolean);
          parsedStashes = lines.map((line: string) => {
            const [id, ...msgParts] = line.split('\x00');
            return { id, message: msgParts.join('\x00') };
          });
        }
      } catch (err) {
        toast.error(`Failed to fetch stashes: ${err}`);
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
        unstagedFiles: historyData.unstagedFiles || [],
        stashes: parsedStashes
      });
      
      if (historyData.repositoryState) {
        useRepositoryStore.getState().setRepositoryState(historyData.repositoryState as any);
      }
      
    } catch (err) {
      toast.error(`Failed to fetch repo state: ${err}`);
    }
  }
}));
