import { useEffect, useState } from "react";
import { Editor } from "@monaco-editor/react";
import { FileWarning, Check, AlertTriangle } from "lucide-react";
import { useRepositoryStore } from "../../stores/useRepositoryStore";
import { invoke } from '@tauri-apps/api/core';
import { useGitEngineStore } from "../../engine/GitEngineStore";
import { toast } from "sonner";

interface ConflictBlock {
  id: string;
  startIndex: number;
  endIndex: number;
  currentContent: string[];
  incomingContent: string[];
  currentBranch: string;
  incomingBranch: string;
  resolvedWith?: 'current' | 'incoming' | 'both';
}

export function ConflictResolutionView() {
  const repoPath = useRepositoryStore(state => state.repoPath);
  const unstagedFiles = useGitEngineStore(state => state.unstagedFiles);
  const fetchRepoState = useGitEngineStore(state => state.fetchRepoState);
  
  const [activeConflictFile, setActiveConflictFile] = useState<string | null>(null);
  const [, setConflictBlocks] = useState<ConflictBlock[]>([]);
  const [rawLines, setRawLines] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [commitMessage, setCommitMessage] = useState("");

  const conflictedFiles = unstagedFiles.filter(f => f.status === 'conflicted');

  useEffect(() => {
    if (conflictedFiles.length > 0 && !activeConflictFile) {
      setActiveConflictFile(conflictedFiles[0].path);
    } else if (conflictedFiles.length === 0) {
      setActiveConflictFile(null);
    }
  }, [conflictedFiles, activeConflictFile]);

  useEffect(() => {
    if (repoPath && activeConflictFile) {
      loadFile(repoPath, activeConflictFile);
    }
  }, [repoPath, activeConflictFile]);

  const loadFile = async (repo: string, file: string) => {
    try {
      const content: string = await invoke('read_file_content', { repoPath: repo, filePath: file });
      parseConflicts(content);
    } catch (e) {
      console.error("Failed to read conflicted file", e);
    }
  };

  const parseConflicts = (content: string) => {
    const lines = content.split('\n');
    setRawLines(lines);
    const blocks: ConflictBlock[] = [];
    let i = 0;
    
    while (i < lines.length) {
      if (lines[i].startsWith('<<<<<<<')) {
        const startIndex = i;
        const currentBranch = lines[i].substring(7).trim();
        i++;
        const currentContent = [];
        while (i < lines.length && !lines[i].startsWith('=======')) {
          currentContent.push(lines[i]);
          i++;
        }
        i++; // skip =======
        const incomingContent = [];
        while (i < lines.length && !lines[i].startsWith('>>>>>>>')) {
          incomingContent.push(lines[i]);
          i++;
        }
        const incomingBranch = lines[i] ? lines[i].substring(7).trim() : 'Incoming';
        const endIndex = i;
        i++; // skip >>>>>>>
        
        blocks.push({
          id: Math.random().toString(),
          startIndex,
          endIndex,
          currentContent,
          incomingContent,
          currentBranch,
          incomingBranch
        });
      } else {
        i++;
      }
    }
    
    setConflictBlocks(blocks);
  };
  const handleAbortOperation = async () => {
    if (!repoPath) return;
    const currentState = useRepositoryStore.getState().currentState;
    try {
      setSaving(true);
      if (currentState === 'MERGING') {
        await invoke('git_exec', { repoPath, args: ['merge', '--abort'] });
      } else if (currentState === 'REBASING') {
        await invoke('git_exec', { repoPath, args: ['rebase', '--abort'] });
      } else if (currentState === 'CHERRY_PICKING') {
        await invoke('git_exec', { repoPath, args: ['cherry-pick', '--abort'] });
      } else if (currentState === 'REVERTING') {
        await invoke('git_exec', { repoPath, args: ['revert', '--abort'] });
      }
      await fetchRepoState(repoPath);
      setTimeout(() => fetchRepoState(repoPath), 500);
      toast.info("Operation aborted.");
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to abort: " + e.toString());
    } finally {
      setSaving(false);
    }
  };

  if (!activeConflictFile) {
    const currentState = useRepositoryStore.getState().currentState;

    const handleFinalize = async () => {
      if (!repoPath) return;
      try {
        setSaving(true);
        if (currentState === 'REBASING') {
          await invoke('git_exec', { repoPath, args: ['-c', 'core.editor=true', 'rebase', '--continue'] });
        } else {
          // For MERGING and CHERRY_PICKING
          if (commitMessage.trim().length > 0) {
            await invoke('git_exec', { repoPath, args: ['commit', '-m', commitMessage.trim()] });
          } else {
            await invoke('git_exec', { repoPath, args: ['commit', '--no-edit'] });
          }
        }
        await fetchRepoState(repoPath);
        // Force an additional fetch just in case the file system is slow
        setTimeout(() => fetchRepoState(repoPath), 500);
        toast.success("Conflicts resolved and operation finalized.");
      } catch (e: any) {
        console.error(e);
        toast.error("Failed to finalize operation: " + e.toString());
      } finally {
        setSaving(false);
      }
    };

    const handleSkip = async () => {
      if (!repoPath) return;
      try {
        setSaving(true);
        if (currentState === 'REBASING') {
          await invoke('git_exec', { repoPath, args: ['rebase', '--skip'] });
        } else if (currentState === 'CHERRY_PICKING') {
          await invoke('git_exec', { repoPath, args: ['cherry-pick', '--skip'] });
        }
        await fetchRepoState(repoPath);
        setTimeout(() => fetchRepoState(repoPath), 500);
      } catch (e) {
        console.error(e);
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 text-slate-400 p-8 text-center overflow-y-auto custom-scrollbar">
        <Check className="w-16 h-16 text-emerald-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-200 mb-2">No Conflicts Remaining</h2>
        <p className="mb-6 max-w-md">All conflicts have been resolved or the operation is paused. You can now finalize the operation or skip this commit.</p>
        
        {currentState !== 'REBASING' && (
          <div className="w-full max-w-md mb-8 text-left">
            <label className="block text-sm font-medium text-slate-300 mb-2">Commit Message (Optional)</label>
            <textarea 
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Leave blank to use the default generated message"
              className="w-full h-24 bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all custom-scrollbar resize-none"
            />
          </div>
        )}

        <div className="flex items-center gap-4">
          <button 
            onClick={handleFinalize}
            disabled={saving}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-lg shadow-emerald-900/20 transition-all disabled:opacity-50"
          >
            {saving ? 'Processing...' : 'Finalize Operation'}
          </button>
          
          {(currentState === 'CHERRY_PICKING' || currentState === 'REBASING') && (
            <button 
              onClick={handleSkip}
              disabled={saving}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Skip (Empty Commit)
            </button>
          )}

          <button 
            onClick={handleAbortOperation}
            disabled={saving}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Abort {currentState}
          </button>

          <button 
            onClick={() => useRepositoryStore.getState().setRepositoryState('NORMAL')}
            className="px-6 py-3 bg-rose-900/40 hover:bg-rose-900/60 text-rose-400 border border-rose-500/30 rounded-lg font-medium transition-colors"
            title="Forcefully close this screen and return to the main application"
          >
            Force Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full h-full bg-slate-950">
      
      {/* Left Area: The Resolution Editor */}
      <div className="flex-1 flex flex-col border-r border-slate-800 min-w-0">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <FileWarning className="w-5 h-5 text-rose-500" />
              Resolving Conflict in <span className="font-mono text-blue-400 bg-blue-950/50 px-2 py-0.5 rounded truncate max-w-sm" title={activeConflictFile}>{activeConflictFile}</span>
            </h2>
            <p className="text-slate-400 mt-1 text-xs">Edit the file manually to resolve conflicts, or use the quick actions below.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleAbortOperation}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium text-sm transition-colors border border-slate-700"
            >
              Abort {useRepositoryStore.getState().currentState}
            </button>
            <button 
              onClick={() => useRepositoryStore.getState().setRepositoryState('NORMAL')}
              className="px-4 py-2 bg-rose-900/40 hover:bg-rose-900/60 text-rose-400 border border-rose-500/30 rounded-lg font-medium text-sm transition-colors"
              title="Forcefully close this screen and return to the main application"
            >
              Force Close
            </button>
            <button 
              onClick={async () => {
                setSaving(true);
                try {
                  const content = rawLines.join('\n');
                  await invoke('write_file_content', { repoPath, filePath: activeConflictFile, content });
                  await invoke('git_add', { repoPath, files: [activeConflictFile] });
                  await fetchRepoState(repoPath!);
                  toast.success("Conflict resolved successfully.");
                } catch (e: any) {
                  toast.error("Failed to save resolution: " + e.toString());
                } finally {
                  setSaving(false);
                }
              }}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-900/20"
            >
              {saving ? 'Saving...' : 'Mark as Resolved (Save File)'}
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0">
          <span className="text-xs font-semibold text-slate-500 uppercase mr-2">Quick Actions:</span>
          <button 
            onClick={() => {
               // Accept all current
               const newLines = [];
               let skip = false;
               for (let i = 0; i < rawLines.length; i++) {
                 if (rawLines[i].startsWith('<<<<<<<')) {
                   skip = false;
                   continue;
                 } else if (rawLines[i].startsWith('=======')) {
                   skip = true;
                   continue;
                 } else if (rawLines[i].startsWith('>>>>>>>')) {
                   skip = false;
                   continue;
                 }
                 if (!skip) newLines.push(rawLines[i]);
               }
               setRawLines(newLines);
               parseConflicts(newLines.join('\n'));
            }}
            className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/20 rounded text-xs font-medium whitespace-nowrap transition-colors"
          >
            Accept All Current
          </button>
          <button 
             onClick={() => {
               // Accept all incoming
               const newLines = [];
               let skip = false;
               for (let i = 0; i < rawLines.length; i++) {
                 if (rawLines[i].startsWith('<<<<<<<')) {
                   skip = true;
                   continue;
                 } else if (rawLines[i].startsWith('=======')) {
                   skip = false;
                   continue;
                 } else if (rawLines[i].startsWith('>>>>>>>')) {
                   skip = false;
                   continue;
                 }
                 if (!skip) newLines.push(rawLines[i]);
               }
               setRawLines(newLines);
               parseConflicts(newLines.join('\n'));
            }}
            className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/20 rounded text-xs font-medium whitespace-nowrap transition-colors"
          >
            Accept All Incoming
          </button>
        </div>

        <div className="flex-1 overflow-hidden relative">
          <Editor
            height="100%"
            theme="vs-dark"
            path={activeConflictFile}
            value={rawLines.join('\n')}
            onChange={(val) => {
              if (val !== undefined) {
                setRawLines(val.split('\n'));
              }
            }}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              renderWhitespace: 'boundary'
            }}
          />
        </div>
      </div>

      {/* Right Area: File List Context */}
      <div className="w-[300px] bg-slate-900/50 shrink-0 flex flex-col border-l border-slate-800">
        <div className="p-4 border-b border-slate-800">
          <h3 className="font-bold text-slate-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            Conflicted Files ({conflictedFiles.length})
          </h3>
        </div>

        <div className="p-2 space-y-1 overflow-y-auto custom-scrollbar">
          {conflictedFiles.map(f => (
            <button
              key={f.path}
              onClick={() => setActiveConflictFile(f.path)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate transition-colors ${activeConflictFile === f.path ? 'bg-slate-800 text-slate-200 font-medium' : 'text-slate-400 hover:bg-slate-800/50'}`}
              title={f.path}
            >
              {f.path.split('/').pop()}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
