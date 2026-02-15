import type { VoiceBackend } from './backend'
import type { VoiceBackendConfig } from '../../shared/types/voice'
import { WhisperCloudBackend } from './whisper-cloud'
import { WhisperLocalBackend } from './whisper-local'
import { createLogger } from '../../shared/logger'

const logger = createLogger('voice-factory')

export async function createVoiceBackend(config: VoiceBackendConfig): Promise<VoiceBackend> {
  let backend: VoiceBackend

  switch (config.type) {
    case 'whisper-local':
      backend = new WhisperLocalBackend()
      break
    case 'whisper-cloud':
      backend = new WhisperCloudBackend()
      break
    default:
      logger.error('Unknown voice backend type: %s', config.type)
      throw new Error(`Unknown voice backend type: ${config.type}`)
  }

  await backend.initialize(config)
  logger.info('Voice backend created: %s', backend.name)
  return backend
}
