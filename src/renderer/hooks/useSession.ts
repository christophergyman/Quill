import { useCallback } from 'react'
import { useSessionsStore } from '../stores/sessions'
import type { SessionListItem, SessionWithDiagrams } from '@shared/types/session'

export function useSession() {
  const {
    sessions,
    currentSession,
    searchQuery,
    loading,
    setSessions,
    setCurrentSession,
    setSearchQuery,
    setLoading
  } = useSessionsStore()

  const loadSessions = useCallback(async () => {
    setLoading(true)
    const list = window.api ? ((await window.api.listSessions()) as SessionListItem[]) : []
    setSessions(list)
    setLoading(false)
  }, [setSessions, setLoading])

  const loadSession = useCallback(
    async (id: string) => {
      setLoading(true)
      const session = window.api
        ? ((await window.api.getSession(id)) as SessionWithDiagrams | null)
        : null
      setCurrentSession(session)
      setLoading(false)
    },
    [setCurrentSession, setLoading]
  )

  const deleteSession = useCallback(async (id: string) => {
    await window.api?.deleteSession(id)
    // Use store setState to avoid stale closure over sessions/currentSession
    useSessionsStore.setState((state) => ({
      sessions: state.sessions.filter((s) => s.id !== id),
      currentSession: state.currentSession?.id === id ? null : state.currentSession
    }))
  }, [])

  return {
    sessions,
    currentSession,
    searchQuery,
    loading,
    setSearchQuery,
    loadSessions,
    loadSession,
    deleteSession
  }
}
