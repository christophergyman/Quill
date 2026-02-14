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
    const list = (await window.api.listSessions()) as SessionListItem[]
    setSessions(list)
    setLoading(false)
  }, [setSessions, setLoading])

  const loadSession = useCallback(
    async (id: string) => {
      setLoading(true)
      const session = (await window.api.getSession(id)) as SessionWithDiagrams | null
      setCurrentSession(session)
      setLoading(false)
    },
    [setCurrentSession, setLoading]
  )

  const deleteSession = useCallback(
    async (id: string) => {
      await window.api.deleteSession(id)
      setSessions(sessions.filter((s) => s.id !== id))
      if (currentSession?.id === id) setCurrentSession(null)
    },
    [sessions, currentSession, setSessions, setCurrentSession]
  )

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
