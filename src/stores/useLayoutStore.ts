import { create } from 'zustand';

interface LayoutState {
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  createBranchModalOpen: boolean;
  createBranchModalBase: string | null;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  setLeftSidebarOpen: (open: boolean) => void;
  setRightSidebarOpen: (open: boolean) => void;
  setCreateBranchModal: (open: boolean, base?: string) => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  leftSidebarOpen: true,
  rightSidebarOpen: true,
  createBranchModalOpen: false,
  createBranchModalBase: null,
  toggleLeftSidebar: () => set((state) => ({ leftSidebarOpen: !state.leftSidebarOpen })),
  toggleRightSidebar: () => set((state) => ({ rightSidebarOpen: !state.rightSidebarOpen })),
  setLeftSidebarOpen: (open) => set({ leftSidebarOpen: open }),
  setRightSidebarOpen: (open) => set({ rightSidebarOpen: open }),
  setCreateBranchModal: (open, base) => set({ createBranchModalOpen: open, createBranchModalBase: base || null }),
}));
