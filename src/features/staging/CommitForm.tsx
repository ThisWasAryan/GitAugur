import { useStagingStore } from "../../stores/useStagingStore";

export function CommitForm() {
  const { commitMessage, setCommitMessage, commit, stagedFiles } = useStagingStore();

  const handleCommit = () => {
    if (stagedFiles.length === 0 || !commitMessage.trim()) return;
    commit();
  };

  const isCommitEnabled = stagedFiles.length > 0 && commitMessage.trim().length > 0;

  return (
    <div className="mt-auto border-t border-slate-800 p-4 bg-slate-900/50">
      <div className="flex flex-col gap-3">
        <textarea
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          placeholder="Commit message..."
          className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none h-24"
        />
        
        <button
          onClick={handleCommit}
          disabled={!isCommitEnabled}
          className={`w-full py-2 rounded-md text-sm font-semibold transition-all ${
            isCommitEnabled 
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20' 
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          Commit to main
        </button>
      </div>
    </div>
  );
}
