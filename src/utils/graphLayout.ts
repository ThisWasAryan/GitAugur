import type { GitHistory } from "../types/git";
import type { Node, Edge } from "@xyflow/react";

const LANE_WIDTH = 50;
const Y_SPACING = 120;

export function buildGraphLayout(history: GitHistory): { nodes: Node[], edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Sort commits newest first
  const sortedCommits = [...history.commits].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Simple lane assignment:
  // For each commit, if we haven't seen it, assign a lane.
  // Main branch commits (those reachable from main without following second parents) go to lane 0.
  // This is a naive layout for demonstration.
  
  const laneMap = new Map<string, number>();
  
  // Find the 'main' branch tip
  const mainTip = history.branches.find(b => b.name === "main")?.commitHash;
  
  // Trace main branch first
  if (mainTip) {
    let curr = mainTip;
    while (curr) {
      laneMap.set(curr, 0);
      const commit = sortedCommits.find(c => c.hash === curr);
      curr = commit?.parentHashes[0] || ""; // First parent is usually the same branch
    }
  }

  // Assign remaining lanes
  let nextLane = 1;
  sortedCommits.forEach(commit => {
    if (!laneMap.has(commit.hash)) {
      // Find a parent that has a lane to branch off, or assign a new lane
      laneMap.set(commit.hash, nextLane);
      
      // Try to keep ancestors in the same lane if possible
      let curr = commit.parentHashes[0];
      while (curr && !laneMap.has(curr)) {
        laneMap.set(curr, nextLane);
        const parentCommit = sortedCommits.find(c => c.hash === curr);
        curr = parentCommit?.parentHashes[0] || "";
      }
      nextLane++;
    }
  });

  sortedCommits.forEach((commit, index) => {
    const lane = laneMap.get(commit.hash) || 0;
    
    // Find branches and tags for this commit
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
        lane
      },
    });

    // Create edges to parents
    commit.parentHashes.forEach((parentHash, parentIndex) => {
      const isMergeEdge = parentIndex > 0;
      edges.push({
        id: `e-${commit.hash}-${parentHash}`,
        source: commit.hash,
        target: parentHash,
        type: "smoothstep",
        animated: false,
        style: {
          stroke: isMergeEdge ? "#8b5cf6" : "#3b82f6", // Purple for merge, Blue for standard
          strokeWidth: 3,
        },
      });
    });
  });

  return { nodes, edges };
}
