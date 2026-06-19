import { create } from 'zustand';

export type UiMode = 'beginner' | 'advanced';

interface SettingsState {
  uiMode: UiMode;
  cryptographicVerification: boolean;
  gpgKeyId: string;
  setUiMode: (mode: UiMode) => void;
  setCryptographicVerification: (enabled: boolean) => void;
  setGpgKeyId: (keyId: string) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  uiMode: 'advanced', // Default to advanced for current users
  cryptographicVerification: false,
  gpgKeyId: '',
  setUiMode: (mode) => set({ uiMode: mode }),
  setCryptographicVerification: (enabled) => set({ cryptographicVerification: enabled }),
  setGpgKeyId: (keyId) => set({ gpgKeyId: keyId }),
}));
