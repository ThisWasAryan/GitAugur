export interface GitAuthor {
  name: string;
  email: string;
}

export interface GitCommit {
  hash: string;
  message: string;
  author: GitAuthor;
  timestamp: string; // ISO string
  parentHashes: string[]; // Support for merge commits
  isGhost?: boolean; // For preview nodes
  files?: any[]; // Files changed in this commit
}

export interface GitBranch {
  name: string;
  commitHash: string;
  isRemote: boolean;
  isCurrent: boolean;
  upstream?: string;
  ahead?: number;
  behind?: number;
}

export interface GitTag {
  name: string;
  commitHash: string;
}

export interface GitHistory {
  commits: GitCommit[];
  branches: GitBranch[];
  tags: GitTag[];
}
