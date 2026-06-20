import { Archive, Plus } from "lucide-react";
import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useGitEngineStore } from "../../engine/GitEngineStore";
import { useRepositoryStore } from "../../stores/useRepositoryStore";

export function StashesView() {
  const { stashes, fetchRepoState } = useGitEngineStore();
  const repoPath = useRepositoryStore(state => state.repoPath);
  const [isStashing, setIsStashing] = useState(false);
  const [stashMessage, setStashMessage] = useState("");

  const handleStashPush = async () => {
    if (!repoPath) return;
    try {
      await invoke('git_stash_push', { repoPath, message: stashMessage || null });
      setIsStashing(false);
      setStashMessage("");
      await fetchRepoState(repoPath);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePop = async () => {
    if (!repoPath) return;
    try {
      await invoke('git_stash_pop', { repoPath });
      await fetchRepoState(repoPath);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApply = async (stashId: string) => {
    if (!repoPath) return;
    try {
      await invoke('git_exec', { repoPath, args: ['stash', 'apply', stashId] });
      await fetchRepoState(repoPath);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDrop = async (stashId: string) => {
    if (!repoPath) return;
    try {
      await invoke('git_stash_drop', { repoPath, stashRef: stashId });
      await fetchRepoState(repoPath);
    } catch (err) {
      console.error(err);
    }
  };
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
        <button 
          onClick={() => setIsStashing(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-indigo-900/20"
        >
          <Plus className="w-4 h-4" />
          Stash Changes
        </button>
      </div>

      {isStashing && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8 flex flex-col gap-4">
          <h3 className="font-semibold text-slate-200">Stash Local Changes</h3>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-slate-400">Message (Optional)</label>
            <input 
              type="text" 
              value={stashMessage}
              onChange={(e) => setStashMessage(e.target.value)}
              placeholder="WIP on feature X..."
              className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center gap-3 mt-2 justify-end">
            <button 
              onClick={() => setIsStashing(false)}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleStashPush}
              className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors"
            >
              Stash
            </button>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="divide-y divide-slate-800/50">
          {stashes.length > 0 ? (
            stashes.map((stash) => (
              <div key={stash.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded bg-indigo-900/50 flex items-center justify-center border border-indigo-500/30">
                    <Archive className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">{stash.id}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{stash.message}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleApply(stash.id)}
                    className="text-slate-300 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded text-xs font-medium transition-all"
                  >
                    Apply
                  </button>
                  <button 
                    onClick={handlePop}
                    className="text-slate-300 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded text-xs font-medium transition-all"
                  >
                    Pop
                  </button>
                  <button 
                    onClick={() => handleDrop(stash.id)}
                    className="text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded text-xs font-medium transition-all hover:bg-rose-950/50"
                  >
                    Drop
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500">
              No stashes found in this repository.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
