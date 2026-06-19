import { Check, ArrowRightLeft } from "lucide-react";

export function ConflictEditor() {
  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden h-full">
      <div className="h-12 border-b border-slate-800 flex items-center justify-between px-4 bg-slate-900/50">
        <h3 className="text-sm font-semibold text-slate-200 font-mono">src/utils/graphLayout.ts</h3>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            Accept Current
          </button>
          <button className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            Accept Incoming
          </button>
          <button className="px-3 py-1.5 text-xs font-medium bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors flex items-center gap-1">
            <ArrowRightLeft className="w-3.5 h-3.5" />
            Accept Both
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto flex flex-col">
        {/* Current Change (Local) */}
        <div className="border-b border-emerald-900/50 bg-emerald-950/20">
          <div className="bg-emerald-900/50 px-4 py-1 flex items-center justify-between text-emerald-200 text-xs font-medium">
            <span>Current Change (main)</span>
            <span className="text-emerald-400 font-mono opacity-50">HEAD</span>
          </div>
          <div className="p-4 font-mono text-sm">
            <div className="text-slate-400">{'export function buildGraphLayout(history: GitHistory) {'}</div>
            <div className="text-slate-400">{'  const nodes: Node[] = [];'}</div>
            <div className="bg-emerald-900/30 text-emerald-300 py-0.5">{'  const edges: Edge[] = [];'}</div>
            <div className="bg-emerald-900/30 text-emerald-300 py-0.5">{'  const LANE_WIDTH = 20;'}</div>
            <div className="bg-emerald-900/30 text-emerald-300 py-0.5">{'  const Y_SPACING = 40;'}</div>
            <div className="text-slate-400">{'  // Sort commits newest first'}</div>
          </div>
        </div>

        {/* Separator */}
        <div className="h-1 bg-rose-500/20 w-full relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-rose-900 text-rose-300 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase border border-rose-800">
            Conflict
          </div>
        </div>

        {/* Incoming Change (Remote/Merge) */}
        <div className="bg-blue-950/20 flex-1">
          <div className="bg-blue-900/50 px-4 py-1 flex items-center justify-between text-blue-200 text-xs font-medium">
            <span>Incoming Change (feature/graph-rework)</span>
            <span className="text-blue-400 font-mono opacity-50">1b4a4e5</span>
          </div>
          <div className="p-4 font-mono text-sm">
            <div className="text-slate-400">{'export function buildGraphLayout(history: GitHistory) {'}</div>
            <div className="text-slate-400">{'  const nodes: Node[] = [];'}</div>
            <div className="bg-blue-900/30 text-blue-300 py-0.5">{'  const edges: Edge[] = [];'}</div>
            <div className="bg-blue-900/30 text-blue-300 py-0.5">{'  const maxLanes = calculateLanes(history);'}</div>
            <div className="text-slate-400">{'  // Sort commits newest first'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
