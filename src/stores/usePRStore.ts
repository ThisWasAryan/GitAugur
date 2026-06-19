import { create } from 'zustand';

export interface PullRequest {
  id: string;
  title: string;
  author: string;
  status: 'OPEN' | 'MERGED' | 'CLOSED';
  branch: string;
  reviews: 'APPROVED' | 'CHANGES_REQUESTED' | 'PENDING';
}

interface PRStore {
  pullRequests: PullRequest[];
}

export const usePRStore = create<PRStore>(() => ({
  pullRequests: [
    {
      id: 'PR-12',
      title: 'Update graph routing algorithm',
      author: 'alice',
      status: 'OPEN',
      branch: 'feature/graph-rework',
      reviews: 'APPROVED'
    },
    {
      id: 'PR-14',
      title: 'Add staging UI',
      author: 'bob',
      status: 'OPEN',
      branch: 'feature/staging',
      reviews: 'PENDING'
    }
  ]
}));
