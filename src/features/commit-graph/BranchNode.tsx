import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { GitBranch, Clock } from 'lucide-react';
import type { GitBranch as GitBranchType } from '../../types/git';
import { colorForBranch } from '../../utils/branchColors';

export type BranchNodeData = GitBranchType & Record<string, unknown> & {
  label: string;
};

export function BranchNode({ data }: NodeProps<Node<BranchNodeData, 'branch'>>) {
  const isActive = data.isCurrent;
  const isStale = (data.ahead || 0) === 0 && (data.behind || 0) > 3;

  const bColor = colorForBranch(data.isRemote ? data.name.replace('origin/', '') : data.name);
  
  let borderColor = `border-${bColor.bg.replace('bg-', '')}/30`;
  let bgColor = `bg-${bColor.bg.replace('bg-', '')}/10`;
  let iconColor = bColor.text;

  if (isActive) {
    borderColor = `border-${bColor.bg.replace('bg-', '')}/70 ring-1 ring-${bColor.bg.replace('bg-', '')}/50`;
    bgColor = `bg-${bColor.bg.replace('bg-', '')}/20`;
  } else if (isStale) {
    bgColor = `bg-${bColor.bg.replace('bg-', '')}/5`;
    iconColor = `text-${bColor.bg.replace('bg-', '')}/50`;
  }

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/x-git-branch', data.name);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const sourceBranchName = e.dataTransfer.getData('application/x-git-branch');
    if (sourceBranchName && sourceBranchName !== data.name) {
      if (window.confirm(`Rebase '${sourceBranchName}' onto '${data.name}'?`)) {
        // Trigger a rebase event. Since we are in React Flow, we should probably emit this 
        // to a store or handle it via useGitEngineStore directly.
        const { useGitEngineStore } = await import('../../engine/GitEngineStore');
        const { checkout, rebase } = useGitEngineStore.getState();
        await checkout(sourceBranchName);
        await rebase(data.name);
      }
    }
  };

  return (
    <div 
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`w-64 rounded-xl border ${borderColor} ${bgColor} backdrop-blur-sm shadow-xl p-4 cursor-grab active:cursor-grabbing`}
    >
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-slate-600 border-none" />
      
      <div className="flex items-center gap-2 mb-3">
        <GitBranch className={`w-4 h-4 ${iconColor}`} />
        <span className={`font-mono font-bold text-sm ${isActive ? iconColor : isStale ? 'text-slate-400' : 'text-slate-200'}`}>
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
          <span className="text-slate-300 font-medium">{(data as any).lastCommitTime || 'Unknown'}</span>
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/50">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Ahead</span>
            <span className={`text-sm font-bold ${(data.ahead || 0) > 0 ? 'text-emerald-400' : 'text-slate-600'}`}>{data.ahead || 0}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Behind</span>
            <span className={`text-sm font-bold ${(data.behind || 0) > 0 ? 'text-rose-400' : 'text-slate-600'}`}>{data.behind || 0}</span>
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-slate-600 border-none" />
    </div>
  );
}
