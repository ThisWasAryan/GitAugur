import { GitBranch, Plus, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { useState } from "react";
import { useGitEngineStore } from "../../engine/GitEngineStore";
import { invoke } from "@tauri-apps/api/core";
import { useRepositoryStore } from "../../stores/useRepositoryStore";
import type { GitBranch as GitBranchType } from "../../types/git";
import { useInspectorStore } from "../../stores/useInspectorStore";
import { useContextMenu } from "../../components/ui/ContextMenu";
import { ActionPreviewModal } from "../preview/ActionPreviewModal";

export function BranchesView() {
  const { history, checkout, createBranch, fetchRepoState } = useGitEngineStore();
  const repoPath = useRepositoryStore(state => state.repoPath);
  const branches = history.branches;
  const { inspectEntity } = useInspectorStore();
  const { showMenu } = useContextMenu();
  const [preview, setPreview] = useState<{isOpen: boolean, action: 'CHECKOUT' | 'DELETE' | null, branch: string}>({ isOpen: false, action: null, branch: "" });
  const [isCreating, setIsCreating] = useState(false);
  const [newBranchName, setNewBranchName] = useState("");
  
  const localBranches = branches.filter(b => !b.isRemote);
  const remoteBranches = branches.filter(b => b.isRemote);

  const renderBranch = (branch: GitBranchType) => {
    const branchCommit = history.commits.find(c => c.hash === branch.commitHash);
    const lastCommitTime = branchCommit ? new Date(branchCommit.timestamp).toLocaleDateString() : 'Unknown';
    const ahead = branch.ahead || 0;
    const behind = branch.behind || 0;

    return (
      <div 
        key={branch.name} 
        className={`px-6 py-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors cursor-pointer group ${branch.isCurrent ? 'bg-blue-950/10' : ''}`}
        onClick={() => inspectEntity('branch', branch.name)}
        onContextMenu={(e) => {
          e.preventDefault();
          showMenu(e.clientX, e.clientY, [
            { label: 'Checkout', onClick: () => checkout(branch.name) },
            { divider: true, onClick: () => {} },
            { label: 'Delete Branch', danger: true, onClick: () => setPreview({ isOpen: true, action: 'DELETE', branch: branch.name }) }
          ]);
        }}
      >
        <div className="flex items-center gap-4">
          <div className={`w-2 h-2 rounded-full ${branch.isCurrent ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'bg-transparent'}`}></div>
          <div>
            <div className="flex items-center gap-3">
              <span className={`font-mono text-sm ${branch.isCurrent ? 'font-semibold text-blue-400' : 'font-medium text-slate-300'}`}>{branch.name}</span>
              {branch.isCurrent && <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-medium">Active</span>}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Last commit: <span className="font-mono text-slate-400">{branch.commitHash.slice(0, 7)}</span> • {lastCommitTime}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 text-xs font-medium">
            <span className={`flex items-center gap-1 px-2 py-1 rounded ${ahead > 0 ? 'text-emerald-400 bg-emerald-950/50' : 'text-slate-500'}`} title="Ahead of origin">
              <ArrowUp className="w-3 h-3" /> {ahead}
            </span>
            <span className={`flex items-center gap-1 px-2 py-1 rounded ${behind > 0 ? 'text-rose-400 bg-rose-950/50' : 'text-slate-500'}`} title="Behind origin">
              <ArrowDown className="w-3 h-3" /> {behind}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {!branch.isCurrent && !branch.isRemote && (
              <button 
                onClick={() => setPreview({ isOpen: true, action: 'CHECKOUT', branch: branch.name })}
                className="opacity-0 group-hover:opacity-100 text-slate-300 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded text-xs font-medium transition-all"
              >
                Checkout
              </button>
            )}
            {!branch.isCurrent && (
              <button 
                onClick={() => setPreview({ isOpen: true, action: 'DELETE', branch: branch.name })}
                className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-300 p-1.5 hover:bg-rose-950/50 rounded transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 p-8 overflow-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <GitBranch className="w-8 h-8 text-blue-500" />
            Branches
          </h1>
          <p className="text-slate-400 mt-1">Manage local and remote branches.</p>
        </div>
        <div className="flex gap-2">
          {isCreating && (
            <input 
              type="text" 
              autoFocus
              placeholder="Branch name..." 
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newBranchName.trim()) {
                  createBranch(newBranchName.trim());
                  setIsCreating(false);
                  setNewBranchName("");
                }
                if (e.key === 'Escape') {
                  setIsCreating(false);
                }
              }}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500 w-64"
            />
          )}
          <button 
            onClick={() => {
              if (isCreating && newBranchName.trim()) {
                createBranch(newBranchName.trim());
                setIsCreating(false);
                setNewBranchName("");
              } else {
                setIsCreating(!isCreating);
              }
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-900/20"
          >
            <Plus className="w-4 h-4" />
            {isCreating ? 'Create' : 'New Branch'}
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <h2 className="font-medium text-slate-300">Local Branches</h2>
        </div>
        <div className="divide-y divide-slate-800/50">
          {localBranches.map(renderBranch)}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <h2 className="font-medium text-slate-300">Remote Branches</h2>
        </div>
        <div className="divide-y divide-slate-800/50">
          {remoteBranches.map(renderBranch)}
        </div>
      </div>

      <ActionPreviewModal 
        isOpen={preview.isOpen}
        onClose={() => setPreview({ ...preview, isOpen: false })}
        onConfirm={async () => {
          if (preview.action === 'CHECKOUT') checkout(preview.branch);
          if (preview.action === 'DELETE' && repoPath) {
            await invoke('git_branch_delete', { repoPath, branchName: preview.branch });
            fetchRepoState(repoPath);
          }
        }}
        action={preview.action}
        branchName={preview.branch}
      />
    </div>
  );
}
