import dagre from 'dagre';
import type { Node, Edge } from '@xyflow/react';
import type { GitHistory } from '../types/git';

export const buildRepoFlowLayout = (history: GitHistory) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Create top-to-bottom layout
  dagreGraph.setGraph({ 
    rankdir: 'TB',
    nodesep: 50,
    ranksep: 60,
    align: 'DL' // Align nodes for a cleaner tree
  });

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Sort commits to process correctly (though dagre handles topological sorting)
  // We just need them all
  const commits = history.commits;
  
  // 1. Add Commit Nodes
  commits.forEach((commit) => {
    // Circle nodes (approx 60x60, dagre needs width/height)
    dagreGraph.setNode(commit.hash, { width: 60, height: 40 });
    
    nodes.push({
      id: commit.hash,
      type: 'commitNode',
      data: { hash: commit.hash, message: commit.message },
      position: { x: 0, y: 0 }
    });

    // Add edges from parents to this commit (Flow is Parent -> Child, top to bottom)
    commit.parentHashes.forEach(parentHash => {
      // Ensure we only link if the parent exists in our sliced history
      if (commits.some(c => c.hash === parentHash)) {
        dagreGraph.setEdge(parentHash, commit.hash);
        edges.push({
          id: `e-${parentHash}-${commit.hash}`,
          source: parentHash,
          target: commit.hash,
          type: 'default',
          style: { stroke: '#94a3b8', strokeWidth: 1.5 },
          animated: false,
        });
      }
    });
  });

  // 2. Add Branch and Tag Labels
  const labels: { commitHash: string, name: string, type: 'branch' | 'tag', isHead?: boolean }[] = [];
  
  history.branches.forEach(b => {
    labels.push({
      commitHash: b.commitHash,
      name: b.name,
      type: 'branch',
      isHead: b.isCurrent
    });
  });
  
  history.tags.forEach(t => {
    labels.push({
      commitHash: t.commitHash,
      name: t.name,
      type: 'tag'
    });
  });

  labels.forEach((label) => {
    // Only attach label if the commit exists in our graph
    if (!commits.some(c => c.hash === label.commitHash)) return;

    const labelId = `label-${label.commitHash}-${label.name.replace(/\\s+/g, '-')}`;
    
    // Label nodes (approx 100x24)
    dagreGraph.setNode(labelId, { width: 120, height: 24 });
    dagreGraph.setEdge(label.commitHash, labelId); // Edge from commit to label

    nodes.push({
      id: labelId,
      type: 'labelNode',
      data: { name: label.name, type: label.type, isHead: label.isHead },
      position: { x: 0, y: 0 }
    });

    edges.push({
      id: `e-${label.commitHash}-${labelId}`,
      source: label.commitHash,
      target: labelId,
      type: 'straight',
      style: { stroke: '#475569', strokeWidth: 2, opacity: 0.5 },
      animated: false,
    });
  });

  // Apply Dagre layout
  dagre.layout(dagreGraph);

  // Map calculated positions back to React Flow nodes
  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    // Dagre returns the center position, React Flow needs top-left
    node.position = {
      x: nodeWithPosition.x - nodeWithPosition.width / 2,
      y: nodeWithPosition.y - nodeWithPosition.height / 2,
    };
  });

  return { nodes, edges };
};
