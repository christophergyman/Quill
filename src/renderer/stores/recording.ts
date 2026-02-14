import { create } from 'zustand'
import type { RecordingState } from '@shared/types/ipc'

interface RecordingStore {
  state: RecordingState
  sessionId: string | null
  partialText: string
  finalText: string
  setState: (state: RecordingState, sessionId?: string) => void
  setPartialText: (text: string) => void
  setFinalText: (text: string) => void
  reset: () => void
}

export const useRecordingStore = create<RecordingStore>((set) => ({
  state: 'idle',
  sessionId: null,
  partialText: '',
  finalText: '',
  setState: (state, sessionId) => set({ state, sessionId }),
  setPartialText: (partialText) => set({ partialText }),
  setFinalText: (finalText) => set({ finalText }),
  reset: () => set({ state: 'idle', sessionId: null, partialText: '', finalText: '' })
}))
