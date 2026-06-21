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
      className="bg-white border border-slate-400 rounded-full flex items-center justify-center text-xs font-mono text-slate-800 shadow-sm cursor-pointer hover:border-slate-800 hover:shadow-md transition-all"
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

export function LabelNode({ data }: LabelNodeProps) {
  const isTag = data.type === 'tag';
  const bgColor = isTag ? 'bg-[#fffacd]' : 'bg-[#e0e0ff]'; // Pale yellow for tags, pale blue for branches
  const borderColor = isTag ? 'border-yellow-600' : 'border-blue-900';
  
  const text = isTag 
    ? `(tag: ${data.name})` 
    : data.isHead 
      ? `(HEAD, ${data.name})` 
      : `(${data.name})`;

  return (
    <div className={`${bgColor} ${borderColor} border flex items-center justify-center px-3 py-1 shadow-sm text-[11px] text-slate-900 font-mono`}>
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="target" position={Position.Left} className="opacity-0" id="left" />
      <Handle type="target" position={Position.Right} className="opacity-0" id="right" />
      {text}
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
}
