import type { FileStatus } from "../../engine/GitEngineStore";
import { Plus, Minus, File as FileIcon, FilePlus, FileMinus } from "lucide-react";

interface FileStatusListProps {
  title: string;
  files: FileStatus[];
  onAction: (path: string) => void;
  onActionAll: () => void;
  actionIcon: "plus" | "minus";
}

export function FileStatusList({ title, files, onAction, onActionAll, actionIcon }: FileStatusListProps) {
  const getIcon = (status: string) => {
    switch (status) {
      case 'added': return <FilePlus className="w-4 h-4 text-emerald-500" />;
      case 'deleted': return <FileMinus className="w-4 h-4 text-red-500" />;
      case 'modified': return <FileIcon className="w-4 h-4 text-blue-500" />;
      case 'untracked': return <FileIcon className="w-4 h-4 text-slate-500" />;
      default: return <FileIcon className="w-4 h-4 text-slate-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'added': return 'A';
      case 'deleted': return 'D';
      case 'modified': return 'M';
      case 'untracked': return 'U';
      default: return '';
    }
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2 text-sm font-semibold text-slate-300">
        <span>{title} ({files.length})</span>
        {files.length > 0 && (
          <button 
            onClick={onActionAll}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            {actionIcon === 'plus' ? 'Stage All' : 'Unstage All'}
          </button>
        )}
      </div>
      
      {files.length === 0 ? (
        <div className="text-sm text-slate-600 italic py-2">No files</div>
      ) : (
        <ul className="space-y-0.5">
          {files.map((file) => (
            <li 
              key={file.path} 
              className="flex items-center justify-between group px-2 py-1.5 hover:bg-slate-800/50 rounded-md transition-colors"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                {getIcon(file.status)}
                <span className="text-sm text-slate-300 truncate" title={file.path}>
                  {file.path}
                </span>
                <span className={`text-[10px] font-mono px-1 rounded bg-slate-900 border border-slate-800
                  ${file.status === 'modified' ? 'text-blue-500' : 
                    file.status === 'added' ? 'text-emerald-500' : 
                    file.status === 'deleted' ? 'text-red-500' : 'text-slate-500'}`}
                >
                  {getStatusText(file.status)}
                </span>
              </div>
              
              <button 
                onClick={() => onAction(file.path)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200 transition-all"
                title={actionIcon === 'plus' ? 'Stage file' : 'Unstage file'}
              >
                {actionIcon === 'plus' ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
