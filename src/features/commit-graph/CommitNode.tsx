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
};

export type CommitNodeType = Node<CommitNodeData, 'commit'>;

export function CommitNode({ data }: NodeProps<CommitNodeType>) {
  const { commit, branches, tags, lane } = data;
  
  // Choose a color based on the lane
  const laneColors = ["bg-blue-500", "bg-purple-500", "bg-green-500", "bg-orange-500", "bg-pink-500"];
  const colorClass = laneColors[lane % laneColors.length];

  return (
    <div className="flex items-center group relative min-w-[300px]">
      <Handle type="target" position={Position.Bottom} className="opacity-0" />
      <Handle type="source" position={Position.Top} className="opacity-0" />
      
      {/* Visual Dot on the line */}
      <div className="absolute left-0 -ml-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center">
        <div className={`w-5 h-5 rounded-full border-4 border-slate-900 z-10 ${colorClass}`}></div>
      </div>

      {/* Node Content Card */}
      <div className="ml-8 bg-slate-900 border border-slate-800 rounded-lg p-3 w-full shadow-md hover:border-slate-600 transition-colors flex flex-col gap-2 relative">
        
        {/* Branches and Tags */}
        {(branches.length > 0 || tags.length > 0) && (
          <div className="flex flex-wrap gap-1 mb-1">
            {branches.map(b => (
              <span key={b.name} className={`px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 ${b.isCurrent ? 'bg-blue-900/50 text-blue-400 border border-blue-800' : b.isRemote ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-emerald-900/50 text-emerald-400 border border-emerald-800'}`}>
                <GitBranchIcon className="w-3 h-3" />
                {b.name}
              </span>
            ))}
            {tags.map(t => (
              <span key={t.name} className="px-2 py-0.5 rounded bg-amber-900/50 text-amber-400 border border-amber-800 text-xs font-medium flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {t.name}
              </span>
            ))}
          </div>
        )}

        {/* Message and Hash */}
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-medium text-slate-200 text-sm leading-snug truncate" title={commit.message}>
            {commit.message}
          </h3>
          <span className="text-xs font-mono text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
            {commit.hash.substring(0, 7)}
          </span>
        </div>

        {/* Author and Date */}
        <div className="flex items-center justify-between mt-1 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center">
              <User className="w-3 h-3 text-slate-400" />
            </div>
            <span>{commit.author.name}</span>
          </div>
          <span>{formatDistanceToNow(new Date(commit.timestamp), { addSuffix: true })}</span>
        </div>
      </div>
    </div>
  );
}
