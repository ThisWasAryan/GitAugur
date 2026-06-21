import { useMemo } from "react";
import { format } from "date-fns";

interface BlameViewerProps {
  blameRaw: string;
  filename: string;
}

interface BlameCommit {
  hash: string;
  author: string;
  summary: string;
  time: number;
  color: string;
}

interface BlameLine {
  commit: BlameCommit;
  content: string;
  lineNumber: number;
}

// Generate a consistent color based on commit hash
function getCommitColor(hash: string) {
  let hashNum = 0;
  for (let i = 0; i < Math.min(hash.length, 8); i++) {
    hashNum += hash.charCodeAt(i);
  }
  const colors = [
    'border-rose-500/50',
    'border-blue-500/50',
    'border-emerald-500/50',
    'border-amber-500/50',
    'border-purple-500/50',
    'border-pink-500/50',
    'border-cyan-500/50',
    'border-indigo-500/50'
  ];
  return colors[hashNum % colors.length];
}

export function BlameViewer({ blameRaw, filename }: BlameViewerProps) {
  const parsedLines = useMemo(() => {
    if (!blameRaw) return [];

    const lines = blameRaw.split('\n');
    const parsed: BlameLine[] = [];
    let currentLine: { hash: string } | null = null;
    const commits = new Map<string, BlameCommit>();

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line && i === lines.length - 1) continue;

      if (line.startsWith('\t')) {
        if (currentLine) {
          parsed.push({
            commit: commits.get(currentLine.hash)!,
            content: line.substring(1),
            lineNumber: parsed.length + 1
          });
          currentLine = null;
        }
      } else if (!currentLine) {
        const parts = line.split(' ');
        const hash = parts[0];
        currentLine = { hash };
        if (!commits.has(hash)) {
          commits.set(hash, { hash, author: 'Unknown', summary: '', time: 0, color: getCommitColor(hash) });
        }
      } else {
        const spaceIdx = line.indexOf(' ');
        if (spaceIdx > 0) {
          const key = line.substring(0, spaceIdx);
          const val = line.substring(spaceIdx + 1);
          const commit = commits.get(currentLine.hash);
          if (commit) {
            if (key === 'author') commit.author = val;
            if (key === 'author-time') commit.time = parseInt(val, 10) * 1000;
            if (key === 'summary') commit.summary = val;
          }
        }
      }
    }
    return parsed;
  }, [blameRaw]);

  if (!blameRaw) return <div className="text-slate-500 p-4">No blame data available.</div>;

  return (
    <div className="w-full h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col font-mono text-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <span className="font-semibold text-slate-300">{filename} (Blame)</span>
      </div>
      <div className="flex-1 overflow-auto custom-scrollbar bg-[#0d1117] p-2 text-xs">
        {parsedLines.map((line, idx) => {
          // Show commit info only on the first line of a commit block
          const showCommit = idx === 0 || parsedLines[idx - 1].commit.hash !== line.commit.hash;

          return (
            <div key={idx} className="flex hover:bg-slate-800/50 group">
              {/* Blame Annotation Column */}
              <div className={`w-64 shrink-0 flex items-start gap-2 px-2 py-0.5 border-r border-slate-800 select-none ${showCommit ? `border-l-2 ${line.commit.color}` : 'border-l-2 border-transparent'}`}>
                {showCommit ? (
                  <div className="flex flex-col w-full truncate">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-300 truncate" title={line.commit.author}>{line.commit.author}</span>
                      <span className="text-slate-500 text-[10px] whitespace-nowrap">{line.commit.time > 0 ? format(new Date(line.commit.time), 'MMM d, yy') : ''}</span>
                    </div>
                    <span className="text-slate-400 truncate opacity-80" title={line.commit.summary}>{line.commit.summary}</span>
                  </div>
                ) : (
                  <div className="w-full text-slate-700 font-mono text-[10px] pl-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {line.commit.hash.substring(0, 7)}
                  </div>
                )}
              </div>
              
              {/* Line Number */}
              <div className="w-10 shrink-0 text-right pr-2 text-slate-600 select-none py-0.5">
                {line.lineNumber}
              </div>
              
              {/* Code Content */}
              <div className="flex-1 whitespace-pre pl-2 text-slate-300 py-0.5 overflow-hidden">
                {line.content || ' '}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
