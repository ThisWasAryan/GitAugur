import { X, Terminal as TerminalIcon, History, AlertCircle, CheckCircle2 } from "lucide-react";
import { useOperationStore } from "../../stores/useOperationStore";
import { format } from "date-fns";
import { useState, useRef, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useRepositoryStore } from "../../stores/useRepositoryStore";

export function BottomPanel() {
  const { isPanelOpen, activeTab, togglePanel, setActiveTab, operations, clearOperations } = useOperationStore();
  const repoPath = useRepositoryStore(state => state.repoPath);
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalOutput, setTerminalOutput] = useState<{type: 'command'|'stdout'|'stderr', text: string}[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'Terminal' && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalOutput, activeTab]);

  if (!isPanelOpen) return null;

  const handleTerminalSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && terminalInput.trim()) {
      const command = terminalInput.trim();
      setTerminalInput("");
      
      setTerminalOutput(prev => [...prev, { type: 'command', text: `$ ${command}` }]);
      
      if (!command.startsWith('git ')) {
        setTerminalOutput(prev => [...prev, { type: 'stderr', text: 'Error: Only git commands are supported in this terminal.' }]);
        return;
      }

      if (!repoPath) {
        setTerminalOutput(prev => [...prev, { type: 'stderr', text: 'Error: No repository opened.' }]);
        return;
      }

      try {
        const args = command.substring(4).trim().split(' ').filter(Boolean);
        // Note: For a real terminal, we might want to invoke a generic git execution command.
        // For now, we will create a `git_exec` command in Tauri, or just re-use `git_status` if testing.
        // Let's assume we create a `git_exec` command.
        const res: any = await invoke('git_exec', { repoPath, args });
        
        if (res.stdout) {
          setTerminalOutput(prev => [...prev, { type: 'stdout', text: res.stdout }]);
        }
        if (res.stderr) {
          setTerminalOutput(prev => [...prev, { type: 'stderr', text: res.stderr }]);
        }
      } catch (err: any) {
        setTerminalOutput(prev => [...prev, { type: 'stderr', text: err.toString() }]);
      }
    }
  };

  return (
    <div className="h-64 border-t border-slate-800 bg-slate-950 flex flex-col shrink-0 relative z-20">
      {/* Header */}
      <div className="h-10 flex items-center justify-between px-4 border-b border-slate-800/50 bg-slate-900/50">
        <div className="flex gap-4 h-full">
          <button 
            onClick={() => setActiveTab('Log')}
            className={`flex items-center gap-2 h-full px-2 border-b-2 transition-colors ${activeTab === 'Log' ? 'border-blue-500 text-slate-200' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            <History className="w-4 h-4" />
            <span className="text-sm font-medium">Command Log</span>
          </button>
          <button 
            onClick={() => setActiveTab('Terminal')}
            className={`flex items-center gap-2 h-full px-2 border-b-2 transition-colors ${activeTab === 'Terminal' ? 'border-blue-500 text-slate-200' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            <TerminalIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Terminal</span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'Log' && operations.length > 0 && (
            <button 
              onClick={clearOperations}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors mr-2"
            >
              Clear
            </button>
          )}
          {activeTab === 'Terminal' && terminalOutput.length > 0 && (
            <button 
              onClick={() => setTerminalOutput([])}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors mr-2"
            >
              Clear
            </button>
          )}
          <button onClick={togglePanel} className="p-1 text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'Log' ? (
          <div className="h-full overflow-y-auto p-2 space-y-1">
            {operations.map(op => (
              <div key={op.id} className="flex flex-col p-2 hover:bg-slate-900/50 rounded group">
                <div className="flex items-center gap-3">
                  {op.status === 'Completed' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  )}
                  <span className="text-sm font-medium text-slate-300 w-32 shrink-0">{op.action}</span>
                  <span className="text-xs font-mono text-slate-500 truncate flex-1">{op.command}</span>
                  <span className="text-xs text-slate-600 shrink-0">{op.duration_ms}ms</span>
                  <span className="text-xs text-slate-600 shrink-0 w-20 text-right">{format(op.timestamp, 'HH:mm:ss')}</span>
                </div>
                {(op.stdout || op.stderr) && (
                  <div className="mt-2 ml-7 p-2 bg-slate-900 rounded text-xs font-mono overflow-x-auto hidden group-hover:block border border-slate-800">
                    {op.stdout && <pre className="text-slate-400">{op.stdout}</pre>}
                    {op.stderr && <pre className="text-rose-400 mt-1">{op.stderr}</pre>}
                  </div>
                )}
              </div>
            ))}
            {operations.length === 0 && (
              <div className="h-full flex items-center justify-center text-slate-600 text-sm">
                No Git operations recorded in this session.
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col p-4 font-mono text-sm overflow-hidden bg-[#0A0A0A]">
            <div className="flex-1 overflow-y-auto space-y-1">
              {terminalOutput.map((out, i) => (
                <div key={i} className={`whitespace-pre-wrap ${out.type === 'command' ? 'text-blue-400 font-semibold' : out.type === 'stderr' ? 'text-rose-400' : 'text-slate-300'}`}>
                  {out.text}
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800/50 shrink-0">
              <span className="text-blue-500 font-bold">$</span>
              <input
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                onKeyDown={handleTerminalSubmit}
                placeholder="git status"
                className="flex-1 bg-transparent border-none outline-none text-slate-200 placeholder-slate-700"
                autoComplete="off"
                spellCheck="false"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
