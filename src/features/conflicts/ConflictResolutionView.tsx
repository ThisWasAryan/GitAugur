import { FileWarning, Info } from "lucide-react";
import { ConflictEditor } from "./ConflictEditor";
import { useRepositoryStore } from "../../stores/useRepositoryStore";

export function ConflictResolutionView() {
  const toggleMergeState = useRepositoryStore(state => state.toggleMergeState);

  return (
    <div className="absolute inset-0 bg-slate-950 flex">
      {/* Conflicted Files Sidebar */}
      <div className="w-64 border-r border-slate-800 bg-slate-900 flex flex-col h-full">
        <div className="p-4 border-b border-slate-800">
          <h2 className="font-semibold text-slate-200 flex items-center gap-2">
            <FileWarning className="w-4 h-4 text-rose-500" />
            Merge Conflicts
          </h2>
          <p className="text-xs text-slate-400 mt-1">1 file needs resolution</p>
        </div>
        <div className="flex-1 overflow-auto p-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-md cursor-pointer border border-slate-700">
            <span className="text-rose-400 font-bold text-xs">C</span>
            <span className="text-sm text-slate-200 truncate">src/utils/graphLayout.ts</span>
          </div>
        </div>
        
        {/* Global Action */}
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <button 
            onClick={toggleMergeState}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium text-sm transition-colors border border-slate-700"
          >
            Abort Merge
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col h-full relative">
        <ConflictEditor />

        {/* Guidance Overlay */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-20 pointer-events-none">
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/50 p-4 rounded-xl shadow-2xl flex gap-4 pointer-events-auto items-start">
            <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-200 mb-1">Beginner Guidance: Resolving Conflicts</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Git couldn't automatically merge these changes because the same lines were modified differently. Review the <span className="text-emerald-400">Current Change</span> and the <span className="text-blue-400">Incoming Change</span>, and choose which one to keep, or manually edit the file.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
