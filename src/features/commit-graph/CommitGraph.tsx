import { useMemo, useEffect, useState } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Panel,
  type ReactFlowInstance,
} from "@xyflow/react";
import type { NodeTypes } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { CommitNode } from "./CommitNode";
import { buildGraphLayout } from "../../utils/graphLayout";
import { useRepositoryStore } from "../../stores/useRepositoryStore";
import { useNavigationStore } from "../../stores/useNavigationStore";
import { useGitEngineStore } from "../../engine/GitEngineStore";
import { StrictLaneEdge } from "./StrictLaneEdge";

const nodeTypes: NodeTypes = {
  commit: CommitNode as any,
};

const edgeTypes = {
  strict: StrictLaneEdge,
};

export function CommitGraph() {
  const repoPath = useRepositoryStore(state => state.repoPath);
  const graphMode = useNavigationStore(state => state.graphMode);
  const { history, preview } = useGitEngineStore();

  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  const layout = useMemo(() => {
    return buildGraphLayout(history, preview);
  }, [history, preview, graphMode]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layout.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layout.edges);

  useEffect(() => {
    setNodes(layout.nodes);
    setEdges(layout.edges);
  }, [layout, setNodes, setEdges]);

  useEffect(() => {
    if (rfInstance) {
      rfInstance.setViewport({ x: 50, y: 50, zoom: 1 });
    }
  }, [repoPath, rfInstance]);

  return (
    <div className="absolute inset-0 bg-slate-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onInit={setRfInstance}
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        colorMode="dark"
      >
        <Background color="#334155" gap={24} size={1.5} />
        <Controls />
        <Panel position="top-right" className="bg-slate-900/80 backdrop-blur border border-slate-800 p-3 rounded-lg shadow-xl text-sm">
          <h3 className="font-semibold text-slate-200 mb-1">Git Repository State</h3>
        </Panel>
      </ReactFlow>
    </div>
  );
}
