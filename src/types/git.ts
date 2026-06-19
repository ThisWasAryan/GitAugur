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
}

export interface GitBranch {
  name: string;
  commitHash: string;
  isRemote: boolean;
  isCurrent: boolean;
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
