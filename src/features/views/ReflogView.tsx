import { useEffect, useState } from "react";
import { GitCommit, History, AlertCircle } from "lucide-react";
import { useGitEngineStore } from "../../engine/GitEngineStore";
import { useRepositoryStore } from "../../stores/useRepositoryStore";
import { ActionPreviewModal } from "../preview/ActionPreviewModal";

interface ReflogEntry {
  hash: string;
  action: string;
}

export function ReflogView() {
  const { fetchReflog, history, checkout } = useGitEngineStore();
  const { repoPath } = useRepositoryStore();
  const [entries, setEntries] = useState<ReflogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<{ isOpen: boolean; action: 'CHECKOUT' | null; hash?: string }>({ isOpen: false, action: null });

  useEffect(() => {
    if (repoPath) {
      setIsLoading(true);
      fetchReflog().then(data => {
        setEntries(data || []);
        setIsLoading(false);
      });
    }
  }, [repoPath, fetchReflog, history.commits.length]);

  return (
    <div className="flex-1 h-full bg-[#010409] p-8 overflow-y-auto min-h-0">
      <div className="flex items-center justify-between mb-8 max-w-6xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <History className="w-6 h-6 text-slate-300" />
            Reflog
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            The reference logs show a timeline of where your HEAD and branch pointers were over time.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
            <AlertCircle className="w-8 h-8 opacity-50" />
            <p>No reflog entries found.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {entries.map((entry, index) => {
              const actionType = entry.action.includes("commit") ? "commit" : 
                                 entry.action.includes("rebase") ? "rebase" : 
                                 entry.action.includes("checkout") ? "checkout" : 
                                 entry.action.includes("merge") ? "merge" : 
                                 entry.action.includes("reset") ? "reset" : "other";

              return (
                <div key={`${entry.hash}-${index}`} className="flex items-center gap-4 p-4 border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors group">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    actionType === 'commit' ? 'bg-emerald-900/30 text-emerald-400' :
                    actionType === 'rebase' ? 'bg-amber-900/30 text-amber-400' :
                    actionType === 'checkout' ? 'bg-blue-900/30 text-blue-400' :
                    actionType === 'merge' ? 'bg-purple-900/30 text-purple-400' :
                    actionType === 'reset' ? 'bg-rose-900/30 text-rose-400' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    <GitCommit className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono text-sm text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {entry.hash.substring(0, 7)}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        HEAD@&#123;{index}&#125;
                      </span>
                    </div>
                    <div className="text-sm text-slate-300 truncate font-medium">
                      {entry.action}
                    </div>
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setPreview({ isOpen: true, action: 'CHECKOUT', hash: entry.hash })}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded transition-colors border border-slate-700"
                    >
                      Checkout State
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ActionPreviewModal 
        isOpen={preview.isOpen}
        onClose={() => setPreview({ ...preview, isOpen: false })}
        onConfirm={() => {
          if (preview.action === 'CHECKOUT' && preview.hash) {
            checkout(preview.hash);
          }
        }}
        action={preview.action}
        branchName={preview.hash}
      />
    </div>
  );
}
