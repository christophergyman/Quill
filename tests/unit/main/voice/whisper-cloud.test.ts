import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { WhisperCloudBackend } from '../../../../src/main/voice/whisper-cloud'

describe('WhisperCloudBackend', () => {
  let backend: WhisperCloudBackend

  beforeEach(async () => {
    backend = new WhisperCloudBackend()
    await backend.initialize({
      type: 'whisper-cloud',
      model: 'whisper-1',
      language: 'en',
      apiKey: 'test-api-key'
    })
  })

  afterEach(() => {
    backend.dispose()
    vi.restoreAllMocks()
  })

  it('has correct name', () => {
    expect(backend.name).toBe('whisper-cloud')
  })

  it('calls OpenAI API with correct parameters', async () => {
    const mockResponse = {
      text: 'Hello, world.',
      language: 'en',
      duration: 2.5,
      segments: [{ text: 'Hello, world.', start: 0, end: 2.5, avg_logprob: -0.3 }]
    }

    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify(mockResponse), { status: 200 }))

    const wavBuffer = Buffer.alloc(100)
    const result = await backend.transcribe(wavBuffer, 'en')

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url, options] = fetchSpy.mock.calls[0]
    expect(url).toBe('https://api.openai.com/v1/audio/transcriptions')
    expect((options as RequestInit).method).toBe('POST')
    expect((options as RequestInit).headers).toEqual(
      expect.objectContaining({ Authorization: 'Bearer test-api-key' })
    )

    expect(result.text).toBe('Hello, world.')
    expect(result.language).toBe('en')
    expect(result.durationMs).toBe(2500)
    expect(result.segments).toHaveLength(1)
  })

  it('throws on auth error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('Unauthorized', { status: 401 }))

    const wavBuffer = Buffer.alloc(100)
    await expect(backend.transcribe(wavBuffer)).rejects.toThrow(
      'OpenAI Whisper API authentication failed (401)'
    )
  })

  it('throws on non-auth API error with body', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('Rate limit exceeded', { status: 429 })
    )

    const wavBuffer = Buffer.alloc(100)
    await expect(backend.transcribe(wavBuffer)).rejects.toThrow(
      'OpenAI Whisper API error (429): Rate limit exceeded'
    )
  })
})
