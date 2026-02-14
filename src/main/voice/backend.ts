import type { TranscriptionOutput, VoiceBackendConfig } from '../../shared/types/voice'

export interface VoiceBackend {
  readonly name: string
  initialize(config: VoiceBackendConfig): Promise<void>
  transcribe(wavBuffer: Buffer, language?: string): Promise<TranscriptionOutput>
  dispose(): void
}
