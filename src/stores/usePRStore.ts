import { create } from 'zustand';

export interface PullRequest {
  id: string;
  title: string;
  author: string;
  status: 'OPEN' | 'MERGED' | 'CLOSED';
  sourceBranch: string;
  targetBranch: string;
  reviews: 'APPROVED' | 'CHANGES_REQUESTED' | 'PENDING';
}

interface PRStore {
  pullRequests: PullRequest[];
}

export const usePRStore = create<PRStore>(() => ({
  pullRequests: [
    {
      id: 'PR-42',
      title: 'Implement Login System',
      author: 'Alice Dev',
      status: 'OPEN',
      sourceBranch: 'feature/login-system',
      targetBranch: 'main',
      reviews: 'APPROVED'
    },
    {
      id: 'PR-43',
      title: 'Fix Sidebar Overflow Issue',
      author: 'Bob Engineer',
      status: 'OPEN',
      sourceBranch: 'bugfix/sidebar-overflow',
      targetBranch: 'main',
      reviews: 'PENDING'
    }
  ]
}));
