import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UiMode = 'beginner' | 'advanced';

interface SettingsState {
  uiMode: UiMode;
  cryptographicVerification: boolean;
  gpgKeyId: string;
  customBranchColors: Record<string, number>;
  setUiMode: (mode: UiMode) => void;
  setCryptographicVerification: (enabled: boolean) => void;
  setGpgKeyId: (keyId: string) => void;
  setCustomBranchColor: (branchName: string, colorIndex: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      uiMode: 'beginner', // Let's default to beginner as requested by general tone
      cryptographicVerification: false,
      gpgKeyId: '',
      customBranchColors: {},
      setUiMode: (mode) => set({ uiMode: mode }),
      setCryptographicVerification: (enabled) => set({ cryptographicVerification: enabled }),
      setGpgKeyId: (keyId) => set({ gpgKeyId: keyId }),
      setCustomBranchColor: (branchName, colorIndex) => 
        set((state) => ({ customBranchColors: { ...state.customBranchColors, [branchName]: colorIndex } })),
    }),
    {
      name: 'settings-storage',
    }
  )
);
