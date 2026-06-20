
interface DiffViewerProps {
  diff: string;
  filename: string;
}

export function DiffViewer({ diff, filename }: DiffViewerProps) {
  if (!diff) {
    return (
      <div className="h-full w-full flex items-center justify-center text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
        <p>No changes in {filename} or could not generate diff.</p>
      </div>
    );
  }

  const lines = diff.split('\n');

  return (
    <div className="h-full w-full flex flex-col bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
      <div className="px-4 py-2 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
        <span className="text-sm font-mono text-slate-300">{filename}</span>
      </div>
      <div className="flex-1 overflow-auto font-mono text-sm p-4 text-slate-300">
        {lines.map((line, i) => {
          let className = "px-2 py-0.5 rounded ";
          if (line.startsWith('+')) {
            className += "bg-emerald-950/40 text-emerald-400";
          } else if (line.startsWith('-')) {
            className += "bg-red-950/40 text-red-400";
          } else if (line.startsWith('@@')) {
            className += "text-blue-400 font-semibold mt-4 mb-2 bg-slate-900/50 block p-1";
          } else {
            className += "text-slate-500";
          }

          return (
            <div key={i} className={className}>
              {line}
            </div>
          );
        })}
      </div>
    </div>
  );
}
