import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UiMode = 'beginner' | 'advanced';

interface SettingsState {
  uiMode: UiMode;
  cryptographicVerification: boolean;
  gpgKeyId: string;
  setUiMode: (mode: UiMode) => void;
  setCryptographicVerification: (enabled: boolean) => void;
  setGpgKeyId: (keyId: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      uiMode: 'beginner', // Let's default to beginner as requested by general tone
      cryptographicVerification: false,
      gpgKeyId: '',
      setUiMode: (mode) => set({ uiMode: mode }),
      setCryptographicVerification: (enabled) => set({ cryptographicVerification: enabled }),
      setGpgKeyId: (keyId) => set({ gpgKeyId: keyId }),
    }),
    {
      name: 'settings-storage',
    }
  )
);
