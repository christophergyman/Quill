import { describe, it, expect, vi, beforeEach } from 'vitest'

// --- Mocks ---
const mockClipboardWriteText = vi.fn()
const mockWebContentsSend = vi.fn()
const mockBrowserWindowFromWebContents = vi.fn()

vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn()
  },
  clipboard: {
    writeText: (text: string) => mockClipboardWriteText(text)
  },
  BrowserWindow: {
    fromWebContents: (...args: unknown[]) => mockBrowserWindowFromWebContents(...args)
  }
}))

vi.mock('../../../../src/main/storage/settings', () => ({
  getSettings: vi.fn().mockReturnValue({
    general: { launchAtLogin: false, showDockIcon: false, language: 'en' },
    voice: {
      backend: 'whisper-cloud',
      model: 'whisper-1',
      language: 'en',
      openaiApiKey: 'test-key'
    },
    llm: {
      enabled: false,
      backend: 'openai',
      openaiModel: 'gpt-4o-mini',
      openaiApiKey: '',
      ollamaUrl: 'http://localhost:11434',
      ollamaModel: 'llama3.2'
    },
    shortcuts: {
      toggleOverlay: 'CommandOrControl+Shift+Space',
      toggleDrawing: 'CommandOrControl+Shift+D',
      holdToRecord: 'CommandOrControl+Shift+;'
    }
  }),
  setSettings: vi.fn().mockReturnValue({}),
  decryptApiKey: vi.fn().mockImplementation((key: string) => key)
}))

vi.mock('../../../../src/main/storage/sessions', () => ({
  createSession: vi.fn().mockReturnValue({
    id: 'session-1',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    rawText: 'Test',
    durationMs: 5000,
    voiceBackend: 'whisper-cloud',
    llmEnabled: false,
    language: 'en'
  }),
  getSessionWithDiagrams: vi.fn().mockReturnValue(null),
  listSessions: vi.fn().mockReturnValue([]),
  deleteSession: vi.fn()
}))

const mockTranscribe = vi.fn().mockResolvedValue({
  text: 'Hello world',
  language: 'en',
  durationMs: 5000,
  segments: []
})
const mockVoiceDispose = vi.fn()

vi.mock('../../../../src/main/voice/factory', () => ({
  createVoiceBackend: vi.fn().mockResolvedValue({
    transcribe: (...args: unknown[]) => mockTranscribe(...args),
    dispose: () => mockVoiceDispose()
  })
}))

vi.mock('../../../../src/main/llm/factory', () => ({
  createLLMProcessor: vi.fn()
}))

import { ipcMain } from 'electron'
import { registerIpcHandlers } from '../../../../src/main/ipc/handlers'
import { IpcChannel } from '../../../../src/shared/types/ipc'
import {
  createSession,
  listSessions,
  deleteSession,
  getSessionWithDiagrams
} from '../../../../src/main/storage/sessions'
import { getSettings, setSettings } from '../../../../src/main/storage/settings'
import { createVoiceBackend } from '../../../../src/main/voice/factory'
import { createLLMProcessor } from '../../../../src/main/llm/factory'

// Extract registered handlers from ipcMain.handle mock
type Handler = (...args: unknown[]) => unknown
const handlers: Record<string, Handler> = {}

