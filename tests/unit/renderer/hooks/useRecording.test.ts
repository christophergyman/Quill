import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRecordingStore } from '../../../../src/renderer/stores/recording'

// Capture IPC subscription callbacks
let recordingStateCallback: (state: string, sessionId?: string) => void
let transcriptionPartialCallback: (text: string) => void
let transcriptionCompleteCallback: (result: unknown) => void
let transcriptionErrorCallback: (error: string) => void

const cleanupState = vi.fn()
const cleanupPartial = vi.fn()
const cleanupComplete = vi.fn()
const cleanupError = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  useRecordingStore.getState().reset()

  // Re-wire mock subscriptions to capture callbacks
  ;(window.api!.onRecordingStateChanged as ReturnType<typeof vi.fn>).mockImplementation(
    (cb: typeof recordingStateCallback) => {
      recordingStateCallback = cb
      return cleanupState
    }
  )
  ;(window.api!.onTranscriptionPartial as ReturnType<typeof vi.fn>).mockImplementation(
    (cb: typeof transcriptionPartialCallback) => {
      transcriptionPartialCallback = cb
      return cleanupPartial
    }
  )
  ;(window.api!.onTranscriptionComplete as ReturnType<typeof vi.fn>).mockImplementation(
    (cb: typeof transcriptionCompleteCallback) => {
      transcriptionCompleteCallback = cb
      return cleanupComplete
    }
  )
  ;(window.api!.onTranscriptionError as ReturnType<typeof vi.fn>).mockImplementation(
    (cb: typeof transcriptionErrorCallback) => {
      transcriptionErrorCallback = cb
      return cleanupError
    }
  )
})

// Must import hook AFTER mocks are set up
import { useRecording } from '../../../../src/renderer/hooks/useRecording'

describe('useRecording', () => {
  it('returns the correct shape', () => {
    const { result } = renderHook(() => useRecording())
    expect(result.current).toHaveProperty('state')
    expect(result.current).toHaveProperty('partialText')
    expect(result.current).toHaveProperty('finalText')
    expect(typeof result.current.startRecording).toBe('function')
    expect(typeof result.current.stopRecording).toBe('function')
    expect(typeof result.current.reset).toBe('function')
  })

  it('subscribes to IPC events on mount', () => {
    renderHook(() => useRecording())
    expect(window.api!.onRecordingStateChanged).toHaveBeenCalled()
    expect(window.api!.onTranscriptionPartial).toHaveBeenCalled()
    expect(window.api!.onTranscriptionComplete).toHaveBeenCalled()
    expect(window.api!.onTranscriptionError).toHaveBeenCalled()
  })

  it('cleans up all IPC listeners on unmount', () => {
    const { unmount } = renderHook(() => useRecording())
    unmount()
    expect(cleanupState).toHaveBeenCalled()
    expect(cleanupPartial).toHaveBeenCalled()
    expect(cleanupComplete).toHaveBeenCalled()
    expect(cleanupError).toHaveBeenCalled()
  })

  it('updates state on recording state changed event', () => {
    const { result } = renderHook(() => useRecording())

    act(() => {
      recordingStateCallback('recording')
    })
    expect(result.current.state).toBe('recording')

    act(() => {
      recordingStateCallback('processing')
    })
    expect(result.current.state).toBe('processing')
  })

  it('updates partialText on transcription partial event', () => {
    const { result } = renderHook(() => useRecording())

    act(() => {
      transcriptionPartialCallback('hello')
    })
    expect(result.current.partialText).toBe('hello')
  })

  it('updates finalText on transcription complete event', () => {
    const { result } = renderHook(() => useRecording())

    act(() => {
      transcriptionCompleteCallback({
        sessionId: 's-1',
        rawText: 'raw text',
        cleanedText: 'cleaned text',
        durationMs: 1000
      })
    })
    expect(result.current.finalText).toBe('cleaned text')
  })

  it('uses rawText when cleanedText is missing', () => {
    const { result } = renderHook(() => useRecording())

    act(() => {
      transcriptionCompleteCallback({
        sessionId: 's-1',
        rawText: 'raw text only',
        durationMs: 1000
      })
    })
    expect(result.current.finalText).toBe('raw text only')
  })

  it('sets state to error on transcription error event', () => {
    const { result } = renderHook(() => useRecording())

    act(() => {
      transcriptionErrorCallback('something failed')
    })
    expect(result.current.state).toBe('error')
  })

  it('stopRecording sets state to processing and calls window.api.stopRecording', async () => {
    const { result } = renderHook(() => useRecording())

    await act(async () => {
      await result.current.stopRecording()
    })

    expect(result.current.state).toBe('processing')
    expect(window.api!.stopRecording).toHaveBeenCalled()
  })

  it('startRecording catches errors and sets state to error', async () => {
    // getUserMedia will throw in jsdom - no need to mock
    const { result } = renderHook(() => useRecording())

    await act(async () => {
      await result.current.startRecording()
    })

    // Should be error since getUserMedia is not available in jsdom
    expect(result.current.state).toBe('error')
  })

  it('reset returns to idle state', () => {
    const { result } = renderHook(() => useRecording())

    act(() => {
      recordingStateCallback('recording')
    })
    expect(result.current.state).toBe('recording')

    act(() => {
      result.current.reset()
    })
    expect(result.current.state).toBe('idle')
    expect(result.current.partialText).toBe('')
    expect(result.current.finalText).toBe('')
  })
})
