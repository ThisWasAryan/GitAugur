import { useEffect, useState } from "react";
import { FolderGit2, RefreshCw, GitCommit, AlertCircle } from "lucide-react";
import { useGitEngineStore } from "../../engine/GitEngineStore";
import { useRepositoryStore } from "../../stores/useRepositoryStore";
import { invoke } from "@tauri-apps/api/core";

export function SubmodulesView() {
  const { submodules, fetchSubmodules } = useGitEngineStore();
  const { repoPath } = useRepositoryStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (repoPath) {
      setIsLoading(true);
      fetchSubmodules().finally(() => setIsLoading(false));
    }
  }, [repoPath, fetchSubmodules]);

  const handleUpdate = async () => {
    if (!repoPath) return;
    setIsLoading(true);
    try {
      await invoke('git_submodule_update', { repoPath });
      await fetchSubmodules();
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex-1 h-full bg-[#010409] p-8 overflow-y-auto min-h-0">
      <div className="flex items-center justify-between mb-8 max-w-6xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <FolderGit2 className="w-6 h-6 text-slate-300" />
            Submodules
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Manage repositories embedded inside this repository.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleUpdate}
            disabled={isLoading}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md font-medium text-sm flex items-center gap-2 transition-colors border border-slate-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Update All
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {isLoading && submodules.length === 0 ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : submodules.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
            <AlertCircle className="w-8 h-8 opacity-50" />
            <p>No submodules configured in this repository.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {submodules.map((submodule, index) => (
              <div key={`${submodule.path}-${index}`} className="flex items-center gap-4 p-4 border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  submodule.status === 'up-to-date' ? 'bg-emerald-900/30 text-emerald-400' :
                  submodule.status === 'modified' ? 'bg-amber-900/30 text-amber-400' :
                  'bg-slate-800 text-slate-400'
                }`}>
                  <FolderGit2 className="w-5 h-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-slate-200 truncate">
                      {submodule.path}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      submodule.status === 'up-to-date' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      submodule.status === 'modified' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {submodule.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <GitCommit className="w-3 h-3" />
                    <span className="font-mono">{submodule.hash.substring(0, 7)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
