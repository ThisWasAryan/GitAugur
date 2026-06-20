import { Tags, Plus } from "lucide-react";
import { useGitEngineStore } from "../../engine/GitEngineStore";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useRepositoryStore } from "../../stores/useRepositoryStore";

export function TagsView() {
  const { history, fetchRepoState } = useGitEngineStore();
  const repoPath = useRepositoryStore(state => state.repoPath);
  const [isCreating, setIsCreating] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagMessage, setNewTagMessage] = useState("");

  const handleCreateTag = async () => {
    if (!repoPath || !newTagName) return;
    try {
      await invoke('git_tag_create', { 
        repoPath, 
        tagName: newTagName, 
        message: newTagMessage || null 
      });
      setIsCreating(false);
      setNewTagName("");
      setNewTagMessage("");
      // Refresh repository state
      await fetchRepoState(repoPath);
    } catch (err) {
      console.error(err);
      // could show an error toast here
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 p-8 overflow-y-auto min-h-0">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <Tags className="w-8 h-8 text-amber-500" />
            Tags
          </h1>
          <p className="text-slate-400 mt-1">Mark important points in your repository history.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-amber-900/20"
        >
          <Plus className="w-4 h-4" />
          Create Tag
        </button>
      </div>

      {isCreating && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8 flex flex-col gap-4">
          <h3 className="font-semibold text-slate-200">Create New Tag</h3>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-slate-400">Tag Name</label>
            <input 
              type="text" 
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="v1.0.0"
              className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-slate-400">Message (Optional)</label>
            <input 
              type="text" 
              value={newTagMessage}
              onChange={(e) => setNewTagMessage(e.target.value)}
              placeholder="Release version 1.0.0"
              className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="flex items-center gap-3 mt-2 justify-end">
            <button 
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleCreateTag}
              className="px-4 py-2 text-sm font-medium bg-amber-600 hover:bg-amber-500 text-white rounded transition-colors"
            >
              Create
            </button>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="divide-y divide-slate-800/50">
          {history.tags.length > 0 ? (
            history.tags.map(tag => {
              const commit = history.commits.find(c => c.hash === tag.commitHash);
              const dateStr = commit ? formatDistanceToNow(new Date(commit.timestamp), { addSuffix: true }) : 'Unknown time';
              
              return (
                <div key={tag.name} className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <Tags className="w-5 h-5 text-slate-500" />
                    <div>
                      <div className="font-semibold text-slate-200">{tag.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">Tagged on {dateStr}</div>
                    </div>
                  </div>
                  <div className="font-mono text-xs text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                    {tag.commitHash.substring(0, 7)}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-500">
              No tags found in this repository.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
