import { useGitEngineStore } from "../../engine/GitEngineStore";
import { useInspectorStore } from "../../stores/useInspectorStore";
import { useBranchStore } from "../../stores/useBranchStore";
import { X, GitBranch, ArrowUp, ArrowDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function BranchInspector() {
  const { history } = useGitEngineStore();
  const { inspectedEntityId, showStaging } = useInspectorStore();
  const { branches } = useBranchStore();

  const branch = history.branches.find(b => b.name === inspectedEntityId);
  const branchData = branches.find(b => b.name === inspectedEntityId);

  if (!branch) {
    return (
      <div className="w-80 h-full bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 p-4">
        <div className="text-slate-400">Branch not found.</div>
        <button onClick={showStaging} className="mt-4 text-blue-400 hover:text-blue-300">Back to Staging</button>
      </div>
    );
  }

  const targetCommit = history.commits.find(c => c.hash === branch.commitHash);

  return (
    <div className="w-[400px] h-full bg-slate-900 border-l border-slate-800 flex flex-col shrink-0">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
        <h2 className="font-semibold text-slate-200 flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-emerald-500" />
          Branch Details
        </h2>
        <button 
          onClick={showStaging}
          className="p-1 hover:bg-slate-700 rounded-md text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-emerald-900/30 text-emerald-400 border border-emerald-800/50 px-2 py-0.5 rounded text-xs">
              {branch.name}
            </span>
            {branch.isCurrent && (
              <span className="bg-blue-900/30 text-blue-400 border border-blue-800/50 px-2 py-0.5 rounded text-xs">
                Current
              </span>
            )}
          </div>
          <h3 className="text-sm text-slate-400">
            Last updated {targetCommit ? formatDistanceToNow(new Date(targetCommit.timestamp), { addSuffix: true }) : 'Unknown'}
          </h3>
        </div>

        {/* Sync Status */}
        <div className="flex items-center gap-6 text-sm bg-slate-950 p-4 rounded-lg border border-slate-800">
          <div className="flex flex-col items-center gap-1">
            <ArrowUp className="w-5 h-5 text-emerald-400" />
            <span className="font-medium text-slate-200">{branchData?.ahead || 0} Ahead</span>
          </div>
          <div className="w-px h-8 bg-slate-800"></div>
          <div className="flex flex-col items-center gap-1">
            <ArrowDown className="w-5 h-5 text-rose-400" />
            <span className="font-medium text-slate-200">{branchData?.behind || 0} Behind</span>
          </div>
        </div>

        {/* Target Commit */}
        {targetCommit && (
          <div className="border-t border-slate-800 pt-6">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Head Commit</h4>
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-slate-400">{targetCommit.hash.substring(0, 7)}</span>
              </div>
              <p className="text-sm text-slate-200 font-medium">{targetCommit.message}</p>
              <div className="text-xs text-slate-500">{targetCommit.author.name}</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
