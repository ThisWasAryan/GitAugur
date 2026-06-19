import { Handle, Position } from "@xyflow/react";
import type { NodeProps, Node } from "@xyflow/react";
import type { GitCommit, GitBranch, GitTag } from "../../types/git";
import { formatDistanceToNow } from "date-fns";
import { GitBranch as GitBranchIcon, Tag, User } from "lucide-react";

export type CommitNodeData = {
  commit: GitCommit;
  branches: GitBranch[];
  tags: GitTag[];
  lane: number;
  totalLanes: number;
};

export type CommitNodeType = Node<CommitNodeData, 'commit'>;

export function CommitNode({ data }: NodeProps<CommitNodeType>) {
  const { commit, branches, tags, lane, totalLanes } = data;
  
  // Choose a color based on the lane
  const laneColors = ["bg-blue-500", "bg-purple-500", "bg-green-500", "bg-orange-500", "bg-pink-500"];
  const colorClass = laneColors[lane % laneColors.length];

  // Calculate the offset so that the text aligns on the right of all lanes.
  // The dot is placed at the current lane's X.
  // The text container needs to start after the maximum lane.
  // Width of one lane is 20px. 
  // Offset = (totalLanes - lane) * 20px + 16px (padding)
  const textOffset = (totalLanes - lane) * 20 + 16;

  return (
    <div className="flex items-center group relative h-[24px] min-w-[20px]">
      {/* Invisible handles for routing */}
      <Handle type="target" position={Position.Bottom} className="opacity-0" />
      <Handle type="source" position={Position.Top} className="opacity-0" />
      
      {/* Visual Dot on the line - Centered on the node's origin */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
        <div className={`w-3 h-3 rounded-full border-2 border-slate-950 z-10 ${colorClass}`}></div>
      </div>

      {/* Node Content List Row */}
      <div 
        className="absolute flex items-center gap-3 whitespace-nowrap group-hover:bg-slate-800/50 px-2 py-0.5 rounded transition-colors"
        style={{ left: `${textOffset}px`, top: '50%', transform: 'translateY(-50%)' }}
      >
        
        {/* Branches and Tags */}
        {(branches.length > 0 || tags.length > 0) && (
          <div className="flex items-center gap-1">
            {branches.map(b => (
              <span key={b.name} className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-0.5 ${b.isCurrent ? 'bg-blue-900/50 text-blue-400 border border-blue-800' : b.isRemote ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-emerald-900/50 text-emerald-400 border border-emerald-800'}`}>
                <GitBranchIcon className="w-2.5 h-2.5" />
                {b.name}
              </span>
            ))}
            {tags.map(t => (
              <span key={t.name} className="px-1.5 py-0.5 rounded bg-amber-900/50 text-amber-400 border border-amber-800 text-[10px] font-medium flex items-center gap-0.5">
                <Tag className="w-2.5 h-2.5" />
                {t.name}
              </span>
            ))}
          </div>
        )}

        {/* Message */}
        <span className="font-medium text-slate-200 text-sm" title={commit.message}>
          {commit.message}
        </span>
        
        {/* Author */}
        <span className="text-xs text-slate-500 flex items-center gap-1">
          <User className="w-3 h-3" />
          {commit.author.name}
        </span>

        {/* Hash */}
        <span className="text-xs font-mono text-slate-600">
          {commit.hash.substring(0, 7)}
        </span>

        {/* Date */}
        <span className="text-xs text-slate-600">
          {formatDistanceToNow(new Date(commit.timestamp), { addSuffix: true })}
        </span>

      </div>
    </div>
  );
}
