import { useState } from "react";
import { useGitEngineStore } from "../../engine/GitEngineStore";
import { useTerminology } from "../../hooks/useTerminology";

export function CommitForm() {
  const { t } = useTerminology();
  const [commitMessage, setCommitMessage] = useState("");
  const [amend, setAmend] = useState(false);
  const [skipHooks, setSkipHooks] = useState(false);
  const { stagedFiles, commit, previewCommit, preview, clearPreview, history, HEAD } = useGitEngineStore();

  const handleAmendToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setAmend(isChecked);
    if (isChecked) {
      const currentBranch = history.branches.find(b => b.isCurrent);
      const headHash = currentBranch ? currentBranch.commitHash : HEAD;
      const headCommit = history.commits.find(c => c.hash === headHash);
      if (headCommit && !commitMessage) {
        setCommitMessage(headCommit.message);
      }
    }
  };

  const handleCommit = () => {
    if (!amend && stagedFiles.length === 0) return;
    if (!commitMessage.trim()) return;
    commit(commitMessage, amend, skipHooks);
    setCommitMessage("");
    setAmend(false);
    setSkipHooks(false);
  };

  const handlePreview = () => {
    if (stagedFiles.length === 0 || !commitMessage.trim()) return;
    previewCommit(commitMessage);
  };

  const isCommitEnabled = (stagedFiles.length > 0 || amend) && commitMessage.trim().length > 0;

  return (
    <div className="mt-auto border-t border-slate-800 p-4 bg-slate-900/50">
      <div className="flex flex-col gap-3">
        <textarea
          value={commitMessage}
          onChange={(e) => {
            setCommitMessage(e.target.value);
            if (preview.active) clearPreview();
          }}
          placeholder={`${t('Commit')} message...`}
          className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none h-24"
        />
        
        {/* Advanced Commit Options */}
        <div className="flex items-center gap-4 text-xs text-slate-400 px-1">
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-300 transition-colors">
            <input 
              type="checkbox" 
              checked={amend}
              onChange={handleAmendToggle}
              className="rounded bg-slate-900 border-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900"
            />
            Amend (HEAD)
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-300 transition-colors">
            <input 
              type="checkbox" 
              checked={skipHooks}
              onChange={(e) => setSkipHooks(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900"
            />
            Skip Hooks
          </label>
        </div>

        {preview.active && preview.impact && (
          <div className="bg-blue-900/20 border border-blue-900/50 rounded-md p-3 text-sm">
            <h4 className="text-blue-400 font-medium mb-2">Operation Impact</h4>
            <div className="grid grid-cols-2 gap-2 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Commits Added</span>
                <span className="text-blue-400">+{preview.impact.commitsAdded}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Files Changed</span>
                <span className="text-yellow-400">{preview.impact.filesModified}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Conflicts</span>
                <span className={preview.impact.conflicts > 0 ? "text-red-400" : "text-green-400"}>
                  {preview.impact.conflicts}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Health</span>
                <span className="text-green-400">{preview.impact.health}</span>
              </div>
            </div>
            <p className="text-xs text-blue-400/80 mt-2 italic">
              See the ghost node in the graph for prediction.
            </p>
          </div>
        )}

        <div className="flex gap-2">
          {!preview.active ? (
            <button
              onClick={handlePreview}
              disabled={!isCommitEnabled}
              className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${
                isCommitEnabled 
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700' 
                  : 'bg-slate-800/50 text-slate-600 cursor-not-allowed border border-transparent'
              }`}
            >
              Preview
            </button>
          ) : (
            <button
              onClick={clearPreview}
              className="flex-1 py-2 rounded-md text-sm font-semibold transition-all bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            >
              Cancel
            </button>
          )}

          <button
            onClick={handleCommit}
            disabled={!isCommitEnabled}
            className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${
              isCommitEnabled 
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {preview.active ? `Execute ${t('Commit')}` : t('Commit')}
          </button>
        </div>
      </div>
    </div>
  );
}
