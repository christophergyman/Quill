import type { VoiceBackend } from './backend'
import type { TranscriptionOutput, VoiceBackendConfig } from '../../shared/types/voice'
import { createLogger } from '../../shared/logger'
import { WHISPER_API_TIMEOUT_MS } from '../../shared/constants'

const logger = createLogger('whisper-cloud')

export class WhisperCloudBackend implements VoiceBackend {
  readonly name = 'whisper-cloud'
  private apiKey = ''
  private model = 'whisper-1'

  async initialize(config: VoiceBackendConfig): Promise<void> {
    if (!config.apiKey) {
      throw new Error('OpenAI API key is required for cloud whisper backend')
    }
    this.apiKey = config.apiKey
    this.model = config.model || 'whisper-1'
    logger.info('Whisper cloud backend initialized with model: %s', this.model)
  }

  async transcribe(wavBuffer: Buffer, language?: string): Promise<TranscriptionOutput> {
    logger.debug('Transcribing %d bytes of audio', wavBuffer.length)

    const formData = new FormData()
    formData.append('file', new Blob([wavBuffer], { type: 'audio/wav' }), 'recording.wav')
    formData.append('model', this.model)
    formData.append('response_format', 'verbose_json')
    if (language) {
      formData.append('language', language)
    }

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`
      },
      body: formData,
      signal: AbortSignal.timeout(WHISPER_API_TIMEOUT_MS)
    })

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error(`OpenAI Whisper API authentication failed (${response.status})`)
      }
      const errorText = await response.text()
      throw new Error(`OpenAI Whisper API error (${response.status}): ${errorText}`)
    }

    const result = (await response.json()) as {
      text: string
      language: string
      duration: number
      segments?: Array<{
        text: string
        start: number
        end: number
        avg_logprob?: number
      }>
    }

    logger.debug('Transcription complete: %d chars', result.text.length)

    return {
      text: result.text,
      language: result.language || language || 'en',
      durationMs: Math.round((result.duration || 0) * 1000),
      segments: (result.segments || []).map((s) => ({
        text: s.text,
        start: s.start,
        end: s.end,
        confidence: s.avg_logprob ? Math.exp(s.avg_logprob) : 0.9
      }))
    }
  }

  dispose(): void {
    logger.info('Whisper cloud backend disposed')
  }
}
