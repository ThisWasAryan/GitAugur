import { Handle, Position } from "@xyflow/react";
import type { NodeProps, Node } from "@xyflow/react";
import type { GitCommit, GitBranch, GitTag } from "../../types/git";
import { formatDistanceToNow } from "date-fns";
import { GitBranch as GitBranchIcon, Tag, User } from "lucide-react";

import type { GraphMode } from "../../stores/useNavigationStore";
import { useInspectorStore } from "../../stores/useInspectorStore";
import { useContextMenu } from "../../components/ui/ContextMenu";

export type CommitNodeData = {
  commit: GitCommit;
  branches: GitBranch[];
  tags: GitTag[];
  lane: number;
  totalLanes: number;
  mode: GraphMode;
};

export type CommitNodeType = Node<CommitNodeData, 'commit'>;

export function CommitNode({ data }: NodeProps<CommitNodeType>) {
  const { commit, branches, tags, lane, totalLanes } = data;
  const { inspectEntity } = useInspectorStore();
  const { showMenu } = useContextMenu();
  
  // Choose a color based on the lane
  const laneColors = commit.isGhost 
    ? [{ bg: "bg-slate-700/50", text: "text-slate-400 italic", border: "border-slate-500/50 border-dashed", line: "bg-slate-600/30 dashed" }]
    : [
      { bg: "bg-blue-500", text: "text-blue-400", border: "border-blue-500/30", line: "bg-blue-500/20" },
      { bg: "bg-purple-500", text: "text-purple-400", border: "border-purple-500/30", line: "bg-purple-500/20" },
      { bg: "bg-green-500", text: "text-green-400", border: "border-green-500/30", line: "bg-green-500/20" },
      { bg: "bg-orange-500", text: "text-orange-400", border: "border-orange-500/30", line: "bg-orange-500/20" },
      { bg: "bg-pink-500", text: "text-pink-400", border: "border-pink-500/30", line: "bg-pink-500/20" }
    ];
  const colorSet = laneColors[commit.isGhost ? 0 : (lane % laneColors.length)];

  // Width of one lane is 24px (from graphLayout LANE_WIDTH for GIT_GRAPH).
  // Total lanes padding to push text to the right.
  const textOffset = (totalLanes - lane) * 24 + 16;

  return (
    <div className={`flex items-center group relative h-[24px] min-w-[20px] ${commit.isGhost ? 'opacity-80' : ''}`}>
      {/* Invisible handles for routing */}
      <Handle type="target" position={Position.Bottom} className="opacity-0" />
      <Handle type="source" position={Position.Top} className="opacity-0" />
      
      {/* Visual Dot on the line - Centered on the node's origin */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
        <div className={`w-3 h-3 rounded-full border-2 border-slate-950 z-10 ${colorSet.bg} ${commit.isGhost ? 'animate-pulse' : ''}`}></div>
      </div>

      {/* Horizontal connecting line from dot to text container */}
      <div 
        className={`absolute top-1/2 -translate-y-1/2 h-[1px] ${colorSet.line} transition-opacity duration-300 opacity-0 group-hover:opacity-100`}
        style={{ left: '6px', width: `${textOffset - 6}px` }}
      />

      {/* Node Content List Row */}
      <div 
        className={`absolute flex items-center gap-3 whitespace-nowrap px-2 py-0.5 rounded border border-transparent group-hover:${colorSet.border} group-hover:bg-slate-800/80 transition-all cursor-pointer`}
        style={{ left: `${textOffset}px`, top: '50%', transform: 'translateY(-50%)' }}
        onClick={() => inspectEntity('commit', commit.hash)}
        onContextMenu={(e) => {
          e.preventDefault();
          showMenu(e.clientX, e.clientY, [
            { label: 'View Details', onClick: () => inspectEntity('commit', commit.hash) },
            { label: 'Copy Commit Hash', onClick: () => navigator.clipboard.writeText(commit.hash) },
            { divider: true, onClick: () => {} },
            { label: 'Cherry Pick', onClick: () => console.log('Cherry pick', commit.hash) },
            { label: 'Interactive Rebase from Here', onClick: () => console.log('Rebase', commit.hash) }
          ]);
        }}
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
        <span className={`font-medium text-sm transition-colors ${colorSet.text}`} title={commit.message}>
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
