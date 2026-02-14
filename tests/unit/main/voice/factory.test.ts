import { describe, it, expect } from 'vitest'
import { createVoiceBackend } from '../../../../src/main/voice/factory'

describe('createVoiceBackend', () => {
  it('creates cloud backend with valid config', async () => {
    const backend = await createVoiceBackend({
      type: 'whisper-cloud',
      model: 'whisper-1',
      language: 'en',
      apiKey: 'test-key'
    })
    expect(backend.name).toBe('whisper-cloud')
    backend.dispose()
  })

  it('creates local backend (may warn about missing addon)', async () => {
    const backend = await createVoiceBackend({
      type: 'whisper-local',
      model: 'base',
      language: 'en'
    })
    expect(backend.name).toBe('whisper-local')
    backend.dispose()
  })

  it('throws on unknown backend type', async () => {
    await expect(
      createVoiceBackend({
        type: 'unknown' as 'whisper-local',
        model: 'base',
        language: 'en'
      })
    ).rejects.toThrow('Unknown voice backend type')
  })

  it('throws when cloud backend has no API key', async () => {
    await expect(
      createVoiceBackend({
        type: 'whisper-cloud',
        model: 'whisper-1',
        language: 'en',
        apiKey: ''
      })
    ).rejects.toThrow('OpenAI API key is required')
  })
})
