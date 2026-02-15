import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { BrowserWindow } from 'electron'

const mockWebContentsSend = vi.fn()

const mockWin = {
  webContents: {
    send: mockWebContentsSend
  }
} as unknown as BrowserWindow

vi.mock('electron', () => ({
  BrowserWindow: class {}
}))

import {
  emitRecordingStateChanged,
  emitTranscriptionPartial,
  emitTranscriptionComplete,
  emitTranscriptionError,
  emitOverlayVisibilityChanged
} from '../../../../src/main/ipc/events'
import { IpcChannel } from '../../../../src/shared/types/ipc'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('IPC Events', () => {
  describe('emitRecordingStateChanged', () => {
    it('sends on RECORDING_STATE_CHANGED channel', () => {
      emitRecordingStateChanged(mockWin, 'processing')
      expect(mockWebContentsSend).toHaveBeenCalledWith(
        IpcChannel.RECORDING_STATE_CHANGED,
        'processing',
        undefined
      )
    })

    it('includes sessionId when provided', () => {
      emitRecordingStateChanged(mockWin, 'complete', 'session-1')
      expect(mockWebContentsSend).toHaveBeenCalledWith(
        IpcChannel.RECORDING_STATE_CHANGED,
        'complete',
        'session-1'
      )
    })
  })

  describe('emitTranscriptionPartial', () => {
    it('sends text on TRANSCRIPTION_PARTIAL channel', () => {
      emitTranscriptionPartial(mockWin, 'hello world')
      expect(mockWebContentsSend).toHaveBeenCalledWith(
        IpcChannel.TRANSCRIPTION_PARTIAL,
        'hello world'
      )
    })
  })

  describe('emitTranscriptionComplete', () => {
    it('sends full result object', () => {
      const result = {
        sessionId: 'session-1',
        rawText: 'Hello',
        cleanedText: 'Hello.',
        summary: 'A greeting',
        durationMs: 2000
      }
      emitTranscriptionComplete(mockWin, result)
      expect(mockWebContentsSend).toHaveBeenCalledWith(IpcChannel.TRANSCRIPTION_COMPLETE, result)
    })
  })

  describe('emitTranscriptionError', () => {
    it('sends error string', () => {
      emitTranscriptionError(mockWin, 'Transcription failed')
      expect(mockWebContentsSend).toHaveBeenCalledWith(
        IpcChannel.TRANSCRIPTION_ERROR,
        'Transcription failed'
      )
    })
  })

  describe('emitOverlayVisibilityChanged', () => {
    it('sends boolean visibility', () => {
      emitOverlayVisibilityChanged(mockWin, true)
      expect(mockWebContentsSend).toHaveBeenCalledWith(IpcChannel.OVERLAY_VISIBILITY_CHANGED, true)
    })

    it('sends false for hidden', () => {
      emitOverlayVisibilityChanged(mockWin, false)
      expect(mockWebContentsSend).toHaveBeenCalledWith(IpcChannel.OVERLAY_VISIBILITY_CHANGED, false)
    })
  })
})
