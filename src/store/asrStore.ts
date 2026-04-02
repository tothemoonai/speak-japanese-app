import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ASRMode = 'cloud' | 'local';

interface ASRStoreState {
  asrMode: ASRMode;
  localModelType: 'int8' | 'fp32';
  setASRMode: (mode: ASRMode) => void;
  setLocalModelType: (type: 'int8' | 'fp32') => void;
}

export const useASRStore = create<ASRStoreState>()(
  persist(
    (set) => ({
      asrMode: 'cloud',
      localModelType: 'int8',
      setASRMode: (mode) => set({ asrMode: mode }),
      setLocalModelType: (type) => set({ localModelType: type }),
    }),
    {
      name: 'asr-settings',
      partialize: (state) => ({
        asrMode: state.asrMode,
        localModelType: state.localModelType,
      }),
    }
  )
);
