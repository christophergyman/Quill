import { ipcMain, clipboard, BrowserWindow } from 'electron'
import { IpcChannel } from '../../shared/types/ipc'
import { AudioProcessor } from '../audio/processor'
import { createVoiceBackend } from '../voice/factory'
import { createLLMProcessor } from '../llm/factory'
import { createLogger } from '../../shared/logger'
import type { VoiceBackend } from '../voice/backend'
import type { LLMProcessor } from '../llm/processor'
import { DEFAULT_SETTINGS } from '../../shared/types/settings'

const logger = createLogger('ipc')

let audioProcessor: AudioProcessor | null = null
let isRecording = false

export function registerIpcHandlers() {
  // --- Clipboard ---
  ipcMain.handle(IpcChannel.CLIPBOARD_WRITE, (_event, text: string) => {
    clipboard.writeText(text)
    logger.debug('Text written to clipboard')
  })

  // --- Overlay ---
  ipcMain.handle(IpcChannel.OVERLAY_SET_MODE, (_event, mode: string) => {
    logger.debug('Overlay mode set to: %s', mode)
  })

  // --- Recording ---
  ipcMain.handle(IpcChannel.RECORDING_START, () => {
    logger.info('Recording started')
    audioProcessor = new AudioProcessor()
    isRecording = true
  })

  ipcMain.handle(IpcChannel.RECORDING_STOP, async (event) => {
    logger.info('Recording stopped')
    isRecording = false

    if (!audioProcessor) {
      logger.warn('No audio processor — nothing to transcribe')
      return null
    }

    const durationMs = audioProcessor.getDurationMs()
    const totalSamples = audioProcessor.getTotalSamples()
    logger.info('Recorded %d samples (%.1fs)', totalSamples, durationMs / 1000)

    if (totalSamples === 0) {
      audioProcessor = null
      return null
    }

    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) {
      win.webContents.send(IpcChannel.RECORDING_STATE_CHANGED, 'processing')
    }

    try {
      const wavBuffer = audioProcessor.toWav()
      audioProcessor = null

      // Transcribe
      const settings = DEFAULT_SETTINGS
      let voiceBackend: VoiceBackend | null = null
      try {
        voiceBackend = await createVoiceBackend({
          type: settings.voice.backend,
          model: settings.voice.model,
          language: settings.voice.language,
          apiKey: settings.voice.openaiApiKey
        })
      } catch (err) {
        logger.error('Failed to create voice backend: %s', err)
        if (win) {
          win.webContents.send(IpcChannel.TRANSCRIPTION_ERROR, String(err))
        }
        return null
      }

      const transcription = await voiceBackend.transcribe(wavBuffer, settings.voice.language)
      voiceBackend.dispose()

      let cleanedText = transcription.text
      let summary: string | undefined

      // LLM cleanup if enabled
      if (settings.llm.enabled) {
        let llmProcessor: LLMProcessor | null = null
        try {
          llmProcessor = await createLLMProcessor({
            backend: settings.llm.backend,
            model:
              settings.llm.backend === 'openai'
                ? settings.llm.openaiModel
                : settings.llm.ollamaModel,
            apiKey: settings.llm.openaiApiKey,
            ollamaUrl: settings.llm.ollamaUrl
          })
          const result = await llmProcessor.cleanup(transcription.text)
          cleanedText = result.cleanedText
          summary = result.summary
          llmProcessor.dispose()
        } catch (err) {
          logger.warn('LLM cleanup failed, using raw text: %s', err)
          llmProcessor?.dispose()
        }
      }

      // Copy to clipboard
      clipboard.writeText(cleanedText)

      const result = {
        rawText: transcription.text,
        cleanedText,
        summary,
        durationMs
      }

      if (win) {
        win.webContents.send(IpcChannel.TRANSCRIPTION_COMPLETE, result)
        win.webContents.send(IpcChannel.RECORDING_STATE_CHANGED, 'complete')
      }

      return result
    } catch (err) {
      logger.error('Transcription pipeline failed: %s', err)
      if (win) {
        win.webContents.send(IpcChannel.TRANSCRIPTION_ERROR, String(err))
        win.webContents.send(IpcChannel.RECORDING_STATE_CHANGED, 'error')
      }
      audioProcessor = null
      return null
    }
  })

  // --- Audio chunks ---
  ipcMain.handle(
    IpcChannel.AUDIO_SEND_CHUNK,
    (_event, samples: Float32Array, _sampleRate: number) => {
      if (isRecording && audioProcessor) {
        audioProcessor.addChunk(samples)
      }
    }
  )

  // --- Settings ---
  ipcMain.handle(IpcChannel.SETTINGS_GET, () => {
    logger.debug('Settings get requested')
    return DEFAULT_SETTINGS
  })

  ipcMain.handle(IpcChannel.SETTINGS_SET, (_event, _settings: unknown) => {
    logger.debug('Settings set requested')
  })

  // --- Sessions ---
  ipcMain.handle(IpcChannel.SESSION_LIST, () => {
    logger.debug('Session list requested')
    return []
  })

  ipcMain.handle(IpcChannel.SESSION_GET, (_event, _id: string) => {
    logger.debug('Session get requested')
    return null
  })

  ipcMain.handle(IpcChannel.SESSION_DELETE, (_event, _id: string) => {
    logger.debug('Session delete requested')
  })

  // --- Diagram export ---
  ipcMain.handle(
    IpcChannel.DIAGRAM_EXPORT,
    (_event, _sessionId: string, _format: string, _data: string) => {
      logger.debug('Diagram export requested')
    }
  )

  logger.info('IPC handlers registered')
}