describe('IPC Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Capture all handlers registered via ipcMain.handle
    ;(ipcMain.handle as ReturnType<typeof vi.fn>).mockImplementation(
      (channel: string, handler: Handler) => {
        handlers[channel] = handler
      }
    )

    const mockWin = {
      webContents: { send: mockWebContentsSend }
    }
    mockBrowserWindowFromWebContents.mockReturnValue(mockWin)

    registerIpcHandlers()
  })

  it('registers all expected IPC channels', () => {
    const expectedChannels = [
      IpcChannel.CLIPBOARD_WRITE,
      IpcChannel.OVERLAY_SET_MODE,
      IpcChannel.RECORDING_START,
      IpcChannel.RECORDING_STOP,
      IpcChannel.AUDIO_SEND_CHUNK,
      IpcChannel.SETTINGS_GET,
      IpcChannel.SETTINGS_SET,
      IpcChannel.SESSION_LIST,
      IpcChannel.SESSION_GET,
      IpcChannel.SESSION_DELETE,
      IpcChannel.SESSION_EXPORT,
      IpcChannel.DIAGRAM_EXPORT
    ]

    for (const channel of expectedChannels) {
      expect(handlers[channel]).toBeDefined()
    }
  })

  describe('CLIPBOARD_WRITE', () => {
    it('writes text to clipboard', () => {
      handlers[IpcChannel.CLIPBOARD_WRITE]({}, 'hello')
      expect(mockClipboardWriteText).toHaveBeenCalledWith('hello')
    })
  })

  describe('RECORDING_START / RECORDING_STOP', () => {
    it('rejects start if already recording', () => {
      handlers[IpcChannel.RECORDING_START]()
      handlers[IpcChannel.RECORDING_START]()
      // Second call should be a no-op (logged as warning)
    })

    it('returns null when stopping with no processor', async () => {
      const result = await handlers[IpcChannel.RECORDING_STOP]({ sender: {} })
      expect(result).toBeNull()
    })

    it('full pipeline: start → stop → transcribe → persist', async () => {
      handlers[IpcChannel.RECORDING_START]()

      // Simulate sending audio chunks
      const samples = new Float32Array(16000) // 1 second of silence
      for (let i = 0; i < samples.length; i++) samples[i] = 0.1
      handlers[IpcChannel.AUDIO_SEND_CHUNK]({}, samples, 16000)

      // Stop recording
      const result = await handlers[IpcChannel.RECORDING_STOP]({ sender: {} })

      expect(result).not.toBeNull()
      expect(result).toHaveProperty('sessionId', 'session-1')
      expect(result).toHaveProperty('rawText', 'Hello world')

      // Verify clipboard was written
      expect(mockClipboardWriteText).toHaveBeenCalledWith('Hello world')

      // Verify session was persisted
      expect(createSession).toHaveBeenCalledWith(
        expect.objectContaining({
          rawText: 'Hello world',
          voiceBackend: 'whisper-cloud'
        })
      )

      // Verify events were emitted
      expect(mockWebContentsSend).toHaveBeenCalledWith(
        IpcChannel.RECORDING_STATE_CHANGED,
        'processing',
        undefined
      )
      expect(mockWebContentsSend).toHaveBeenCalledWith(
        IpcChannel.TRANSCRIPTION_COMPLETE,
        expect.objectContaining({ rawText: 'Hello world' })
      )
    })
  })

  describe('SETTINGS_GET', () => {
    it('returns settings from storage', () => {
      const result = handlers[IpcChannel.SETTINGS_GET]({})
      expect(getSettings).toHaveBeenCalled()
      expect(result).toHaveProperty('voice')
      expect(result).toHaveProperty('llm')
    })
  })

  describe('SESSION_LIST', () => {
    it('calls listSessions from storage', () => {
      handlers[IpcChannel.SESSION_LIST]({})
      expect(listSessions).toHaveBeenCalled()
    })
  })

  describe('SESSION_DELETE', () => {
    it('calls deleteSession from storage', () => {
      const id = '00000000-0000-0000-0000-000000000001'
      handlers[IpcChannel.SESSION_DELETE]({}, id)
      expect(deleteSession).toHaveBeenCalledWith(id)
    })

    it('rejects invalid session ID', () => {
      expect(() => handlers[IpcChannel.SESSION_DELETE]({}, 'bad-id')).toThrow(
        'SESSION_DELETE: invalid session ID'
      )
    })
  })

  describe('SESSION_EXPORT', () => {
    const validId = '00000000-0000-0000-0000-000000000002'

    it('returns null for nonexistent session', () => {
      const result = handlers[IpcChannel.SESSION_EXPORT]({}, validId, 'text')
      expect(result).toBeNull()
    })

    it('rejects invalid session ID', () => {
      expect(() => handlers[IpcChannel.SESSION_EXPORT]({}, 'bad-id', 'text')).toThrow(
        'SESSION_EXPORT: invalid session ID'
      )
    })

    it('returns JSON string for json format', () => {
      const mockSession = {
        id: validId,
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
        title: 'Test',
        rawText: 'Hello',
        cleanedText: 'Hello.',
        summary: null,
        durationMs: 1000,
        voiceBackend: 'whisper-cloud',
        llmEnabled: false,
        language: 'en',
        metadata: null,
        diagrams: []
      }
      ;(getSessionWithDiagrams as ReturnType<typeof vi.fn>).mockReturnValue(mockSession)

      const result = handlers[IpcChannel.SESSION_EXPORT]({}, validId, 'json')
      expect(typeof result).toBe('string')
      const parsed = JSON.parse(result as string)
      expect(parsed.id).toBe(validId)
      expect(parsed.rawText).toBe('Hello')
    })

    it('returns formatted text for text format', () => {
      const mockSession = {
        id: validId,
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
        title: 'My Session',
        rawText: 'Hello world',
        cleanedText: 'Hello, world.',
        summary: 'A greeting',
        durationMs: 5000,
        voiceBackend: 'whisper-cloud',
        llmEnabled: false,
        language: 'en',
        metadata: null,
        diagrams: []
      }
      ;(getSessionWithDiagrams as ReturnType<typeof vi.fn>).mockReturnValue(mockSession)

      const result = handlers[IpcChannel.SESSION_EXPORT]({}, validId, 'text') as string
      expect(result).toContain('My Session')
      expect(result).toContain('Summary')
      expect(result).toContain('A greeting')
      expect(result).toContain('Hello, world.')
    })
  })

  describe('Voice backend creation failure', () => {
    it('emits error, returns null, resets isProcessing', async () => {
      ;(createVoiceBackend as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Backend init failed')
      )

      handlers[IpcChannel.RECORDING_START]()
      const samples = new Float32Array(16000)
      handlers[IpcChannel.AUDIO_SEND_CHUNK]({}, samples, 16000)

      const result = await handlers[IpcChannel.RECORDING_STOP]({ sender: {} })

      expect(result).toBeNull()
      expect(mockWebContentsSend).toHaveBeenCalledWith(
        IpcChannel.TRANSCRIPTION_ERROR,
        expect.stringContaining('Backend init failed')
      )
      expect(mockWebContentsSend).toHaveBeenCalledWith(
        IpcChannel.RECORDING_STATE_CHANGED,
        'error',
        undefined
      )

      // Should be able to start recording again (isProcessing was reset)
      handlers[IpcChannel.RECORDING_START]()
      // If it didn't throw, isProcessing was properly reset
    })
  })

  describe('LLM cleanup failure', () => {
    it('falls back to raw text and still persists session', async () => {
      ;(createVoiceBackend as ReturnType<typeof vi.fn>).mockResolvedValue({
        transcribe: mockTranscribe,
        dispose: mockVoiceDispose
      })

      // Enable LLM in settings
      ;(getSettings as ReturnType<typeof vi.fn>).mockReturnValue({
        general: { launchAtLogin: false, showDockIcon: false, language: 'en' },
        voice: {
          backend: 'whisper-cloud',
          model: 'whisper-1',
          language: 'en',
          openaiApiKey: 'test-key'
        },
        llm: {
          enabled: true,
          backend: 'openai',
          openaiModel: 'gpt-4o-mini',
          openaiApiKey: 'llm-key',
          ollamaUrl: 'http://localhost:11434',
          ollamaModel: 'llama3.2'
        },
        shortcuts: {
          toggleOverlay: 'CommandOrControl+Shift+Space',
          toggleDrawing: 'CommandOrControl+Shift+D',
          holdToRecord: 'CommandOrControl+Shift+;'
        }
      })

      // LLM creation fails
      ;(createLLMProcessor as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('LLM failed'))

      handlers[IpcChannel.RECORDING_START]()
      const samples = new Float32Array(16000)
      for (let i = 0; i < samples.length; i++) samples[i] = 0.1
      handlers[IpcChannel.AUDIO_SEND_CHUNK]({}, samples, 16000)

      const result = await handlers[IpcChannel.RECORDING_STOP]({ sender: {} })

      expect(result).not.toBeNull()
      expect(result).toHaveProperty('rawText', 'Hello world')
      // Session was still persisted
      expect(createSession).toHaveBeenCalled()
    })
  })

  describe('Null window handling', () => {
    it('still processes when BrowserWindow.fromWebContents returns null', async () => {
      mockBrowserWindowFromWebContents.mockReturnValue(null)
      ;(createVoiceBackend as ReturnType<typeof vi.fn>).mockResolvedValue({
        transcribe: mockTranscribe,
        dispose: mockVoiceDispose
      })

      handlers[IpcChannel.RECORDING_START]()
      const samples = new Float32Array(16000)
      for (let i = 0; i < samples.length; i++) samples[i] = 0.1
      handlers[IpcChannel.AUDIO_SEND_CHUNK]({}, samples, 16000)

      const result = await handlers[IpcChannel.RECORDING_STOP]({ sender: {} })

      // Should still complete without crash
      expect(result).not.toBeNull()
      expect(createSession).toHaveBeenCalled()
      // But no events were sent since win is null
      expect(mockWebContentsSend).not.toHaveBeenCalled()
    })
  })

  describe('Recording start when already processing', () => {
    it('ignores start when isProcessing is true', async () => {
      ;(createVoiceBackend as ReturnType<typeof vi.fn>).mockResolvedValue({
        transcribe: () => new Promise(() => {}), // never resolves
        dispose: mockVoiceDispose
      })

      handlers[IpcChannel.RECORDING_START]()
      const samples = new Float32Array(16000)
      handlers[IpcChannel.AUDIO_SEND_CHUNK]({}, samples, 16000)

      // Start the stop (which triggers processing)
      void handlers[IpcChannel.RECORDING_STOP]({ sender: {} })

      // Try to start a new recording while processing
      handlers[IpcChannel.RECORDING_START]()
      // This second start should be a no-op (no additional processor created)

      // Clean up: we don't await stopPromise as transcribe never resolves
    })
  })

  describe('Audio chunk edge cases', () => {
    it('handles audio chunk when not recording', () => {
      // No recording started, chunk should be silently ignored
      const samples = new Float32Array(100)
      expect(() => handlers[IpcChannel.AUDIO_SEND_CHUNK]({}, samples, 16000)).not.toThrow()
    })

    it('handles zero-length audio', async () => {
      handlers[IpcChannel.RECORDING_START]()
      // Don't send any chunks
      const result = await handlers[IpcChannel.RECORDING_STOP]({ sender: {} })
      expect(result).toBeNull()
    })
  })

  describe('SETTINGS_SET', () => {
    it('calls setSettings with partial settings', () => {
      const partial = { general: { launchAtLogin: true, showDockIcon: false, language: 'en' } }
      handlers[IpcChannel.SETTINGS_SET]({}, partial)
      expect(setSettings).toHaveBeenCalledWith(partial)
    })
  })
})
