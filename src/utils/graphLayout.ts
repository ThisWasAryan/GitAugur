import type { GitHistory } from "../types/git";
import type { Node, Edge } from "@xyflow/react";
import type { GraphMode } from "../stores/useNavigationStore";

export function buildGraphLayout(history: GitHistory, mode: GraphMode = 'GIT_GRAPH'): { nodes: Node[], edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Determine geometry based on mode
  const LANE_WIDTH = mode === 'REPO_FLOW' ? 120 : (mode === 'TIMELINE' ? 0 : 24);
  const Y_SPACING = mode === 'REPO_FLOW' ? 80 : (mode === 'TIMELINE' ? 60 : 40);

  // Sort commits newest first
  const sortedCommits = [...history.commits].sort((a, b) => 
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

  // If REPO_FLOW, generate background lane nodes
  if (mode === 'REPO_FLOW') {
    const laneColors = ["rgba(59,130,246,0.05)", "rgba(168,85,247,0.05)", "rgba(34,197,94,0.05)", "rgba(249,115,22,0.05)", "rgba(236,72,153,0.05)"];
    for (let i = 0; i < totalLanes; i++) {
      nodes.push({
        id: `lane-bg-${i}`,
        type: 'default', // Using default node but heavily styled, or we can use a custom type if needed. We'll use a standard group node style.
        position: { x: i * LANE_WIDTH - (LANE_WIDTH/2) + 12, y: -100 }, // Center behind the dots
        data: { label: '' },
        style: {
          width: LANE_WIDTH - 16,
          height: sortedCommits.length * Y_SPACING + 200,
          backgroundColor: laneColors[i % laneColors.length],
          border: 'none',
          borderRadius: 8,
          zIndex: -1,
          pointerEvents: 'none'
        },
        selectable: false,
        draggable: false
      });
    }
  }

  sortedCommits.forEach((commit, index) => {
    const lane = mode === 'TIMELINE' ? 0 : (laneMap.get(commit.hash) || 0);
    
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
        totalLanes: mode === 'TIMELINE' ? 1 : totalLanes,
        mode
      },
    });

    if (mode !== 'TIMELINE') {
      commit.parentHashes.forEach((parentHash, parentIndex) => {
        const isMergeEdge = parentIndex > 0;
        
        edges.push({
          id: `e-${commit.hash}-${parentHash}`,
          source: commit.hash,
          target: parentHash,
          type: mode === 'REPO_FLOW' ? 'smoothstep' : 'bezier',
          animated: false,
          style: {
            stroke: isMergeEdge ? "#8b5cf6" : "#3b82f6", 
            strokeWidth: mode === 'REPO_FLOW' ? 3 : 2, 
          },
        });
      });
    }
  });

  return { nodes, edges };
}
