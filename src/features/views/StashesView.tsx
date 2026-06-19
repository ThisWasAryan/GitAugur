import { Archive, Plus } from "lucide-react";

export function StashesView() {
  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 p-8 overflow-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <Archive className="w-8 h-8 text-indigo-500" />
            Stashes
          </h1>
          <p className="text-slate-400 mt-1">Temporarily store modified, tracked files.</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-indigo-900/20">
          <Plus className="w-4 h-4" />
          Stash Changes
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="divide-y divide-slate-800/50">
          <div className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded bg-indigo-900/50 flex items-center justify-center border border-indigo-500/30">
                <Archive className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <div className="font-semibold text-slate-200">stash@{"{0}"}</div>
                <div className="text-xs text-slate-500 mt-0.5">WIP on main: c26 Polish UI elements • 1 hour ago</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-slate-300 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded text-xs font-medium transition-all">
                Apply
              </button>
              <button className="text-slate-300 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded text-xs font-medium transition-all">
                Pop
              </button>
              <button className="text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded text-xs font-medium transition-all hover:bg-rose-950/50">
                Drop
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
