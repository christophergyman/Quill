import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSession } from '../../../../src/renderer/hooks/useSession'
import { useSessionsStore } from '../../../../src/renderer/stores/sessions'

const mockSessions = [
  {
    id: 's-1',
    createdAt: '2025-01-01T00:00:00.000Z',
    title: 'Session 1',
    rawText: 'Hello world',
    durationMs: 5000,
    hasDiagram: false
  },
  {
    id: 's-2',
    createdAt: '2025-01-02T00:00:00.000Z',
    title: 'Session 2',
    rawText: 'Another session',
    durationMs: 3000,
    hasDiagram: true
  }
]

const mockSessionWithDiagrams = {
  id: 's-1',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  title: 'Session 1',
  rawText: 'Hello world',
  cleanedText: 'Hello, world.',
  summary: null,
  durationMs: 5000,
  voiceBackend: 'whisper-cloud' as const,
  llmEnabled: false,
  language: 'en',
  metadata: null,
  diagrams: []
}

beforeEach(() => {
  vi.clearAllMocks()
  useSessionsStore.setState({
    sessions: [],
    currentSession: null,
    searchQuery: '',
    loading: false
  })
})

describe('useSession', () => {
  it('returns the correct shape', () => {
    const { result } = renderHook(() => useSession())
    expect(result.current).toHaveProperty('sessions')
    expect(result.current).toHaveProperty('currentSession')
    expect(result.current).toHaveProperty('searchQuery')
    expect(result.current).toHaveProperty('loading')
    expect(typeof result.current.setSearchQuery).toBe('function')
    expect(typeof result.current.loadSessions).toBe('function')
    expect(typeof result.current.loadSession).toBe('function')
    expect(typeof result.current.deleteSession).toBe('function')
  })

  it('loadSessions calls window.api.listSessions and updates store', async () => {
    ;(window.api!.listSessions as ReturnType<typeof vi.fn>).mockResolvedValue(mockSessions)

    const { result } = renderHook(() => useSession())

    await act(async () => {
      await result.current.loadSessions()
    })

    expect(window.api!.listSessions).toHaveBeenCalled()
    expect(result.current.sessions).toEqual(mockSessions)
    expect(result.current.loading).toBe(false)
  })

  it('loadSession calls window.api.getSession and sets current session', async () => {
    ;(window.api!.getSession as ReturnType<typeof vi.fn>).mockResolvedValue(mockSessionWithDiagrams)

    const { result } = renderHook(() => useSession())

    await act(async () => {
      await result.current.loadSession('s-1')
    })

    expect(window.api!.getSession).toHaveBeenCalledWith('s-1')
    expect(result.current.currentSession).toEqual(mockSessionWithDiagrams)
    expect(result.current.loading).toBe(false)
  })

  it('deleteSession calls window.api.deleteSession and removes from store', async () => {
    // Pre-fill store with sessions
    useSessionsStore.setState({ sessions: mockSessions })

    const { result } = renderHook(() => useSession())

    await act(async () => {
      await result.current.deleteSession('s-1')
    })

    expect(window.api!.deleteSession).toHaveBeenCalledWith('s-1')
    expect(result.current.sessions).toHaveLength(1)
    expect(result.current.sessions[0].id).toBe('s-2')
  })

  it('deleteSession clears currentSession if it matches deleted id', async () => {
    useSessionsStore.setState({
      sessions: mockSessions,
      currentSession: mockSessionWithDiagrams
    })

    const { result } = renderHook(() => useSession())

    await act(async () => {
      await result.current.deleteSession('s-1')
    })

    expect(result.current.currentSession).toBeNull()
  })

  it('sets loading state during loadSessions', async () => {
    let resolvePromise: (value: unknown[]) => void
    ;(window.api!.listSessions as ReturnType<typeof vi.fn>).mockReturnValue(
      new Promise((resolve) => {
        resolvePromise = resolve
      })
    )

    const { result } = renderHook(() => useSession())

    let loadPromise: Promise<void>
    act(() => {
      loadPromise = result.current.loadSessions()
    })

    expect(result.current.loading).toBe(true)

    await act(async () => {
      resolvePromise!([])
      await loadPromise!
    })

    expect(result.current.loading).toBe(false)
  })

  it('handles missing window.api gracefully', async () => {
    const originalApi = window.api
    Object.defineProperty(window, 'api', { value: undefined, writable: true })

    const { result } = renderHook(() => useSession())

    await act(async () => {
      await result.current.loadSessions()
    })

    expect(result.current.sessions).toEqual([])

    // Restore
    Object.defineProperty(window, 'api', { value: originalApi, writable: true })
  })
})
