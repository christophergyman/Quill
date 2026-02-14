import { create } from 'zustand'
import type { OverlayMode } from '@shared/types/ipc'

interface OverlayStore {
  mode: OverlayMode
  visible: boolean
  setMode: (mode: OverlayMode) => void
  setVisible: (visible: boolean) => void
}

export const useOverlayStore = create<OverlayStore>((set) => ({
  mode: 'passthrough',
  visible: false,
  setMode: (mode) => set({ mode }),
  setVisible: (visible) => set({ visible })
}))
