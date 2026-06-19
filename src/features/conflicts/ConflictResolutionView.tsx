import { FileWarning, Info, GitBranch, Check, AlertTriangle, GitMerge } from "lucide-react";
import { useRepositoryStore } from "../../stores/useRepositoryStore";

export function ConflictResolutionView() {
  const toggleMergeState = useRepositoryStore(state => state.toggleMergeState);

  return (
    <div className="flex w-full h-full bg-slate-950">
      
      {/* Left Area: The Resolution Editor */}
      <div className="flex-1 flex flex-col border-r border-slate-800">
        <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
              <FileWarning className="w-5 h-5 text-rose-500" />
              Resolving Conflict in <span className="font-mono text-blue-400 bg-blue-950/50 px-2 py-0.5 rounded">src/utils/graphLayout.ts</span>
            </h2>
            <p className="text-slate-400 mt-2 text-sm">Review both versions and select which code to keep.</p>
          </div>
          <button 
            onClick={toggleMergeState}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium text-sm transition-colors border border-slate-700"
          >
            Abort Merge
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto bg-slate-950">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Version 1: The target branch */}
            <div className="border border-emerald-900/50 rounded-xl overflow-hidden shadow-lg">
              <div className="bg-emerald-950/40 p-4 border-b border-emerald-900/50 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-emerald-400 flex items-center gap-2">
                    <GitBranch className="w-4 h-4" />
                    Changes from <span className="font-mono bg-emerald-900/50 px-1.5 rounded">main</span>
                  </h3>
                  <p className="text-xs text-emerald-500/70 mt-1">This is the code currently on the target branch.</p>
                </div>
                <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-emerald-900/20 flex items-center gap-2">
                  <Check className="w-4 h-4" /> Keep This Version
                </button>
              </div>
              <div className="p-4 font-mono text-sm bg-slate-950">
                <div className="text-slate-500">{'export function buildGraphLayout(history: GitHistory) {'}</div>
                <div className="text-slate-500">{'  const nodes: Node[] = [];'}</div>
                <div className="bg-emerald-900/20 text-emerald-300 py-1 px-2 rounded">{'  const edges: Edge[] = [];'}</div>
                <div className="bg-emerald-900/20 text-emerald-300 py-1 px-2 rounded mt-1">{'  const LANE_WIDTH = 20;'}</div>
                <div className="bg-emerald-900/20 text-emerald-300 py-1 px-2 rounded mt-1">{'  const Y_SPACING = 40;'}</div>
                <div className="text-slate-500 mt-1">{'  // Sort commits newest first'}</div>
              </div>
            </div>

            <div className="flex items-center justify-center relative">
              <div className="absolute w-full h-px bg-slate-800"></div>
              <span className="bg-slate-950 text-slate-500 px-4 text-xs font-bold tracking-widest uppercase relative z-10">OR</span>
            </div>

            {/* Version 2: The source branch */}
            <div className="border border-blue-900/50 rounded-xl overflow-hidden shadow-lg">
              <div className="bg-blue-950/40 p-4 border-b border-blue-900/50 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-400 flex items-center gap-2">
                    <GitBranch className="w-4 h-4" />
                    Changes from <span className="font-mono bg-blue-900/50 px-1.5 rounded">feature/graph-rework</span>
                  </h3>
                  <p className="text-xs text-blue-500/70 mt-1">This is the code you are trying to merge in.</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-900/20 flex items-center gap-2">
                  <Check className="w-4 h-4" /> Keep This Version
                </button>
              </div>
              <div className="p-4 font-mono text-sm bg-slate-950">
                <div className="text-slate-500">{'export function buildGraphLayout(history: GitHistory) {'}</div>
                <div className="text-slate-500">{'  const nodes: Node[] = [];'}</div>
                <div className="bg-blue-900/20 text-blue-300 py-1 px-2 rounded">{'  const edges: Edge[] = [];'}</div>
                <div className="bg-blue-900/20 text-blue-300 py-1 px-2 rounded mt-1">{'  const maxLanes = calculateLanes(history);'}</div>
                <div className="text-slate-500 mt-1">{'  // Sort commits newest first'}</div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Right Area: Educational Context */}
      <div className="w-[400px] bg-slate-900/50 shrink-0 flex flex-col overflow-y-auto custom-scrollbar">
        <div className="p-6 border-b border-slate-800">
          <h3 className="font-bold text-slate-200 text-lg flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-500" />
            Conflict Analysis
          </h3>
        </div>

        <div className="p-6 space-y-8">
          
          <div className="bg-rose-950/20 border border-rose-900/50 rounded-xl p-5">
            <h4 className="font-semibold text-rose-400 flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4" />
              Why did this happen?
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              Git cannot automatically merge these branches because both <span className="font-mono text-xs bg-slate-800 px-1 rounded">main</span> and <span className="font-mono text-xs bg-slate-800 px-1 rounded">feature/graph-rework</span> modified the exact same lines of code in <span className="font-mono text-xs bg-slate-800 px-1 rounded">src/utils/graphLayout.ts</span>.
            </p>
            <p className="text-sm text-slate-300 leading-relaxed mt-4">
              Git doesn't know which version is correct, so it paused the merge and is asking you to make the decision manually.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <GitMerge className="w-4 h-4 text-slate-400" />
              How we got here
            </h4>
            
            <div className="relative pl-4 space-y-6">
              <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-800"></div>

              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-slate-500 border-2 border-slate-900"></div>
                <p className="text-xs text-slate-400 font-medium">March 12</p>
                <p className="text-sm text-slate-200 mt-1">The <span className="font-mono text-xs bg-slate-800 px-1 rounded">feature/graph-rework</span> branch was created from main.</p>
              </div>

              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                <p className="text-xs text-slate-400 font-medium">March 15</p>
                <p className="text-sm text-slate-200 mt-1">Someone else updated <span className="font-mono text-xs bg-slate-800 px-1 rounded">graphLayout.ts</span> directly on main to add lane styling constants.</p>
              </div>

              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-slate-900 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                <p className="text-xs text-slate-400 font-medium">March 18</p>
                <p className="text-sm text-slate-200 mt-1">You updated the exact same section in your feature branch to add <span className="font-mono text-xs bg-slate-800 px-1 rounded">calculateLanes</span>.</p>
              </div>

              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-rose-500 border-2 border-slate-900 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
                <p className="text-xs text-slate-400 font-medium">Today</p>
                <p className="text-sm text-slate-200 mt-1">You tried to merge your feature branch back into main, triggering this conflict.</p>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
