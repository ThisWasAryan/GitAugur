import React, { useMemo } from "react";

interface DiffViewerProps {
  diff: string;
  filename: string;
  onStageHunk?: (patch: string) => void;
  onUnstageHunk?: (patch: string) => void;
  isStaged?: boolean;
}

interface DiffLine {
  type: 'added' | 'removed' | 'context' | 'hunk';
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

interface Hunk {
  header: string;
  lines: DiffLine[];
}

export function DiffViewer({ diff, filename, onStageHunk, onUnstageHunk, isStaged }: DiffViewerProps) {
  const { hunks, fileHeaders } = useMemo(() => {
    if (!diff) return { hunks: [], fileHeaders: [] };
    
    const lines = diff.split('\n');
    const hunks: Hunk[] = [];
    const fileHeaders: string[] = [];
    let currentHunk: Hunk | null = null;
    
    let oldLn = 0;
    let newLn = 0;
    let parsingHeader = true;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.startsWith('@@ ')) {
        parsingHeader = false;
        const match = line.match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
        if (match) {
          oldLn = parseInt(match[1], 10);
          newLn = parseInt(match[2], 10);
        }
        
        currentHunk = { header: line, lines: [] };
        hunks.push(currentHunk);
        continue;
      }

      if (parsingHeader) {
        fileHeaders.push(line);
        continue;
      }

      if (currentHunk) {
        if (line.startsWith('+')) {
          currentHunk.lines.push({ type: 'added', content: line.substring(1), newLineNumber: newLn++ });
        } else if (line.startsWith('-')) {
          currentHunk.lines.push({ type: 'removed', content: line.substring(1), oldLineNumber: oldLn++ });
        } else if (line.startsWith(' ')) {
          currentHunk.lines.push({ type: 'context', content: line.substring(1), oldLineNumber: oldLn++, newLineNumber: newLn++ });
        } else if (line === '\\ No newline at end of file') {
          currentHunk.lines.push({ type: 'context', content: line });
        } else {
          // Empty or broken lines
          currentHunk.lines.push({ type: 'context', content: line, oldLineNumber: oldLn++, newLineNumber: newLn++ });
        }
      }
    }
    
    return { hunks, fileHeaders };
  }, [diff]);

  const handleActionHunk = (hunk: Hunk) => {
    const patchLines = [...fileHeaders, hunk.header];
    for (const line of hunk.lines) {
      if (line.type === 'added') patchLines.push('+' + line.content);
      else if (line.type === 'removed') patchLines.push('-' + line.content);
      else patchLines.push(' ' + line.content);
    }
    patchLines.push(''); // newline at end
    const patchStr = patchLines.join('\n');
    
    if (isStaged && onUnstageHunk) {
      onUnstageHunk(patchStr);
    } else if (!isStaged && onStageHunk) {
      onStageHunk(patchStr);
    }
  };

  if (!diff) {
    return (
      <div className="h-full w-full flex items-center justify-center text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
        <p>No changes in {filename} or could not generate diff.</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
      <div className="px-4 py-2 border-b border-slate-800 bg-slate-900 flex justify-between items-center shrink-0">
        <span className="text-sm font-mono text-slate-300">{filename}</span>
      </div>
      <div className="flex-1 overflow-auto bg-[#0d1117] text-slate-300">
        {hunks.length === 0 ? (
          <div className="p-4 text-slate-500 font-mono text-sm">Binary file or unsupported diff format.</div>
        ) : (
          <table className="w-full font-mono text-[13px] leading-5 text-left border-collapse whitespace-pre">
            <colgroup>
              <col className="w-12" />
              <col className="w-12" />
              <col className="w-full" />
            </colgroup>
            <tbody>
              {hunks.map((hunk, hIdx) => (
                <React.Fragment key={hIdx}>
                  <tr className="bg-blue-900/20 text-blue-300/70 border-y border-blue-900/30 group">
                    <td colSpan={2} className="px-2 py-1 text-right select-none opacity-50">...</td>
                    <td className="px-4 py-1 flex items-center justify-between">
                      <span>{hunk.header}</span>
                      <button 
                        onClick={() => handleActionHunk(hunk)}
                        className="px-2 py-0.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {isStaged ? 'Unstage Hunk' : 'Stage Hunk'}
                      </button>
                    </td>
                  </tr>
                  {hunk.lines.map((line, lIdx) => {
                    let rowClass = "hover:bg-slate-800/50";
                    let oldClass = "text-slate-500 bg-slate-900/50 border-r border-slate-800/50 text-right px-2 select-none cursor-pointer hover:text-slate-300";
                    let newClass = oldClass;
                    let contentClass = "px-4 pr-8";

                    if (line.type === 'added') {
                      rowClass = "bg-emerald-900/20 hover:bg-emerald-900/30";
                      newClass = "text-emerald-400 bg-emerald-900/30 border-r border-emerald-900/40 text-right px-2 select-none cursor-pointer";
                      contentClass += " text-emerald-300";
                    } else if (line.type === 'removed') {
                      rowClass = "bg-rose-900/20 hover:bg-rose-900/30";
                      oldClass = "text-rose-400 bg-rose-900/30 border-r border-rose-900/40 text-right px-2 select-none cursor-pointer";
                      contentClass += " text-rose-300";
                    }

                    return (
                      <tr key={lIdx} className={rowClass}>
                        <td className={oldClass}>{line.oldLineNumber || ""}</td>
                        <td className={newClass}>{line.newLineNumber || ""}</td>
                        <td className={contentClass}>
                          <span className="select-none opacity-50 w-4 inline-block">
                            {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                          </span>
                          {line.content || " "}
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
