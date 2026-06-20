import type { GitHistory } from "../types/git";
import { type Node, type Edge, MarkerType } from "@xyflow/react";
import type { PreviewState } from "../engine/GitEngineStore";
import { colorForBranch } from "./branchColors";

export function buildGraphLayout(history: GitHistory, preview?: PreviewState): { nodes: Node[], edges: Edge[] } {
  const getBranchPriority = (name: string): number => {
    if (name === 'main' || name === 'master') return 100;
    if (name === 'develop' || name === 'dev') return 90;
    return 50;
  };

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
  const branchMap = new Map<string, string>();
  const laneBranchMap = new Map<number, string>();
  let nextLane = 0;

  // Pre-seed branchMap with branch tips, prioritizing local and main branches
  const branchesToLayout = history.branches.map(b => {
    if (preview?.active && preview.ghostCommit && preview.targetBranch === b.name) {
      return { ...b, commitHash: preview.ghostCommit.hash };
    }
    return b;
  });

  // If the target branch didn't exist (e.g. creating a new branch), add it
  if (preview?.active && preview.ghostCommit && preview.targetBranch && !branchesToLayout.some(b => b.name === preview.targetBranch)) {
    branchesToLayout.push({
      name: preview.targetBranch,
      commitHash: preview.ghostCommit.hash,
      isRemote: false,
      upstream: undefined
    });
  }

  const sortedBranches = branchesToLayout.sort((a, b) => {
    if (a.name === 'main' || a.name === 'master') return -1;
    if (b.name === 'main' || b.name === 'master') return 1;
    if (a.isRemote && !b.isRemote) return 1;
    if (!a.isRemote && b.isRemote) return -1;
    return a.name.localeCompare(b.name);
  });

  sortedBranches.forEach(b => {
    // Determine a clean branch name (strip origin/ if remote but we want consistent colors)
    let cleanName = b.name;
    if (b.isRemote && cleanName.startsWith('origin/')) {
      cleanName = cleanName.replace('origin/', '');
    }
    
    const existing = branchMap.get(b.commitHash);
    if (!existing || getBranchPriority(cleanName) > getBranchPriority(existing)) {
      branchMap.set(b.commitHash, cleanName);
    }
  });

  if (preview?.active && preview.ghostCommit && preview.targetBranch) {
    branchMap.set(preview.ghostCommit.hash, preview.targetBranch);
  }

  // Phase 1: Parse merge messages and propagate branch names downward
  sortedCommits.forEach(commit => {
    const currentBranch = branchMap.get(commit.hash) || '';
    
    if (commit.parentHashes.length > 0) {
      const firstParent = commit.parentHashes[0];
      if (currentBranch) {
        const existingBranch = branchMap.get(firstParent);
        if (!existingBranch || getBranchPriority(currentBranch) > getBranchPriority(existingBranch)) {
          branchMap.set(firstParent, currentBranch);
        }
      }

      if (commit.parentHashes.length > 1) {
        let mergedBranch = '';
        const msg = commit.message;
        const m1 = msg.match(/Merge branch '([^']+)'/i);
        const m2 = msg.match(/Merge pull request #[0-9]+ from ([^\s]+)/i);
        const m3 = msg.match(/merge ([^\s]+) into/i);
        
        if (m1) mergedBranch = m1[1];
        else if (m2) mergedBranch = m2[1];
        else if (m3) mergedBranch = m3[1];
        
        if (mergedBranch.startsWith('origin/')) {
          mergedBranch = mergedBranch.replace('origin/', '');
        }

        for (let i = 1; i < commit.parentHashes.length; i++) {
          const otherParent = commit.parentHashes[i];
          const branchToPass = mergedBranch || currentBranch;
          
          if (branchToPass) {
            const existingOther = branchMap.get(otherParent);
            if (!existingOther || getBranchPriority(branchToPass) > getBranchPriority(existingOther)) {
              branchMap.set(otherParent, branchToPass);
            }
          }
        }
      }
    }
  });

  const commitByHash = new Map<string, typeof sortedCommits[0]>();
  sortedCommits.forEach(c => commitByHash.set(c.hash, c));

  // Phase 2: Trace branches to reserve lanes (highest priority first)
  sortedBranches.forEach(b => {
    let cleanName = b.name;
    if (b.isRemote && cleanName.startsWith('origin/')) {
      cleanName = cleanName.replace('origin/', '');
    }

    let currentHash: string | undefined = b.commitHash;
    let assignedLane = false;
    let branchLane = -1;

    while (currentHash) {
      if (!laneMap.has(currentHash)) {
         if (!assignedLane) {
            branchLane = nextLane++;
            laneBranchMap.set(branchLane, cleanName);
            assignedLane = true;
         }
         laneMap.set(currentHash, branchLane);
         
         const c = commitByHash.get(currentHash);
         if (c && c.parentHashes.length > 0) {
            currentHash = c.parentHashes[0]; // Follow first parent
         } else {
            currentHash = undefined;
         }
      } else {
         // Already assigned to a lane (e.g. merged into a higher-priority branch)
         currentHash = undefined;
      }
    }
  });

  // Phase 3: Fallback first-parent traversal for unassigned commits (detached heads, deleted branches)
  sortedCommits.forEach(commit => {
    let currentHash: string | undefined = commit.hash;
    let assignedLane = false;
    let branchLane = -1;

    while (currentHash) {
      if (!laneMap.has(currentHash)) {
         if (!assignedLane) {
            branchLane = nextLane++;
            const fallbackBranch = branchMap.get(currentHash) || `__lane_${branchLane}`;
            laneBranchMap.set(branchLane, fallbackBranch);
            assignedLane = true;
         }
         laneMap.set(currentHash, branchLane);
         
         const c = commitByHash.get(currentHash);
         if (c && c.parentHashes.length > 0) {
            currentHash = c.parentHashes[0];
         } else {
            currentHash = undefined;
         }
      } else {
         currentHash = undefined;
      }
    }
  });

  const totalLanes = nextLane;

  sortedCommits.forEach((commit, index) => {
    const lane = laneMap.get(commit.hash) || 0;
    const primaryBranch = branchMap.get(commit.hash) || '';
    const laneBranchName = laneBranchMap.get(lane) || `__lane_${lane}`;
    
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
        primaryBranch,
        laneBranchName,
        mode: 'GIT_GRAPH'
      },
    });

    commit.parentHashes.forEach((parentHash, parentIndex) => {
      const isMergeEdge = parentIndex > 0;
      
      // Determine the lane for the edge color.
      // Merge edges take the color of the branch being merged IN (the parent).
      // Normal edges take the color of the current lane.
      const targetLane = laneMap.get(parentHash) || 0;
      const edgeLaneBranchName = laneBranchMap.get(targetLane) || `__lane_${targetLane}`;
      
      const bColor = colorForBranch(edgeLaneBranchName);
      
      edges.push({
        id: `e-${commit.hash}-${parentHash}`,
        source: commit.hash,
        target: parentHash,
        type: 'strict',
        animated: !!commit.isGhost,
        data: {
          primaryBranch: edgeLaneBranchName,
          isGhost: commit.isGhost,
          isMergeEdge,
        },
        markerStart: isMergeEdge ? {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: commit.isGhost ? "#64748b" : bColor.stroke,
          orient: "auto-start-reverse",
        } : undefined,
        style: {
          stroke: commit.isGhost ? "#64748b" : bColor.stroke,
          strokeWidth: 2, 
          strokeDasharray: commit.isGhost ? "5,5" : "none",
        },
      });
    });
  });

  return { nodes, edges };
}
