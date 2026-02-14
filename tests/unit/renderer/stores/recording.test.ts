import { describe, it, expect, beforeEach } from 'vitest'
import { useRecordingStore } from '../../../../src/renderer/stores/recording'

describe('useRecordingStore', () => {
  beforeEach(() => {
    useRecordingStore.getState().reset()
  })

  it('starts in idle state', () => {
    const state = useRecordingStore.getState()
    expect(state.state).toBe('idle')
    expect(state.sessionId).toBeNull()
    expect(state.partialText).toBe('')
    expect(state.finalText).toBe('')
  })

  it('updates recording state', () => {
    useRecordingStore.getState().setState('recording', 'session-1')
    const state = useRecordingStore.getState()
    expect(state.state).toBe('recording')
    expect(state.sessionId).toBe('session-1')
  })

  it('updates partial text', () => {
    useRecordingStore.getState().setPartialText('hello world')
    expect(useRecordingStore.getState().partialText).toBe('hello world')
  })

  it('updates final text', () => {
    useRecordingStore.getState().setFinalText('Hello, world.')
    expect(useRecordingStore.getState().finalText).toBe('Hello, world.')
  })

  it('resets all state', () => {
    useRecordingStore.getState().setState('recording', 'session-1')
    useRecordingStore.getState().setPartialText('test')
    useRecordingStore.getState().setFinalText('Test.')
    useRecordingStore.getState().reset()

    const state = useRecordingStore.getState()
    expect(state.state).toBe('idle')
    expect(state.sessionId).toBeNull()
    expect(state.partialText).toBe('')
    expect(state.finalText).toBe('')
  })
})
