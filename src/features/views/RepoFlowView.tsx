import { useMemo, useEffect } from 'react';
import { ReactFlow, useNodesState, useEdgesState, Background, Controls, useReactFlow, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useGitEngineStore } from '../../engine/GitEngineStore';
import { useInspectorStore } from '../../stores/useInspectorStore';
import { useLayoutStore } from '../../stores/useLayoutStore';
import { GitBranch as GitBranchIcon } from 'lucide-react';
import { buildRepoFlowLayout } from '../../utils/repoFlowLayout';
import { CircleCommitNode, LabelNode } from '../repo-flow/RepoFlowNodes';

const nodeTypes = {
  commitNode: CircleCommitNode,
  labelNode: LabelNode,
};

function RepoFlowGraph() {
  const { history } = useGitEngineStore();
  const { setCenter } = useReactFlow();
  const inspectEntity = useInspectorStore(state => state.inspectEntity);


  // Compute Layout
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    return buildRepoFlowLayout(history);
  }, [history]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Close sidebar on mount and zoom to latest
  useEffect(() => {
    useLayoutStore.getState().setRightSidebarOpen(false);
    useInspectorStore.getState().showStaging();
  }, []);

  // Update nodes and edges when history changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    
    // Zoom in to the newest commit (which should be at the bottom)
    setTimeout(() => {
      if (initialNodes.length > 0) {
        // Dagre puts leaves at the bottom. We can just find the max Y node to be safe
        let maxYNode = initialNodes[0];
        for (const node of initialNodes) {
          if (node.position.y > maxYNode.position.y) {
            maxYNode = node;
          }
        }
        setCenter(maxYNode.position.x + 32, maxYNode.position.y, { zoom: 1, duration: 800 });
      }
    }, 50);
  }, [initialNodes, initialEdges, setNodes, setEdges, setCenter]);

  // Handle node clicks to select branches or commits
  const onNodeClick = (_: React.MouseEvent, node: any) => {
    if (node.type === 'labelNode' && node.data.type === 'branch') {
      inspectEntity('branch', node.data.name);
    } else if (node.type === 'commitNode') {
      inspectEntity('commit', node.data.hash);
    }
  };

  return (
    <div className="flex w-full h-full bg-slate-950 flex-col">
      {/* Header Panel */}
      <div className="flex items-center gap-4 p-6 border-b border-slate-800 bg-slate-950 shrink-0">
        <GitBranchIcon className="w-8 h-8 text-blue-500" />
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Repository Flow</h1>
          <p className="text-slate-400 text-sm mt-1">Click on a branch label to view its details and merge options.</p>
        </div>
      </div>
      
      <div className="flex-1 flex w-full relative min-h-0">
        {/* Left Pane: Tree View using React Flow */}
        <div className="flex-1 relative h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            minZoom={0.2}
            maxZoom={2}
            proOptions={{ hideAttribution: true }}
            className="bg-slate-950"
            nodesDraggable={false}
            nodesConnectable={false}
            colorMode="dark"
          >
          <Background color="#1e293b" gap={20} size={1} />
          <Controls />
        </ReactFlow>
      </div>
      </div>
    </div>
  );
}

export function RepoFlowView() {
  return (
    <ReactFlowProvider>
      <RepoFlowGraph />
    </ReactFlowProvider>
  );
}
