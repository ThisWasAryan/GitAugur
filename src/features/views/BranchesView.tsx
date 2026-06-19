import { GitBranch, Plus, ArrowUp, ArrowDown, Trash2 } from "lucide-react";

export function BranchesView() {
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

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <h2 className="font-medium text-slate-300">Local Branches</h2>
        </div>
        <div className="divide-y divide-slate-800/50">
          
          {/* Active Branch */}
          <div className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors bg-blue-950/10">
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-blue-400 font-mono text-sm">main</span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-medium">Active</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Last commit: <span className="font-mono text-slate-400">d18a1f6</span> • 2 mins ago
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 text-xs font-medium">
                <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/50 px-2 py-1 rounded" title="Ahead of origin/main">
                  <ArrowUp className="w-3 h-3" /> 1
                </span>
                <span className="flex items-center gap-1 text-slate-500" title="Behind origin/main">
                  <ArrowDown className="w-3 h-3" /> 0
                </span>
              </div>
              <button className="text-slate-500 hover:text-slate-300 px-3 py-1.5 border border-slate-700 rounded text-xs font-medium transition-colors">
                Rename
              </button>
            </div>
          </div>

          {/* Other Branch */}
          <div className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 bg-transparent rounded-full"></div>
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-slate-300 font-mono text-sm">feature/graph-rework</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Last commit: <span className="font-mono text-slate-400">1b4a4e5</span> • 2 hours ago
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="opacity-0 group-hover:opacity-100 text-slate-300 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded text-xs font-medium transition-all">
                Checkout
              </button>
              <button className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-300 p-1.5 hover:bg-rose-950/50 rounded transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
