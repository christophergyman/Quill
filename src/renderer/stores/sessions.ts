import { create } from 'zustand'
import type { SessionListItem, SessionWithDiagrams } from '@shared/types/session'

interface SessionsStore {
  sessions: SessionListItem[]
  currentSession: SessionWithDiagrams | null
  searchQuery: string
  loading: boolean
  setSessions: (sessions: SessionListItem[]) => void
  setCurrentSession: (session: SessionWithDiagrams | null) => void
  setSearchQuery: (query: string) => void
  setLoading: (loading: boolean) => void
}

export const useSessionsStore = create<SessionsStore>((set) => ({
  sessions: [],
  currentSession: null,
  searchQuery: '',
  loading: false,
  setSessions: (sessions) => set({ sessions }),
  setCurrentSession: (currentSession) => set({ currentSession }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setLoading: (loading) => set({ loading })
}))
