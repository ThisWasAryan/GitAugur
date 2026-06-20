import { useEffect, useState } from "react";
import { FileWarning, GitBranch, Check, AlertTriangle } from "lucide-react";
import { useRepositoryStore } from "../../stores/useRepositoryStore";
import { invoke } from '@tauri-apps/api/core';
import { useGitEngineStore } from "../../engine/GitEngineStore";

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
  const [conflictBlocks, setConflictBlocks] = useState<ConflictBlock[]>([]);
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

  const resolveBlock = (id: string, choice: 'current' | 'incoming' | 'both') => {
    setConflictBlocks(prev => prev.map(b => b.id === id ? { ...b, resolvedWith: choice } : b));
  };

  const handleSaveResolution = async () => {
    if (!repoPath || !activeConflictFile) return;
    
    // Check if all resolved
    if (conflictBlocks.some(b => !b.resolvedWith)) {
      alert("Please resolve all conflicts before saving.");
      return;
    }
    
    setSaving(true);
    
    try {
      // Reconstruct file
      const finalLines: string[] = [];
      let currentLine = 0;
      
      for (const block of conflictBlocks) {
        // Add lines before this block
        while (currentLine < block.startIndex) {
          finalLines.push(rawLines[currentLine]);
          currentLine++;
        }
        
        // Add resolved lines
        if (block.resolvedWith === 'current') {
          finalLines.push(...block.currentContent);
        } else if (block.resolvedWith === 'incoming') {
          finalLines.push(...block.incomingContent);
        } else if (block.resolvedWith === 'both') {
          finalLines.push(...block.currentContent);
          finalLines.push(...block.incomingContent);
        }
        
        currentLine = block.endIndex + 1; // skip marker
      }
      
      // Add remaining lines
      while (currentLine < rawLines.length) {
        finalLines.push(rawLines[currentLine]);
        currentLine++;
      }
      
      const newContent = finalLines.join('\n');
      
      // Write back
      await invoke('write_file_content', { repoPath, filePath: activeConflictFile, content: newContent });
      
      // Stage the resolved file
      await invoke('git_add', { repoPath, files: [activeConflictFile] });
      
      // Refresh state
      await fetchRepoState(repoPath);
      
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
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
    } catch (e) {
      console.error(e);
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
          await invoke('git_exec', { repoPath, args: ['rebase', '--continue'] });
        } else {
          // For MERGING and CHERRY_PICKING
          if (commitMessage.trim().length > 0) {
            await invoke('git_exec', { repoPath, args: ['commit', '-m', commitMessage.trim()] });
          } else {
            await invoke('git_exec', { repoPath, args: ['commit', '--no-edit'] });
          }
        }
        await fetchRepoState(repoPath);
      } catch (e) {
        console.error(e);
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
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full h-full bg-slate-950">
      
      {/* Left Area: The Resolution Editor */}
      <div className="flex-1 flex flex-col border-r border-slate-800 min-w-0">
        <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
              <FileWarning className="w-5 h-5 text-rose-500" />
              Resolving Conflict in <span className="font-mono text-blue-400 bg-blue-950/50 px-2 py-0.5 rounded truncate max-w-sm" title={activeConflictFile}>{activeConflictFile}</span>
            </h2>
            <p className="text-slate-400 mt-2 text-sm">Review both versions and select which code to keep. ({conflictBlocks.filter(b => b.resolvedWith).length} / {conflictBlocks.length} resolved)</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleAbortOperation}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium text-sm transition-colors border border-slate-700"
            >
              Abort {useRepositoryStore.getState().currentState}
            </button>
            <button 
              onClick={handleSaveResolution}
              disabled={conflictBlocks.some(b => !b.resolvedWith) || saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-900/20"
            >
              {saving ? 'Saving...' : 'Mark as Resolved'}
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto bg-slate-950">
          <div className="max-w-4xl mx-auto space-y-12">
            
            {conflictBlocks.map((block, idx) => (
              <div key={block.id} className="space-y-6 opacity-100 transition-opacity">
                <div className="text-sm font-medium text-slate-500 mb-2">Conflict #{idx + 1}</div>
                
                {/* Current Branch */}
                <div className={`border rounded-xl overflow-hidden shadow-lg transition-colors ${block.resolvedWith === 'current' || block.resolvedWith === 'both' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : block.resolvedWith ? 'border-slate-800 opacity-50' : 'border-emerald-900/50'}`}>
                  <div className={`p-4 border-b flex items-center justify-between transition-colors ${block.resolvedWith === 'current' || block.resolvedWith === 'both' ? 'bg-emerald-900/40 border-emerald-500/50' : 'bg-emerald-950/40 border-emerald-900/50'}`}>
                    <div>
                      <h3 className="font-semibold text-emerald-400 flex items-center gap-2">
                        <GitBranch className="w-4 h-4" />
                        Current Changes <span className="font-mono bg-emerald-900/50 px-1.5 rounded text-xs font-normal text-emerald-200">(Your Branch)</span>
                      </h3>
                    </div>
                    <button 
                      onClick={() => resolveBlock(block.id, 'current')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-emerald-900/20 flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" /> Accept Current
                    </button>
                  </div>
                  <div className="p-4 font-mono text-sm bg-slate-950 overflow-x-auto whitespace-pre">
                    {block.currentContent.map((line, i) => (
                      <div key={i} className="text-emerald-300 py-0.5 px-2 rounded hover:bg-emerald-900/20">{line || ' '}</div>
                    ))}
                    {block.currentContent.length === 0 && <div className="text-slate-600 italic">Empty</div>}
                  </div>
                </div>

                <div className="flex items-center justify-center relative">
                  <div className="absolute w-full h-px bg-slate-800"></div>
                  <button 
                    onClick={() => resolveBlock(block.id, 'both')}
                    className={`px-4 py-1 text-xs font-bold tracking-widest uppercase relative z-10 rounded-full transition-colors ${block.resolvedWith === 'both' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-700 hover:bg-slate-800'}`}
                  >
                    Accept Both
                  </button>
                </div>

                {/* Incoming Branch */}
                <div className={`border rounded-xl overflow-hidden shadow-lg transition-colors ${block.resolvedWith === 'incoming' || block.resolvedWith === 'both' ? 'border-blue-500 ring-2 ring-blue-500/20' : block.resolvedWith ? 'border-slate-800 opacity-50' : 'border-blue-900/50'}`}>
                  <div className={`p-4 border-b flex items-center justify-between transition-colors ${block.resolvedWith === 'incoming' || block.resolvedWith === 'both' ? 'bg-blue-900/40 border-blue-500/50' : 'bg-blue-950/40 border-blue-900/50'}`}>
                    <div>
                      <h3 className="font-semibold text-blue-400 flex items-center gap-2">
                        <GitBranch className="w-4 h-4" />
                        Incoming Changes <span className="font-mono bg-blue-900/50 px-1.5 rounded text-xs font-normal text-blue-200">(From {useRepositoryStore.getState().currentState.toLowerCase()})</span>
                      </h3>
                    </div>
                    <button 
                      onClick={() => resolveBlock(block.id, 'incoming')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-900/20 flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" /> Accept Incoming
                    </button>
                  </div>
                  <div className="p-4 font-mono text-sm bg-slate-950 overflow-x-auto whitespace-pre">
                    {block.incomingContent.map((line, i) => (
                      <div key={i} className="text-blue-300 py-0.5 px-2 rounded hover:bg-blue-900/20">{line || ' '}</div>
                    ))}
                    {block.incomingContent.length === 0 && <div className="text-slate-600 italic">Empty</div>}
                  </div>
                </div>

              </div>
            ))}
            
            {conflictBlocks.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <Check className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-300 mb-2">No standard conflict markers found</h3>
                <p>This file might be a binary file or has a conflict not represented by standard &lt;&lt;&lt;&lt;&lt;&lt;&lt; blocks.</p>
              </div>
            )}

          </div>
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
