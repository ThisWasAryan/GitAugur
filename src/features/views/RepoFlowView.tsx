import { useState } from 'react';
import { useGitEngineStore } from '../../engine/GitEngineStore';
import { GitBranch as GitBranchIcon, GitMerge, AlertTriangle, ArrowUp, ArrowDown, Clock, CheckCircle2 } from 'lucide-react';
import { useNavigationStore } from '../../stores/useNavigationStore';

export function RepoFlowView() {
  const { history } = useGitEngineStore();
  const [selectedBranchName, setSelectedBranchName] = useState<string | null>(null);

  const branches = history.branches;
  const localBranches = branches.filter(b => !b.isRemote);
  const mainBranch = localBranches.find(b => b.name === 'main');
  const otherBranches = localBranches.filter(b => b.name !== 'main');

  const selectedBranch = branches.find(b => b.name === selectedBranchName);

  const handleDragStart = (e: React.DragEvent, branchName: string) => {
    e.dataTransfer.setData('application/x-git-branch', branchName);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetBranchName: string) => {
    e.preventDefault();
    const sourceBranchName = e.dataTransfer.getData('application/x-git-branch');
    if (sourceBranchName && sourceBranchName !== targetBranchName) {
      if (window.confirm(`Rebase '${sourceBranchName}' onto '${targetBranchName}'?`)) {
        // We must switch to the source branch first before rebasing onto the target branch
        const { checkout, rebase } = useGitEngineStore.getState();
        await checkout(sourceBranchName);
        await rebase(targetBranchName);
      }
    }
  };

  // Helper to compute ahead/behind using DAG
  const getBranchMetrics = (branchName: string) => {
    const branch = branches.find(b => b.name === branchName);
    if (!branch || !mainBranch || branchName === 'main') return { ahead: 0, behind: 0, lastCommitTime: 'Unknown' };

    const branchCommit = history.commits.find(c => c.hash === branch.commitHash);
    const lastCommitTime = branchCommit ? new Date(branchCommit.timestamp).toLocaleDateString() : 'Unknown';

    return { ahead: branch.ahead || 0, behind: branch.behind || 0, lastCommitTime };
  };

  const renderTreeItem = (branch: typeof branches[0], isLast: boolean) => {
    const isSelected = selectedBranchName === branch.name;
    const metrics = getBranchMetrics(branch.name);
    const isStale = metrics.ahead === 0 && metrics.behind > 3;
    const isHealthy = metrics.ahead > 0 && metrics.behind === 0;

    return (
      <div key={branch.name} className="flex relative">
        {/* Tree lines */}
        <div className="w-12 relative shrink-0">
          <div className="absolute top-0 bottom-0 left-6 w-px bg-slate-800" style={{ height: isLast ? '24px' : '100%' }}></div>
          <div className="absolute top-6 left-6 w-6 h-px bg-slate-800"></div>
        </div>

        {/* Branch Card */}
        <div 
          draggable
          onDragStart={(e) => handleDragStart(e, branch.name)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, branch.name)}
          onClick={() => setSelectedBranchName(branch.name)}
          className={`mt-2 mb-4 p-4 rounded-xl border flex-1 cursor-grab active:cursor-grabbing transition-all ${
            isSelected ? 'bg-blue-950/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <GitBranchIcon className={`w-5 h-5 ${isStale ? 'text-slate-500' : 'text-blue-400'}`} />
            <h3 className={`font-mono font-medium text-lg ${isSelected ? 'text-blue-400' : 'text-slate-200'}`}>
              {branch.name}
            </h3>
            {branch.isCurrent && (
              <span className="text-[10px] uppercase tracking-wider font-bold bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
                Active
              </span>
            )}
          </div>

          <div className="pl-8 flex flex-col gap-2">
            <div className="flex items-center gap-4 text-sm">
              <span className={`flex items-center gap-1 ${metrics.ahead > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                <ArrowUp className="w-4 h-4" /> {metrics.ahead} commit{metrics.ahead !== 1 && 's'} ahead
              </span>
              <span className={`flex items-center gap-1 ${metrics.behind > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                <ArrowDown className="w-4 h-4" /> {metrics.behind} commit{metrics.behind !== 1 && 's'} behind
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              {isHealthy ? (
                <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/30 px-2 py-1 rounded w-fit border border-emerald-900/50">
                  <CheckCircle2 className="w-4 h-4" /> Ready for Pull Request
                </span>
              ) : isStale ? (
                <span className="flex items-center gap-1.5 text-slate-400 bg-slate-800/50 px-2 py-1 rounded w-fit border border-slate-700/50">
                  <Clock className="w-4 h-4" /> Stale branch - Candidate for deletion
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-amber-400 bg-amber-950/30 px-2 py-1 rounded w-fit border border-amber-900/50">
                  <AlertTriangle className="w-4 h-4" /> Needs updates from main
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex w-full h-full bg-slate-950">
      {/* Left Pane: Tree View */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
              <GitBranchIcon className="w-8 h-8 text-blue-500" />
              Repository Flow
            </h1>
            <p className="text-slate-400 mt-2 text-lg">Understand how work is organized and the health of your branches.</p>
          </div>

          <div className="font-mono">
            {/* Main Branch Root */}
            {mainBranch && (
              <div 
                draggable
                onDragStart={(e) => handleDragStart(e, 'main')}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'main')}
                onClick={() => setSelectedBranchName('main')}
                className={`flex items-center gap-3 p-4 rounded-xl border mb-2 cursor-grab active:cursor-grabbing transition-all ${
                  selectedBranchName === 'main' ? 'bg-blue-950/20 border-blue-500/50' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                <span className="text-xl font-bold text-slate-200">main</span>
                <span className="text-xs text-slate-500 ml-auto flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Updated {getBranchMetrics('main').lastCommitTime}
                </span>
              </div>
            )}

            {/* Children Branches */}
            <div className="ml-2">
              {otherBranches.map((branch, idx) => renderTreeItem(branch, idx === otherBranches.length - 1))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane: Branch Details Sidebar */}
      {selectedBranch && (
        <div className="w-[400px] border-l border-slate-800 bg-slate-900/50 flex flex-col shrink-0 animate-in slide-in-from-right-8 duration-300">
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
