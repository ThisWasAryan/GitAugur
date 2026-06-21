import { Handle, Position } from '@xyflow/react';

interface CommitNodeProps {
  data: {
    hash: string;
    message: string;
  };
}

export function CircleCommitNode({ data }: CommitNodeProps) {
  return (
    <div 
      className="bg-slate-900 border-2 border-slate-600 rounded-full flex items-center justify-center text-xs font-mono text-slate-300 shadow-sm cursor-pointer hover:border-slate-400 hover:shadow-md transition-all"
      style={{ width: 64, height: 32 }}
      title={data.message}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      {data.hash.substring(0, 7)}
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
      <Handle type="source" position={Position.Right} id="right" className="opacity-0" />
      <Handle type="source" position={Position.Left} id="left" className="opacity-0" />
    </div>
  );
}

interface LabelNodeProps {
  data: {
    name: string;
    type: 'branch' | 'tag';
    isHead?: boolean;
  };
}

import { colorForBranch } from '../../utils/branchColors';

export function LabelNode({ data }: LabelNodeProps) {
  const isTag = data.type === 'tag';
  
  // Use theme colors
  let bgColor = 'bg-slate-800';
  let borderColor = 'border-slate-600';
  let textColor = 'text-slate-300';
  
  if (isTag) {
    bgColor = 'bg-yellow-950/30';
    borderColor = 'border-yellow-600/50';
    textColor = 'text-yellow-400';
  } else {
    const branchColor = colorForBranch(data.name);
    // e.g. "bg-blue-500" -> we want a darker bg, maybe using the text color class directly
    textColor = branchColor.text;
    borderColor = branchColor.border;
    bgColor = branchColor.bg.replace('500', '950/30'); // A bit hacky but works for tailwind colors if they follow the pattern
  }
  
  const text = isTag 
    ? `(tag: ${data.name})` 
    : data.isHead 
      ? `(HEAD, ${data.name})` 
      : `(${data.name})`;

  return (
    <div className={`${bgColor} ${borderColor} border flex items-center justify-center px-3 py-1 shadow-sm text-[11px] ${textColor} font-mono rounded-md cursor-pointer hover:bg-slate-800/80 transition-colors`}>
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="target" position={Position.Left} className="opacity-0" id="left" />
      <Handle type="target" position={Position.Right} className="opacity-0" id="right" />
      {text}
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
}
