import { useGitEngineStore } from "../../engine/GitEngineStore";
import { useInspectorStore } from "../../stores/useInspectorStore";

import { X, GitPullRequest, GitMerge, AlertCircle } from "lucide-react";


export function PullRequestInspector() {
  const { previewMerge } = useGitEngineStore();
  const { inspectedEntityId, showStaging } = useInspectorStore();
  const pullRequests: any[] = [];

  if (!inspectedEntityId) return null;

  const pr = pullRequests.find((pr: any) => pr.id === inspectedEntityId) || {
    id: inspectedEntityId,
    title: "Mock PR",
    author: "User",
    status: "open",
    createdAt: "Unknown"
  };

  if (!pr) {
    return (
      <div className="w-80 h-full bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 p-4">
        <div className="text-slate-400">Pull Request not found.</div>
        <button onClick={showStaging} className="mt-4 text-blue-400 hover:text-blue-300">Back to Staging</button>
      </div>
    );
  }

  return (
    <div className="w-[400px] h-full bg-slate-900 border-l border-slate-800 flex flex-col shrink-0">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
        <h2 className="font-semibold text-slate-200 flex items-center gap-2">
          <GitPullRequest className="w-4 h-4 text-blue-500" />
          Pull Request
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
          <h3 className="text-xl font-bold text-slate-100">{pr.title} <span className="text-slate-500 font-normal">#{pr.id}</span></h3>
          <div className="flex items-center gap-2 mt-3">
            <span className={`px-2 py-0.5 text-xs rounded-full border ${pr.status === 'OPEN' ? 'bg-emerald-950/50 text-emerald-400 border-emerald-900/50' : pr.status === 'MERGED' ? 'bg-purple-950/50 text-purple-400 border-purple-900/50' : 'bg-rose-950/50 text-rose-400 border-rose-900/50'}`}>
              {pr.status === 'OPEN' ? 'Open' : pr.status === 'MERGED' ? 'Merged' : 'Closed'}
            </span>
            <span className="text-sm text-slate-400">
              <span className="font-medium text-slate-300">{pr.author}</span> opened this pull request
            </span>
          </div>
        </div>

        {/* Branches */}
        <div className="flex items-center gap-2 text-sm bg-slate-950 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-400">Into</span>
          <span className="font-mono text-blue-400 bg-blue-950/30 px-1.5 py-0.5 rounded border border-blue-900/50">{pr.targetBranch}</span>
          <span className="text-slate-400">from</span>
          <span className="font-mono text-emerald-400 bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-900/50">{pr.sourceBranch}</span>
        </div>

        {/* Description */}
        <div className="text-slate-300 text-sm leading-relaxed">
          This is a mocked pull request for {pr.title}.
        </div>

        {/* Actions */}
        <div className="border-t border-slate-800 pt-6">
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-emerald-500" />
              <h4 className="font-semibold text-slate-200">This branch has no conflicts with the base branch</h4>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2">
                <GitMerge className="w-4 h-4" />
                Merge pull request
              </button>
              <button 
                className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded-lg font-medium text-sm transition-colors border border-slate-700"
                onClick={() => previewMerge(pr.sourceBranch, pr.targetBranch)}
              >
                Preview Merge
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
