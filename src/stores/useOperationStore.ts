import { create } from 'zustand';
import { listen } from '@tauri-apps/api/event';

export interface GitOperation {
  id: string;
  action: string;
  command: string;
  status: 'Completed' | 'Failed' | 'Running';
  duration_ms: number;
  stdout: string;
  stderr: string;
  timestamp: number;
}

interface OperationState {
  operations: GitOperation[];
  isPanelOpen: boolean;
  activeTab: 'Log' | 'Terminal';
  addOperation: (op: Omit<GitOperation, 'id' | 'timestamp'>) => void;
  clearOperations: () => void;
  togglePanel: () => void;
  setActiveTab: (tab: 'Log' | 'Terminal') => void;
}

export const useOperationStore = create<OperationState>((set) => ({
  operations: [],
  isPanelOpen: false,
  activeTab: 'Log',
  
  addOperation: (op) => set((state) => ({
    operations: [{
      ...op,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    }, ...state.operations].slice(0, 500) // Keep last 500
  })),

  clearOperations: () => set({ operations: [] }),
  togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
  setActiveTab: (tab) => set({ activeTab: tab })
}));

// Setup Tauri event listener
let listenerSetup = false;
export const setupGitOperationListener = async () => {
  if (listenerSetup) return;
  listenerSetup = true;

  await listen<Omit<GitOperation, 'id' | 'timestamp'>>('git-operation', (event) => {
    useOperationStore.getState().addOperation(event.payload);
  });
};
