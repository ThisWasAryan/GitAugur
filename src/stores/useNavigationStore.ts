import { create } from 'zustand';

export type ViewType = 'History' | 'Files' | 'Branches' | 'Tags' | 'Pull Requests' | 'Contributors' | 'Releases';
export type GraphMode = 'GIT_GRAPH' | 'REPO_FLOW' | 'TIMELINE';

interface NavigationStore {
  activeView: ViewType;
  graphMode: GraphMode;
  setActiveView: (view: ViewType) => void;
  setGraphMode: (mode: GraphMode) => void;
}

export const useNavigationStore = create<NavigationStore>((set) => ({
  activeView: 'History',
  graphMode: 'GIT_GRAPH',
  setActiveView: (view) => set({ activeView: view }),
  setGraphMode: (mode) => set({ graphMode: mode }),
}));
