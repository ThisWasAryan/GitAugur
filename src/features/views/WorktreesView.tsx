import { useEffect, useState } from "react";
import { GitBranch, FolderOpen, Trash2, AlertCircle } from "lucide-react";
import { useGitEngineStore } from "../../engine/GitEngineStore";
import { useRepositoryStore } from "../../stores/useRepositoryStore";
import { invoke } from "@tauri-apps/api/core";

export function WorktreesView() {
  const { worktrees, fetchWorktrees } = useGitEngineStore();
  const { repoPath } = useRepositoryStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (repoPath) {
      setIsLoading(true);
      fetchWorktrees().finally(() => setIsLoading(false));
    }
  }, [repoPath, fetchWorktrees]);

  const handleRemove = async (path: string) => {
    if (!repoPath) return;
    setIsLoading(true);
    try {
      await invoke('git_worktree_remove', { repoPath, path });
      await fetchWorktrees();
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex-1 h-full bg-[#010409] p-8 overflow-y-auto min-h-0">
      <div className="flex items-center justify-between mb-8 max-w-6xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <FolderOpen className="w-6 h-6 text-slate-300" />
            Worktrees
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Manage multiple working trees attached to the same repository.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {isLoading && worktrees.length === 0 ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : worktrees.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
            <AlertCircle className="w-8 h-8 opacity-50" />
            <p>No extra worktrees configured.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {worktrees.map((worktree, index) => (
              <div key={`${worktree.path}-${index}`} className="flex items-center gap-4 p-4 border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors group">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-blue-900/30 text-blue-400">
                  <FolderOpen className="w-5 h-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-slate-200 truncate">
                      {worktree.path}
                    </span>
                    {worktree.path === repoPath && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Main
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <GitBranch className="w-3 h-3" />
                      <span className="font-mono">{worktree.branch || 'Detached'}</span>
                    </div>
                    <span className="font-mono text-slate-500">[{worktree.commit.substring(0, 7)}]</span>
                  </div>
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  {worktree.path !== repoPath && (
                    <button 
                      onClick={() => handleRemove(worktree.path)}
                      className="px-3 py-1.5 bg-rose-900/30 hover:bg-rose-900/50 text-rose-400 text-xs font-medium rounded transition-colors border border-rose-800 flex items-center gap-2"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
