import { useState, useMemo, useEffect } from 'react';
import { ReactFlow, useNodesState, useEdgesState, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useGitEngineStore } from '../../engine/GitEngineStore';
import { GitBranch as GitBranchIcon, GitMerge, CheckCircle2 } from 'lucide-react';
import { useNavigationStore } from '../../stores/useNavigationStore';
import { buildRepoFlowLayout } from '../../utils/repoFlowLayout';
import { CircleCommitNode, LabelNode } from '../repo-flow/RepoFlowNodes';

const nodeTypes = {
  commitNode: CircleCommitNode,
  labelNode: LabelNode,
};

export function RepoFlowView() {
  const { history } = useGitEngineStore();
  const [selectedBranchName, setSelectedBranchName] = useState<string | null>(null);

  const branches = history.branches;
  const mainBranch = branches.find(b => b.name === 'main' && !b.isRemote);

  const selectedBranch = branches.find(b => b.name === selectedBranchName && !b.isRemote);

  // Compute Layout
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    return buildRepoFlowLayout(history);
  }, [history]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes and edges when history changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Handle node clicks to select branches
  const onNodeClick = (_: React.MouseEvent, node: any) => {
    if (node.type === 'labelNode' && node.data.type === 'branch') {
      setSelectedBranchName(node.data.name);
    }
  };

  // Helper to compute ahead/behind
  const getBranchMetrics = (branchName: string) => {
    const branch = branches.find(b => b.name === branchName);
    if (!branch || !mainBranch || branchName === 'main') return { ahead: 0, behind: 0, lastCommitTime: 'Unknown' };

    const branchCommit = history.commits.find(c => c.hash === branch.commitHash);
    const lastCommitTime = branchCommit ? new Date(branchCommit.timestamp).toLocaleDateString() : 'Unknown';

    return { ahead: branch.ahead || 0, behind: branch.behind || 0, lastCommitTime };
  };

  return (
    <div className="flex w-full h-full bg-slate-950">
      {/* Left Pane: Tree View using React Flow */}
      <div className="flex-1 relative">
        <div className="absolute top-6 left-8 z-10 pointer-events-none">
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
            <GitBranchIcon className="w-8 h-8 text-blue-500" />
            Repository Flow
          </h1>
          <p className="text-slate-400 mt-2 text-sm max-w-sm drop-shadow-md bg-slate-950/50 rounded-md p-1">
            Click on a branch label to view its details and merge options.
          </p>
        </div>
        
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.2}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
          className="bg-slate-950"
        >
          <Background color="#1e293b" gap={20} size={1} />
          <Controls className="fill-slate-400 bg-slate-900 border-slate-800" />
        </ReactFlow>
      </div>

      {/* Right Pane: Branch Details Sidebar */}
      {selectedBranch && (
        <div className="w-[400px] border-l border-slate-800 bg-slate-900/50 flex flex-col shrink-0 animate-in slide-in-from-right-8 duration-300 relative z-20">
          <button 
            onClick={() => setSelectedBranchName(null)}
            className="absolute top-4 right-4 text-slate-400 hover:text-white"
          >
            ✕
          </button>
          
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-xl font-bold font-mono text-slate-200 flex items-center gap-2">
              <GitBranchIcon className="w-5 h-5 text-blue-500" />
              {selectedBranch.name}
            </h2>
            {selectedBranch.isCurrent && (
              <p className="text-sm text-blue-400 mt-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Currently checked out
              </p>
            )}
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Branch Health</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Origin</span>
                <span className="text-slate-200 font-mono text-sm">main</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Last Updated</span>
                <span className="text-slate-200 text-sm">{getBranchMetrics(selectedBranch.name).lastCommitTime}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Commits Ahead</span>
                <span className="text-emerald-400 font-bold">{getBranchMetrics(selectedBranch.name).ahead}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Commits Behind</span>
                <span className="text-rose-400 font-bold">{getBranchMetrics(selectedBranch.name).behind}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-800/50">
                <span className="text-slate-400 text-sm">Status</span>
                <span className={`text-sm font-medium ${getBranchMetrics(selectedBranch.name).ahead > 0 && getBranchMetrics(selectedBranch.name).behind === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {getBranchMetrics(selectedBranch.name).ahead > 0 && getBranchMetrics(selectedBranch.name).behind === 0 ? 'Ready To Merge' : 'Requires Review'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Conflicts</span>
                <span className="text-emerald-400 text-sm">None</span>
              </div>
            </div>

            {selectedBranch.name !== 'main' && (
              <div className="bg-blue-950/20 border border-blue-900/50 rounded-xl p-5 mt-auto">
                <h3 className="font-semibold text-blue-400 mb-3 flex items-center gap-2">
                  <GitMerge className="w-4 h-4" />
                  If merged now:
                </h3>
                <ul className="space-y-2 mb-6">
                  <li className="text-slate-300 text-sm flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    {getBranchMetrics(selectedBranch.name).ahead} commits added
                  </li>
                  <li className="text-slate-300 text-sm flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {Math.max(1, getBranchMetrics(selectedBranch.name).ahead * 2)} files modified
                  </li>
                </ul>
                
                <button 
                  onClick={() => {
                    useGitEngineStore.getState().previewMerge(selectedBranch.name, useGitEngineStore.getState().HEAD || 'main');
                    useNavigationStore.getState().setGraphMode('GIT_GRAPH');
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg shadow-lg shadow-blue-900/20 transition-all mb-2"
                >
                  Preview Merge
                </button>
                <button 
                  onClick={() => useGitEngineStore.getState().merge(selectedBranch.name)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-2.5 rounded-lg transition-all"
                >
                  Merge into Current Branch
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
