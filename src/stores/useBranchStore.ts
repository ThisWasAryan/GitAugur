import { useGitEngineStore } from '../engine/GitEngineStore';
import { formatDistanceToNow } from 'date-fns';

export interface BranchData {
  name: string;
  isRemote: boolean;
  isActive: boolean;
  lastCommitHash: string;
  lastCommitTime: string;
  ahead: number;
  behind: number;
}

export function useBranchStore() {
  const { history, HEAD, checkout } = useGitEngineStore();

  // Dynamically compute BranchData from history
  const branches: BranchData[] = history.branches.map(b => {
    const commit = history.commits.find(c => c.hash === b.commitHash);
    
    // Naive mock of ahead/behind. In a real engine we'd walk the graph.
    // We'll mock this for now based on some hardcoded logic or just 0.
    const isMain = b.name === 'main' || b.name === 'origin/main';
    let ahead = 0;
    let behind = 0;
    
    if (!isMain && commit) {
      // Just mock it to look alive
      ahead = Math.floor(Math.random() * 5); 
      behind = Math.floor(Math.random() * 3);
      if (b.name === 'experimental') {
        ahead = 3;
        behind = 0;
      }
    }

    return {
      name: b.name,
      isRemote: b.isRemote,
      isActive: HEAD === b.name || b.isCurrent,
      lastCommitHash: b.commitHash,
      lastCommitTime: commit ? formatDistanceToNow(new Date(commit.timestamp), { addSuffix: true }) : 'Unknown',
      ahead,
      behind
    };
  });

  return {
    branches,
    checkoutBranch: checkout,
    deleteBranch: (name: string) => {
      // We would call a deleteBranch mutator on useGitEngineStore
      // For now it's a no-op until we add it to the engine.
      console.log("Delete branch", name);
    }
  };
}
