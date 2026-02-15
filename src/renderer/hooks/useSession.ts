import { useCallback } from 'react'
import { useSessionsStore } from '../stores/sessions'
import type { SessionListItem, SessionWithDiagrams } from '@shared/types/session'
import { createRendererLogger } from '../lib/logger'

const logger = createRendererLogger('useSession')

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
    logger.debug('Loading sessions')
    setLoading(true)
    try {
      const list = window.api ? ((await window.api.listSessions()) as SessionListItem[]) : []
      logger.debug('Loaded %d sessions', list.length)
      setSessions(list)
    } catch (err) {
      logger.error('Failed to load sessions:', err)
    } finally {
      setLoading(false)
    }
  }, [setSessions, setLoading])

  const loadSession = useCallback(
    async (id: string) => {
      logger.debug('Loading session: %s', id)
      setLoading(true)
      try {
        const session = window.api
          ? ((await window.api.getSession(id)) as SessionWithDiagrams | null)
          : null
        setCurrentSession(session)
      } catch (err) {
        logger.error('Failed to load session %s:', id, err)
      } finally {
        setLoading(false)
      }
    },
    [setCurrentSession, setLoading]
  )

  const deleteSession = useCallback(async (id: string) => {
    logger.debug('Deleting session: %s', id)
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
