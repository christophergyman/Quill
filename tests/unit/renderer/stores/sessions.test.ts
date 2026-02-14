import { describe, it, expect, beforeEach } from 'vitest'
import { useSessionsStore } from '../../../../src/renderer/stores/sessions'

describe('useSessionsStore', () => {
  beforeEach(() => {
    useSessionsStore.setState({
      sessions: [],
      currentSession: null,
      searchQuery: '',
      loading: false
    })
  })

  it('starts with empty sessions', () => {
    expect(useSessionsStore.getState().sessions).toEqual([])
  })

  it('starts with no current session', () => {
    expect(useSessionsStore.getState().currentSession).toBeNull()
  })

  it('updates sessions list', () => {
    const sessions = [
      {
        id: '1',
        createdAt: '2025-01-01',
        title: 'Test',
        rawText: 'Hello',
        durationMs: 5000,
        hasDiagram: false
      }
    ]
    useSessionsStore.getState().setSessions(sessions)
    expect(useSessionsStore.getState().sessions).toEqual(sessions)
  })

  it('updates search query', () => {
    useSessionsStore.getState().setSearchQuery('hello')
    expect(useSessionsStore.getState().searchQuery).toBe('hello')
  })

  it('tracks loading state', () => {
    useSessionsStore.getState().setLoading(true)
    expect(useSessionsStore.getState().loading).toBe(true)
  })
})
