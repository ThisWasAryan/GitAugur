import { create } from 'zustand';
import { useLayoutStore } from './useLayoutStore';

export type InspectorType = 'staging' | 'commit' | 'branch' | 'pr' | 'release' | 'file';

interface InspectorStore {
  activeInspector: InspectorType;
  inspectedEntityId: string | null;
  inspectEntity: (type: InspectorType, id: string | null) => void;
  showStaging: () => void;
}

export const useInspectorStore = create<InspectorStore>((set) => ({
  activeInspector: 'staging',
  inspectedEntityId: null,
  inspectEntity: (type, id) => {
    set({ activeInspector: type, inspectedEntityId: id });
    useLayoutStore.getState().setRightSidebarOpen(true);
  },
  showStaging: () => {
    set({ activeInspector: 'staging', inspectedEntityId: null });
  },
}));
