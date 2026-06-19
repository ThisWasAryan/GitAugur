import { create } from 'zustand';

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
  inspectEntity: (type, id) => set({ activeInspector: type, inspectedEntityId: id }),
  showStaging: () => set({ activeInspector: 'staging', inspectedEntityId: null }),
}));
