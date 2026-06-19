import { GitPullRequest, CheckCircle2 } from "lucide-react";
import { usePRStore } from "../../stores/usePRStore";

export function PullRequestsView() {
  const pullRequests = usePRStore(state => state.pullRequests);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 p-8 overflow-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <GitPullRequest className="w-8 h-8 text-blue-500" />
          Pull Requests
        </h1>
        <p className="text-slate-400 mt-1">Review and manage code contributions.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="divide-y divide-slate-800/50">
          {pullRequests.map(pr => (
            <div key={pr.id} className="p-6 hover:bg-slate-800/30 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-200 mb-1">{pr.title}</h3>
                  <div className="text-sm text-slate-400 flex items-center gap-2">
                    <span className="font-mono text-slate-500">#{pr.id.split('-')[1]}</span>
                    <span>opened by <span className="text-slate-300 font-medium">{pr.author}</span></span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    {pr.reviews === 'APPROVED' ? (
                      <span className="flex items-center gap-1 text-emerald-400 text-xs font-medium bg-emerald-950/50 px-2 py-1 rounded border border-emerald-900/50">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-400 text-xs font-medium bg-amber-950/50 px-2 py-1 rounded border border-amber-900/50">
                        Pending Review
                      </span>
                    )}
                  </div>
                  <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded transition-colors border border-slate-700">
                    Checkout Branch
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
