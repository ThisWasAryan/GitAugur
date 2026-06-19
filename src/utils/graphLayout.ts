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
  
  // Find the 'main' branch tip
  const mainTip = history.branches.find(b => b.name === "main")?.commitHash;
  
  // Trace main branch first
  if (mainTip) {
    let curr = mainTip;
    while (curr) {
      laneMap.set(curr, 0);
      const commit = sortedCommits.find(c => c.hash === curr);
      curr = commit?.parentHashes[0] || ""; 
    }
  }

  // Assign remaining lanes
  let nextLane = 1;
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

  let maxLanes = 0;
  laneMap.forEach(lane => {
    if (lane > maxLanes) maxLanes = lane;
  });
  const totalLanes = maxLanes + 1;

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
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: commit.isGhost ? "#64748b" : (isMergeEdge ? "#8b5cf6" : "#3b82f6"),
        },
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
