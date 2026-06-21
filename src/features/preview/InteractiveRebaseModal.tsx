import { useState, useEffect } from "react";
import { GitCommit, X, Check, ArrowDown, ArrowUp } from "lucide-react";
import { useGitEngineStore } from "../../engine/GitEngineStore";
import { invoke } from "@tauri-apps/api/core";

export type RebaseAction = "pick" | "squash" | "reword" | "edit" | "drop";

export interface RebaseCommit {
  hash: string;
  message: string;
  action: RebaseAction;
  newMessage?: string;
}

export function InteractiveRebaseModal({
  isOpen,
  onClose,
  baseCommitHash,
}: {
  isOpen: boolean;
  onClose: () => void;
  baseCommitHash: string;
}) {
  const { repoPath } = useGitEngineStore();
  const [commits, setCommits] = useState<RebaseCommit[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && baseCommitHash && repoPath) {
      // Fetch commits between baseCommitHash and HEAD
      invoke('git_exec', {
        repoPath,
        args: ['log', `${baseCommitHash}..HEAD`, '--pretty=format:%h|%s', '--reverse']
      }).then((res: any) => {
        if (res.success && res.stdout) {
          const lines = res.stdout.trim().split('\n');
          const loaded = lines.map((line: string) => {
            const [hash, ...msgParts] = line.split('|');
            return {
              hash,
              message: msgParts.join('|'),
              action: "pick" as RebaseAction
            };
          }).filter((c: any) => c.hash);
          setCommits(loaded);
        }
      });
    }
  }, [isOpen, baseCommitHash, repoPath]);

  const updateAction = (index: number, action: RebaseAction) => {
    const newCommits = [...commits];
    newCommits[index].action = action;
    setCommits(newCommits);
  };

  const updateMessage = (index: number, newMessage: string) => {
    const newCommits = [...commits];
    newCommits[index].newMessage = newMessage;
    setCommits(newCommits);
  };

  const moveCommit = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newCommits = [...commits];
      [newCommits[index - 1], newCommits[index]] = [newCommits[index], newCommits[index - 1]];
      setCommits(newCommits);
    } else if (direction === 'down' && index < commits.length - 1) {
      const newCommits = [...commits];
      [newCommits[index + 1], newCommits[index]] = [newCommits[index], newCommits[index + 1]];
      setCommits(newCommits);
    }
  };

  const handleConfirm = async () => {
    if (!repoPath) return;
    setIsSubmitting(true);
    
    // Build instructions
    const instructions = commits.map(c => {
      let line = `${c.action} ${c.hash} ${c.newMessage || c.message}`;
      return line;
    }).join('\n');

    try {
      await invoke('git_rebase_interactive', {
        repoPath,
        branch: baseCommitHash,
        instructions
      });
      useGitEngineStore.getState().fetchRepoState(repoPath);
      onClose();
    } catch (err) {
      console.error("Rebase failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between p-4 border-b border-slate-800 shrink-0">
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <GitCommit className="text-amber-500 w-5 h-5" />
            Interactive Rebase
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <p className="text-sm text-slate-400 mb-4">
            Rebasing commits onto <span className="font-mono text-amber-400 bg-amber-950/50 px-1 rounded">{baseCommitHash.substring(0, 7)}</span>. 
            Adjust the actions or reorder commits below. Commits are listed from oldest to newest.
          </p>

          <div className="space-y-2">
            {commits.map((c, i) => (
              <div key={c.hash + i} className={`flex items-start gap-3 p-3 border rounded-lg ${c.action === 'drop' ? 'border-rose-900/50 bg-rose-950/10 opacity-50' : c.action === 'squash' ? 'border-amber-900/50 bg-amber-950/10' : 'border-slate-800 bg-slate-800/20'}`}>
                <div className="flex flex-col gap-1 mt-1 shrink-0">
                  <button onClick={() => moveCommit(i, 'up')} disabled={i === 0} className="text-slate-500 hover:text-slate-300 disabled:opacity-30">
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button onClick={() => moveCommit(i, 'down')} disabled={i === commits.length - 1} className="text-slate-500 hover:text-slate-300 disabled:opacity-30">
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>
                
                <div className="flex flex-col gap-2 flex-1">
                  <div className="flex items-center gap-3">
                    <select 
                      value={c.action}
                      onChange={(e) => updateAction(i, e.target.value as RebaseAction)}
                      className={`text-xs font-semibold px-2 py-1 rounded bg-slate-950 border ${
                        c.action === 'drop' ? 'text-rose-400 border-rose-900' :
                        c.action === 'squash' ? 'text-amber-400 border-amber-900' :
                        c.action === 'reword' ? 'text-blue-400 border-blue-900' :
                        'text-emerald-400 border-emerald-900'
                      }`}
                    >
                      <option value="pick">Pick</option>
                      <option value="squash">Squash</option>
                      <option value="reword">Reword</option>
                      <option value="edit">Edit</option>
                      <option value="drop">Drop</option>
                    </select>
                    
                    <span className="font-mono text-xs text-slate-500">{c.hash}</span>
                    
                    {c.action !== 'reword' && (
                      <span className={`text-sm truncate ${c.action === 'drop' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                        {c.message}
                      </span>
                    )}
                  </div>
                  
                  {c.action === 'reword' && (
                    <input 
                      type="text"
                      value={c.newMessage ?? c.message}
                      onChange={(e) => updateMessage(i, e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                      placeholder="New commit message"
                    />
                  )}
                </div>
              </div>
            ))}
            
            {commits.length === 0 && (
              <div className="text-center text-slate-500 py-8">
                No commits found to rebase.
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-800 bg-slate-900 shrink-0">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            disabled={commits.length === 0 || isSubmitting}
            className="px-5 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-amber-900/20"
          >
            {isSubmitting ? 'Rebasing...' : <><Check className="w-4 h-4" /> Start Rebase</>}
          </button>
        </div>
      </div>
    </div>
  );
}
