import { GitBranch, Plus, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { useState } from "react";
import { useBranchStore, type BranchData } from "../../stores/useBranchStore";
import { ActionPreviewModal } from "../preview/ActionPreviewModal";
import { useInspectorStore } from "../../stores/useInspectorStore";
import { useContextMenu } from "../../components/ui/ContextMenu";

export function BranchesView() {
  const { branches, checkoutBranch, deleteBranch } = useBranchStore();
  const { inspectEntity } = useInspectorStore();
  const { showMenu } = useContextMenu();
  const [preview, setPreview] = useState<{isOpen: boolean, action: 'CHECKOUT' | 'DELETE' | null, branch: string}>({ isOpen: false, action: null, branch: "" });
  
  const localBranches = branches.filter(b => !b.isRemote);
  const remoteBranches = branches.filter(b => b.isRemote);

  const renderBranch = (branch: BranchData) => (
    <div 
      key={branch.name} 
      className={`px-6 py-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors cursor-pointer group ${branch.isActive ? 'bg-blue-950/10' : ''}`}
      onClick={() => inspectEntity('branch', branch.name)}
      onContextMenu={(e) => {
        e.preventDefault();
        showMenu(e.clientX, e.clientY, [
          { label: 'Checkout', onClick: () => checkoutBranch(branch.name) },
          { divider: true, onClick: () => {} },
          { label: 'Delete Branch', danger: true, onClick: () => setPreview({ isOpen: true, action: 'DELETE', branch: branch.name }) }
        ]);
      }}
    >
      <div className="flex items-center gap-4">
        <div className={`w-2 h-2 rounded-full ${branch.isActive ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'bg-transparent'}`}></div>
        <div>
          <div className="flex items-center gap-3">
            <span className={`font-mono text-sm ${branch.isActive ? 'font-semibold text-blue-400' : 'font-medium text-slate-300'}`}>{branch.name}</span>
            {branch.isActive && <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-medium">Active</span>}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Last commit: <span className="font-mono text-slate-400">{branch.lastCommitHash}</span> • {branch.lastCommitTime}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 text-xs font-medium">
          <span className={`flex items-center gap-1 px-2 py-1 rounded ${branch.ahead > 0 ? 'text-emerald-400 bg-emerald-950/50' : 'text-slate-500'}`} title="Ahead of origin">
            <ArrowUp className="w-3 h-3" /> {branch.ahead}
          </span>
          <span className={`flex items-center gap-1 px-2 py-1 rounded ${branch.behind > 0 ? 'text-rose-400 bg-rose-950/50' : 'text-slate-500'}`} title="Behind origin">
            <ArrowDown className="w-3 h-3" /> {branch.behind}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!branch.isActive && !branch.isRemote && (
            <button 
              onClick={() => setPreview({ isOpen: true, action: 'CHECKOUT', branch: branch.name })}
              className="opacity-0 group-hover:opacity-100 text-slate-300 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded text-xs font-medium transition-all"
            >
              Checkout
            </button>
          )}
          {!branch.isActive && (
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
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-900/20">
          <Plus className="w-4 h-4" />
          New Branch
        </button>
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
        onConfirm={() => {
          if (preview.action === 'CHECKOUT') checkoutBranch(preview.branch);
          if (preview.action === 'DELETE') deleteBranch(preview.branch);
        }}
        action={preview.action}
        branchName={preview.branch}
      />
    </div>
  );
}
