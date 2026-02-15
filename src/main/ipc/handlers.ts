import { ipcMain, clipboard, BrowserWindow } from 'electron'
import { IpcChannel } from '../../shared/types/ipc'
import { AudioProcessor } from '../audio/processor'
import { createVoiceBackend } from '../voice/factory'
import { createLLMProcessor } from '../llm/factory'
import { createLogger } from '../../shared/logger'
import { MAX_CLIPBOARD_LENGTH, MAX_AUDIO_CHUNK_SAMPLES } from '../../shared/constants'
import type { VoiceBackend } from '../voice/backend'
import type { LLMProcessor } from '../llm/processor'
import type { AppSettings } from '../../shared/types/settings'
import { getSettings, setSettings, decryptApiKey } from '../storage/settings'
import {
  createSession,
  getSessionWithDiagrams,
  listSessions,
  deleteSession
} from '../storage/sessions'
import {
  emitRecordingStateChanged,
  emitTranscriptionComplete,
  emitTranscriptionError
} from './events'

const logger = createLogger('ipc')

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function isValidUUID(id: unknown): id is string {
  return typeof id === 'string' && UUID_REGEX.test(id)
}

let audioProcessor: AudioProcessor | null = null
let isRecording = false
let isProcessing = false

export function registerIpcHandlers() {
  // --- Clipboard ---
  ipcMain.handle(IpcChannel.CLIPBOARD_WRITE, (_event, text: string) => {
    if (typeof text !== 'string') {
      throw new Error('CLIPBOARD_WRITE: text must be a string')
    }
    if (text.length > MAX_CLIPBOARD_LENGTH) {
      throw new Error('CLIPBOARD_WRITE: text exceeds maximum length')
    }
    clipboard.writeText(text)
    logger.debug('Text written to clipboard')
  })

  // --- Overlay ---
  ipcMain.handle(IpcChannel.OVERLAY_SET_MODE, (_event, mode: string) => {
    logger.debug('Overlay mode set to: %s', mode)
  })

  // --- Recording ---
  ipcMain.handle(IpcChannel.RECORDING_START, () => {
    if (isRecording || isProcessing) {
      logger.warn('Recording already in progress, ignoring start')
      return
    }
    logger.info('Recording started')
    audioProcessor = new AudioProcessor()
    isRecording = true
  })

  ipcMain.handle(IpcChannel.RECORDING_STOP, async (event) => {
    if (!isRecording) {
      logger.warn('Not recording, ignoring stop')
      return null
    }
    logger.info('Recording stopped')
    isRecording = false
    isProcessing = true

    // Capture and clear the processor immediately to prevent race conditions
    const processor = audioProcessor
    audioProcessor = null

    if (!processor) {
      logger.warn('No audio processor — nothing to transcribe')
      isProcessing = false
      return null
    }

    const durationMs = processor.getDurationMs()
    const totalSamples = processor.getTotalSamples()
    logger.info('Recorded %d samples (%.1fs)', totalSamples, durationMs / 1000)

    if (totalSamples === 0) {
      isProcessing = false
      return null
    }

    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) {
      emitRecordingStateChanged(win, 'processing')
    }

    let voiceBackend: VoiceBackend | null = null
    let llmProcessor: LLMProcessor | null = null

    try {
      let wavBuffer: Buffer
      try {
        wavBuffer = processor.toWav()
      } catch (err) {
        logger.error('Failed to convert audio to WAV: %s', err)
        if (win) {
          emitTranscriptionError(win, 'Failed to process recorded audio')
          emitRecordingStateChanged(win, 'error')
        }
        isProcessing = false
        return null
      }

      // Load user settings
      const settings: AppSettings = getSettings()

      // Transcribe
      try {
        voiceBackend = await createVoiceBackend({
          type: settings.voice.backend,
          model: settings.voice.model,
          language: settings.voice.language,
          apiKey: settings.voice.openaiApiKey ? decryptApiKey(settings.voice.openaiApiKey) : ''
        })
      } catch (err) {
        logger.error('Failed to create voice backend: %s', err)
        if (win) {
          emitTranscriptionError(win, String(err))
          emitRecordingStateChanged(win, 'error')
        }
        isProcessing = false
        return null
      }

      let transcription
      try {
        transcription = await voiceBackend.transcribe(wavBuffer, settings.voice.language)
      } finally {
        voiceBackend.dispose()
        voiceBackend = null
      }

      let cleanedText = transcription.text
      let summary: string | undefined

      // LLM cleanup if enabled
      if (settings.llm.enabled) {
        try {
          llmProcessor = await createLLMProcessor({
            backend: settings.llm.backend,
            model:
              settings.llm.backend === 'openai'
                ? settings.llm.openaiModel
                : settings.llm.ollamaModel,
            apiKey: settings.llm.openaiApiKey ? decryptApiKey(settings.llm.openaiApiKey) : '',
            ollamaUrl: settings.llm.ollamaUrl
          })
          const result = await llmProcessor.cleanup(transcription.text)
          cleanedText = result.cleanedText
          summary = result.summary
        } catch (err) {
          logger.warn('LLM cleanup failed, using raw text: %s', err)
        } finally {
          llmProcessor?.dispose()
          llmProcessor = null
        }
      }

      // Copy to clipboard
      clipboard.writeText(cleanedText)

      // Persist session to database
      const session = createSession({
        rawText: transcription.text,
        cleanedText,
        summary,
        durationMs,
        voiceBackend: settings.voice.backend,
        llmEnabled: settings.llm.enabled,
        language: settings.voice.language
      })

      const result = {
        sessionId: session.id,
        rawText: transcription.text,
        cleanedText,
        summary,
        durationMs
      }

      if (win) {
        emitTranscriptionComplete(win, result)
        emitRecordingStateChanged(win, 'complete', session.id)
      }

      isProcessing = false
      return result
    } catch (err) {
      logger.error('Transcription pipeline failed: %s', err)
      if (win) {
        emitTranscriptionError(win, String(err))
        emitRecordingStateChanged(win, 'error')
      }
      isProcessing = false
      return null
    }
  })

  // --- Audio chunks ---
  ipcMain.handle(
    IpcChannel.AUDIO_SEND_CHUNK,
    (_event, samples: Float32Array, _sampleRate: number) => {
      if (isRecording && audioProcessor) {
        if (samples && samples.length > MAX_AUDIO_CHUNK_SAMPLES) {
          logger.warn('Audio chunk too large (%d samples), dropping', samples.length)
          return
        }
        audioProcessor.addChunk(new Float32Array(samples))
      } else {
        logger.debug('Audio chunk dropped (not recording)')
      }
    }
  )

  // --- Settings ---
  ipcMain.handle(IpcChannel.SETTINGS_GET, () => {
    logger.debug('Settings get requested')
    return getSettings()
  })

  ipcMain.handle(IpcChannel.SETTINGS_SET, (_event, settings: Partial<AppSettings>) => {
    if (!settings || typeof settings !== 'object') {
      throw new Error('SETTINGS_SET: settings must be an object')
    }
    logger.debug('Settings set requested')
    return setSettings(settings)
  })

  // --- Sessions ---
  ipcMain.handle(IpcChannel.SESSION_LIST, (_event, query?: string) => {
    logger.debug('Session list requested')
    return listSessions(query)
  })

  ipcMain.handle(IpcChannel.SESSION_GET, (_event, id: string) => {
    if (!isValidUUID(id)) {
      throw new Error('SESSION_GET: invalid session ID')
    }
    logger.debug('Session get requested: %s', id)
    return getSessionWithDiagrams(id)
  })

  ipcMain.handle(IpcChannel.SESSION_DELETE, (_event, id: string) => {
    if (!isValidUUID(id)) {
      throw new Error('SESSION_DELETE: invalid session ID')
    }
    logger.debug('Session delete requested: %s', id)
    deleteSession(id)
  })

  // --- Session export ---
  ipcMain.handle(IpcChannel.SESSION_EXPORT, (_event, id: string, format: string) => {
    if (!isValidUUID(id)) {
      throw new Error('SESSION_EXPORT: invalid session ID')
    }
    logger.debug('Session export requested: %s (%s)', id, format)
    const session = getSessionWithDiagrams(id)
    if (!session) return null

    if (format === 'json') {
      return JSON.stringify(session, null, 2)
    }

    // Default: plain text export
    const parts: string[] = []
    if (session.title) parts.push(session.title)
    parts.push(`Date: ${session.createdAt}`)
    parts.push(`Duration: ${Math.round(session.durationMs / 1000)}s`)
    if (session.summary) {
      parts.push('', '--- Summary ---', session.summary)
    }
    parts.push('', '--- Transcription ---', session.cleanedText || session.rawText)
    return parts.join('\n')
  })

  // --- Diagram export ---
  ipcMain.handle(
    IpcChannel.DIAGRAM_EXPORT,
    (_event, sessionId: string, format: string, _data: string) => {
      logger.debug('Diagram export requested: session=%s format=%s', sessionId, format)
      throw new Error('Diagram export is not yet implemented')
    }
  )

  logger.info('IPC handlers registered')
}
