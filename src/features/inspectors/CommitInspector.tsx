import { useGitEngineStore } from "../../engine/GitEngineStore";
import { useInspectorStore } from "../../stores/useInspectorStore";
import { useRepositoryStore } from "../../stores/useRepositoryStore";
import { invoke } from "@tauri-apps/api/core";
import { X, GitCommit, Clock, User, GitBranch, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";

export function CommitInspector() {
  const { history, selectCommitFile, selectedFile } = useGitEngineStore();
  const { inspectedEntityId, showStaging } = useInspectorStore();
  const { repoPath } = useRepositoryStore();

  const [files, setFiles] = useState<{path: string, status: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const commit = history.commits.find(c => c.hash === inspectedEntityId);

  useEffect(() => {
    if (commit && repoPath) {
      setIsLoading(true);
      invoke('git_commit_details', { repoPath, commitHash: commit.hash })
        .then((res: any) => {
          if (res.success) {
            // output is `--name-status`. e.g. "M\tfile.txt\nA\tnew.txt\n\nCommit msg"
            // Wait, `--pretty=format:%B` output has message first, then files.
            // Let's just parse it. The lines with tab are name-status.
            const lines = res.stdout.split('\n');
            const parsedFiles: {path: string, status: string}[] = [];
            for (const line of lines) {
              const parts = line.split('\t');
              if (parts.length === 2 || parts.length === 3) {
                const statusChar = parts[0][0]; // A, M, D, R, etc.
                const path = parts[parts.length - 1];
                let status = 'modified';
                if (statusChar === 'A') status = 'added';
                if (statusChar === 'D') status = 'deleted';
                if (statusChar === 'R') status = 'renamed';
                parsedFiles.push({ path, status });
              }
            }
            setFiles(parsedFiles);
          }
          setIsLoading(false);
        })
        .catch(err => {
          console.error(err);
          setIsLoading(false);
        });
    } else if (commit?.files) {
      setFiles(commit.files);
    }
  }, [commit, repoPath]);

  if (!commit) {
    return (
      <div className="w-80 h-full bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 p-4">
        <div className="text-slate-400">Commit not found.</div>
        <button onClick={showStaging} className="mt-4 text-blue-400 hover:text-blue-300">Back to Staging</button>
      </div>
    );
  }

  // Get branches containing this commit
  const branches = history.branches.filter(b => b.commitHash === commit.hash || commit.parentHashes.includes(b.commitHash));

  return (
    <div className="w-[400px] h-full bg-slate-900 border-l border-slate-800 flex flex-col shrink-0">
      <div className="h-14 px-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50 shrink-0">
        <h2 className="font-semibold text-slate-200 flex items-center gap-2">
          <GitCommit className="w-4 h-4 text-emerald-500" />
          Commit Details
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
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs bg-slate-950 px-2 py-1 rounded text-slate-400 border border-slate-800">
              {commit.hash.substring(0, 7)}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => useGitEngineStore.getState().cherryPick(commit.hash)}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded transition-colors font-medium border border-slate-700 hover:border-slate-600"
              >
                Cherry-Pick
              </button>
            </div>
          </div>
          <h3 className="text-lg font-bold text-slate-100">{commit.message}</h3>
        </div>

        {/* Meta info */}
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3 text-slate-300">
            <User className="w-4 h-4 text-slate-500" />
            <span>{commit.author.name} <span className="text-slate-500">&lt;{commit.author.email}&gt;</span></span>
          </div>
          <div className="flex items-center gap-3 text-slate-300">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>{format(new Date(commit.timestamp), "PPp")}</span>
          </div>
          {branches.length > 0 && (
            <div className="flex items-center gap-3 text-slate-300">
              <GitBranch className="w-4 h-4 text-slate-500" />
              <div className="flex gap-2">
                {branches.map(b => (
                  <span key={b.name} className="bg-blue-900/30 text-blue-400 border border-blue-800/50 px-1.5 py-0.5 rounded text-xs">
                    {b.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Files Changed */}
        <div className="mt-4 border-t border-slate-800 pt-4">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            Files Changed ({files.length})
            {isLoading && <Loader2 className="w-3 h-3 animate-spin text-blue-400" />}
          </h4>
          <div className="space-y-4">
            {files.map((file: any) => (
              <div 
                key={file.path} 
                onClick={() => selectCommitFile(commit.hash, file.path)}
                className={`border rounded-lg overflow-hidden cursor-pointer transition-colors ${selectedFile === file.path ? 'border-amber-500/50' : 'border-slate-800 hover:border-slate-600'}`}
              >
                <div className={`px-3 py-2 text-xs font-mono text-slate-300 flex justify-between items-center ${selectedFile === file.path ? 'bg-amber-950/20' : 'bg-slate-950'}`}>
                  <span>{file.path}</span>
                  <span className={`px-1.5 py-0.5 rounded ${file.status === 'added' ? 'text-emerald-400 bg-emerald-950/50' : file.status === 'deleted' ? 'text-rose-400 bg-rose-950/50' : 'text-amber-400 bg-amber-950/50'}`}>
                    {file.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
