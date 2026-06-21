import { GitBranch, Copy, Trash2, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { useGitEngineStore } from "../../engine/GitEngineStore";
import { invoke } from "@tauri-apps/api/core";
import { useRepositoryStore } from "../../stores/useRepositoryStore";
import type { GitBranch as GitBranchType } from "../../types/git";
import { useInspectorStore } from "../../stores/useInspectorStore";
import { useContextMenu } from "../../components/ui/ContextMenu";
import { ActionPreviewModal } from "../preview/ActionPreviewModal";
import { useLayoutStore } from "../../stores/useLayoutStore";


export function BranchesView() {
  const { history, checkout, fetchRepoState } = useGitEngineStore();
  const repoPath = useRepositoryStore(state => state.repoPath);
  const branches = history.branches;
  const { inspectEntity } = useInspectorStore();
  const { showMenu } = useContextMenu();
  const [preview, setPreview] = useState<{isOpen: boolean, action: 'CHECKOUT' | 'DELETE', branch: string}>({
    isOpen: false,
    action: 'CHECKOUT',
    branch: ''
  });
  
  const setCreateBranchModal = useLayoutStore(state => state.setCreateBranchModal);
  
  const defaultBranches = branches.filter(b => b.name === 'main' || b.name === 'master');
  const localBranches = branches.filter(b => !b.isRemote && b.name !== 'main' && b.name !== 'master');
  const remoteBranches = branches.filter(b => b.isRemote && b.name !== 'origin/main' && b.name !== 'origin/master');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const renderBranchTable = (title: string, branchList: GitBranchType[]) => {
    if (branchList.length === 0) return null;

    const isDefaultBranch = (name: string) => name === 'main' || name === 'master' || name === 'origin/main' || name === 'origin/master';

    return (
      <div className="mb-8">
        <h2 className="text-sm font-bold text-slate-100 mb-3">{title}</h2>
        <div className="bg-[#0d1117] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-800 text-xs font-semibold text-slate-400">
            <div className="col-span-4">Branch</div>
            <div className="col-span-2">Updated</div>
            <div className="col-span-2">Check status</div>
            <div className="col-span-2">Behind | Ahead</div>
            <div className="col-span-2">Pull request</div>
          </div>
          {/* Table Body */}
          <div className="divide-y divide-slate-800/50">
            {branchList.map(branch => {
              const branchCommit = history.commits.find(c => c.hash === branch.commitHash);
              const lastCommitTime = branchCommit ? new Date(branchCommit.timestamp).toLocaleDateString() : 'Unknown';
              const ahead = branch.aheadDefault || 0;
              const behind = branch.behindDefault || 0;
              const isDefault = isDefaultBranch(branch.name);
              
              // calculate bar ratio
              const total = ahead + behind;
              const behindPercent = total > 0 ? (behind / total) * 100 : 0;
              const aheadPercent = total > 0 ? (ahead / total) * 100 : 0;

              return (
                <div 
                  key={branch.name}
                  className={`grid grid-cols-12 gap-4 px-6 py-3 items-center hover:bg-slate-800/20 transition-colors group ${branch.isCurrent ? 'bg-blue-950/10' : ''}`}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    showMenu(e.clientX, e.clientY, [
                      { label: 'Checkout', onClick: () => checkout(branch.name) },
                      { divider: true, onClick: () => {} },
                      { label: 'Delete Branch', danger: true, onClick: () => setPreview({ isOpen: true, action: 'DELETE', branch: branch.name }) }
                    ]);
                  }}
                >
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="flex items-center gap-2">
                       <span 
                          className={`font-mono text-xs px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-transparent cursor-pointer hover:underline`}
                          onClick={() => inspectEntity('branch', branch.name)}
                       >
                         {branch.name}
                       </span>
                       <button 
                         className="text-slate-500 hover:text-slate-300 transition-colors" 
                         title="Copy branch name"
                         onClick={(e) => { e.stopPropagation(); copyToClipboard(branch.name); }}
                       >
                         <Copy className="w-3.5 h-3.5" />
                       </button>
                    </div>
                  </div>
                  
                  <div className="col-span-2 flex items-center gap-2 text-xs text-slate-300">
                    <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[8px] font-bold overflow-hidden shadow-inner">
                       <span className="text-slate-400">👤</span>
                    </div>
                    {lastCommitTime}
                  </div>
                  
                  <div className="col-span-2 flex items-center text-xs text-slate-500">
                    {/* Empty check status */}
                  </div>
                  
                  <div className="col-span-2 flex flex-col justify-center">
                    {isDefault ? (
                      <span className="px-2.5 py-0.5 rounded-full border border-slate-700 text-xs text-slate-400 w-fit bg-slate-800/50">Default</span>
                    ) : (
                      <div className="flex flex-col gap-1.5 w-28">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                           <span>{behind}</span>
                           <span>{ahead}</span>
                        </div>
                        <div className="h-1 w-full flex bg-slate-800 rounded-full overflow-hidden">
                          {total > 0 ? (
                            <>
                              <div className="h-full bg-slate-400" style={{ width: `${behindPercent}%` }}></div>
                              <div className="h-full bg-blue-500" style={{ width: `${aheadPercent}%` }}></div>
                            </>
                          ) : (
                            <div className="h-full bg-slate-600 w-full"></div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="col-span-2 flex items-center justify-end gap-2 pr-2">
                    {!branch.isCurrent && !branch.isRemote && (
                      <button 
                        onClick={() => setPreview({ isOpen: true, action: 'CHECKOUT', branch: branch.name })} 
                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-white px-2 py-1 rounded text-xs transition-all bg-slate-800 hover:bg-slate-700 border border-slate-700"
                      >
                        Checkout
                      </button>
                    )}
                    {!branch.isCurrent && (
                      <button 
                        onClick={() => setPreview({ isOpen: true, action: 'DELETE', branch: branch.name })} 
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1.5 rounded transition-all hover:bg-slate-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <button className="text-slate-500 hover:text-slate-300 p-1 transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 h-full bg-[#010409] p-8 overflow-y-auto min-h-0">
      <div className="flex items-center justify-between mb-8 max-w-6xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <GitBranch className="w-6 h-6 text-slate-300" />
            Branches
          </h1>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setCreateBranchModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-emerald-900/20 flex items-center gap-2"
          >
            New branch
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {renderBranchTable('Default', defaultBranches)}
        {renderBranchTable('Your branches', localBranches)}
        {renderBranchTable('Remote branches', remoteBranches)}
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
