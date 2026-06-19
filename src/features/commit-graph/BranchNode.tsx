import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { GitBranch, Clock } from 'lucide-react';
import type { BranchData } from '../../stores/useBranchStore';

export type BranchNodeData = BranchData & Record<string, unknown> & {
  label: string;
};

export function BranchNode({ data }: NodeProps<Node<BranchNodeData, 'branch'>>) {
  const isMain = data.name === 'main';
  const isActive = data.isActive;
  const isStale = data.ahead === 0 && data.behind > 3;

  let borderColor = 'border-slate-700';
  let bgColor = 'bg-slate-900';
  let iconColor = 'text-slate-400';

  if (isActive) {
    borderColor = 'border-blue-500/50';
    bgColor = 'bg-blue-950/30';
    iconColor = 'text-blue-400';
  } else if (isMain) {
    borderColor = 'border-emerald-500/50';
    bgColor = 'bg-emerald-950/30';
    iconColor = 'text-emerald-400';
  } else if (isStale) {
    borderColor = 'border-amber-500/30';
    bgColor = 'bg-amber-950/20';
    iconColor = 'text-amber-500/70';
  }

  return (
    <div className={`w-64 rounded-xl border ${borderColor} ${bgColor} backdrop-blur-sm shadow-xl p-4`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-slate-600 border-none" />
      
      <div className="flex items-center gap-2 mb-3">
        <GitBranch className={`w-4 h-4 ${iconColor}`} />
        <span className={`font-mono font-bold text-sm ${isActive ? 'text-blue-400' : isMain ? 'text-emerald-400' : 'text-slate-200'}`}>
          {data.name}
        </span>
        {isActive && (
          <span className="ml-auto px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500 text-white tracking-wide uppercase">
            Active
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Updated
          </span>
          <span className="text-slate-300 font-medium">{data.lastCommitTime}</span>
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/50">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Ahead</span>
            <span className={`text-sm font-bold ${data.ahead > 0 ? 'text-emerald-400' : 'text-slate-600'}`}>{data.ahead}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Behind</span>
            <span className={`text-sm font-bold ${data.behind > 0 ? 'text-rose-400' : 'text-slate-600'}`}>{data.behind}</span>
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-slate-600 border-none" />
    </div>
  );
}
