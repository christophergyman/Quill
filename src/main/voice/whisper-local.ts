import type { VoiceBackend } from './backend'
import type { TranscriptionOutput, VoiceBackendConfig } from '../../shared/types/voice'
import { createLogger } from '../../shared/logger'

const logger = createLogger('whisper-local')

/**
 * Local Whisper backend using whisper-node-addon (whisper.cpp bindings).
 * Falls back gracefully if the native addon is not available.
 */
export class WhisperLocalBackend implements VoiceBackend {
  readonly name = 'whisper-local'
  private model: string = 'base'
  private whisper: unknown = null

  async initialize(config: VoiceBackendConfig): Promise<void> {
    this.model = config.model || 'base'

    try {
      // Dynamic import — may fail if native addon not installed
      // Variable indirection prevents Vite from statically analyzing the import
      const moduleName = 'whisper-node-addon'
      const whisperModule = await import(/* @vite-ignore */ moduleName)
      this.whisper = whisperModule
      logger.info('Whisper local backend initialized with model: %s', this.model)
    } catch {
      logger.warn(
        'whisper-node-addon not available. Local transcription will not work. ' +
          'Install it with: bun add whisper-node-addon'
      )
      this.whisper = null
    }
  }

  async transcribe(wavBuffer: Buffer, _language?: string): Promise<TranscriptionOutput> {
    if (!this.whisper) {
      throw new Error('Local whisper backend not initialized. Is whisper-node-addon installed?')
    }

    logger.debug('Transcribing %d bytes of audio locally (model: %s)', wavBuffer.length, this.model)

    // TODO: Implement actual whisper-node-addon transcription call
    // This is a placeholder that will be filled when the native module is available
    throw new Error('Local whisper transcription not yet implemented — use cloud backend')
  }

  dispose(): void {
    this.whisper = null
    logger.info('Whisper local backend disposed')
  }
}
