export interface TranscriptionSegment {
  text: string
  start: number
  end: number
  confidence: number
}

export interface TranscriptionOutput {
  text: string
  segments: TranscriptionSegment[]
  language: string
  durationMs: number
}

export interface VoiceBackendConfig {
  type: 'whisper-local' | 'whisper-cloud'
  model: string
  language: string
  apiKey?: string
}
