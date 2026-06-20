import { useMemo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { NodeProps, Node } from "@xyflow/react";
import type { GitCommit, GitBranch, GitTag } from "../../types/git";
import { formatDistanceToNow } from "date-fns";
import { GitBranch as GitBranchIcon, Tag, User } from "lucide-react";

import type { GraphMode } from "../../stores/useNavigationStore";
import { useInspectorStore } from "../../stores/useInspectorStore";
import { useContextMenu } from "../../components/ui/ContextMenu";
import { colorForBranch, GHOST_COLOR } from "../../utils/branchColors";

export type CommitNodeData = {
  commit: GitCommit;
  branches: GitBranch[];
  tags: GitTag[];
  lane: number;
  totalLanes: number;
  primaryBranch: string;
  laneBranchName?: string;
  mode: GraphMode;
};

export type CommitNodeType = Node<CommitNodeData, 'commit'>;

export function CommitNode({ data }: NodeProps<CommitNodeType>) {
  const { commit, branches, tags, lane, totalLanes } = data;
  const { inspectEntity } = useInspectorStore();
  const { showMenu } = useContextMenu();
  
  // Choose a color based on the branch lineage
  const colorSet = useMemo(() => {
    if (commit.isGhost) return GHOST_COLOR;
    return colorForBranch(data.laneBranchName || data.primaryBranch || '');
  }, [commit.isGhost, data.laneBranchName, data.primaryBranch]);

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
            { label: 'Cherry Pick', onClick: () => useGitEngineStore.getState().cherryPick(commit.hash) },
            { label: 'Interactive Rebase from Here', onClick: () => useGitEngineStore.getState().rebase(commit.hash + '^') }
          ]);
        }}
      >
        
        {/* Branches and Tags */}
        {(branches.length > 0 || tags.length > 0) && (
          <div className="flex items-center gap-1">
            {branches.map(b => {
              const bColor = colorForBranch(b.isRemote ? b.name.replace('origin/', '') : b.name);
              return (
              <span key={b.name} className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-0.5 border ${b.isCurrent ? 'border-blue-400 ring-1 ring-blue-400' : bColor.border} ${bColor.text} ${bColor.bg.replace('bg-', 'bg-opacity-20 bg-')}`}>
                <GitBranchIcon className="w-2.5 h-2.5" />
                {b.name}
              </span>
            )})}
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
