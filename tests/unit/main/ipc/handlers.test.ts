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
import { createSession, listSessions, deleteSession } from '../../../../src/main/storage/sessions'
import { getSettings } from '../../../../src/main/storage/settings'

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
      handlers[IpcChannel.SESSION_DELETE]({}, 'test-id')
      expect(deleteSession).toHaveBeenCalledWith('test-id')
    })
  })

  describe('SESSION_EXPORT', () => {
    it('returns null for nonexistent session', () => {
      const result = handlers[IpcChannel.SESSION_EXPORT]({}, 'nonexistent', 'text')
      expect(result).toBeNull()
    })
  })
})
