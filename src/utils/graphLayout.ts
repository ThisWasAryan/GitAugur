import type { GitHistory } from "../types/git";
import { type Node, type Edge, MarkerType } from "@xyflow/react";
import type { PreviewState } from "../engine/GitEngineStore";

export function buildGraphLayout(history: GitHistory, preview?: PreviewState): { nodes: Node[], edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const LANE_WIDTH = 24;
  const Y_SPACING = 40;

  // Inject ghost commit if active
  const commitsToLayout = [...history.commits];
  if (preview?.active && preview.ghostCommit) {
    commitsToLayout.push(preview.ghostCommit);
  }

  // Sort commits newest first
  const sortedCommits = commitsToLayout.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const laneMap = new Map<string, number>();
  
  // Sort branches to determine lane priority
  // 1. main branch
  // 2. checked out branch
  // 3. other branches (could sort by newest commit)
  const branches = [...history.branches].sort((a, b) => {
    if (a.name === 'main') return -1;
    if (b.name === 'main') return 1;
    if (a.isCurrent) return -1;
    if (b.isCurrent) return 1;
    return 0;
  });

  let nextLane = 0;

  // Trace branch lineages to assign lanes
  branches.forEach(branch => {
    let curr = branch.commitHash;
    let startedNewLane = false;

    while (curr) {
      if (!laneMap.has(curr)) {
        if (!startedNewLane) {
          startedNewLane = true;
          // Only increment nextLane if it's not the very first branch (main)
          if (nextLane > 0 || branch.name !== 'main') {
            // Actually, just assign the current nextLane, then increment it for the next one
            // Wait, if it's main, we want it on lane 0.
            // Let's just use `nextLane` and increment it only when we actually use it.
          }
        }
        laneMap.set(curr, nextLane);
        const commit = sortedCommits.find(c => c.hash === curr);
        curr = commit?.parentHashes[0] || ""; 
      } else {
        break; // Reached a commit already assigned to a lane
      }
    }
    if (startedNewLane) {
      nextLane++;
    }
  });

  // Fallback for any unreachable commits (e.g. ghost commits or detached HEADs)
  sortedCommits.forEach(commit => {
    if (!laneMap.has(commit.hash)) {
      laneMap.set(commit.hash, nextLane);
      let curr = commit.parentHashes[0];
      while (curr && !laneMap.has(curr)) {
        laneMap.set(curr, nextLane);
        const parentCommit = sortedCommits.find(c => c.hash === curr);
        curr = parentCommit?.parentHashes[0] || "";
      }
      nextLane++;
    }
  });

  const totalLanes = nextLane;

  sortedCommits.forEach((commit, index) => {
    const lane = laneMap.get(commit.hash) || 0;
    
    const commitBranches = history.branches.filter(b => b.commitHash === commit.hash);
    const commitTags = history.tags.filter(t => t.commitHash === commit.hash);

    nodes.push({
      id: commit.hash,
      type: "commit",
      position: { x: lane * LANE_WIDTH, y: index * Y_SPACING },
      data: {
        commit,
        branches: commitBranches,
        tags: commitTags,
        lane,
        totalLanes,
        mode: 'GIT_GRAPH'
      },
    });

    commit.parentHashes.forEach((parentHash, parentIndex) => {
      const isMergeEdge = parentIndex > 0;
      
      edges.push({
        id: `e-${commit.hash}-${parentHash}`,
        source: commit.hash,
        target: parentHash,
        type: 'strict',
        animated: !!commit.isGhost,
        markerStart: isMergeEdge ? {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: commit.isGhost ? "#64748b" : "#8b5cf6",
          orient: "auto-start-reverse",
        } : undefined,
        style: {
          stroke: commit.isGhost ? "#64748b" : (isMergeEdge ? "#8b5cf6" : "#3b82f6"), 
          strokeWidth: 2, 
          strokeDasharray: commit.isGhost ? "5,5" : "none",
        },
      });
    });
  });

  return { nodes, edges };
}
