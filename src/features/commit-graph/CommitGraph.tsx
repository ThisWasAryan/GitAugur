import { useMemo, useEffect } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Panel,
} from "@xyflow/react";
import type { NodeTypes } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { CommitNode } from "./CommitNode";
import { mockGitHistory } from "../../services/mockData";
import { buildGraphLayout } from "../../utils/graphLayout";
import { useNavigationStore } from "../../stores/useNavigationStore";

const nodeTypes: NodeTypes = {
  commit: CommitNode as any,
};

export function CommitGraph() {
  const graphMode = useNavigationStore(state => state.graphMode);

  // Compute layout whenever mode changes
  const layout = useMemo(() => {
    return buildGraphLayout(mockGitHistory, graphMode);
  }, [graphMode]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layout.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layout.edges);

  useEffect(() => {
    setNodes(layout.nodes);
    setEdges(layout.edges);
  }, [layout, setNodes, setEdges]);

  return (
    <div className="absolute inset-0 bg-slate-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.5}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#334155" gap={24} size={1.5} />
        <Controls className="bg-slate-900 border-slate-800 fill-slate-300" />
        <Panel position="top-right" className="bg-slate-900/80 backdrop-blur border border-slate-800 p-3 rounded-lg shadow-xl text-sm">
          <h3 className="font-semibold text-slate-200 mb-1">Git Repository State</h3>
          <p className="text-slate-400">Mock Data Visualization Mode</p>
        </Panel>
      </ReactFlow>
    </div>
  );
}
