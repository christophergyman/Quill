import { describe, it, expect } from 'vitest'
import { createLLMProcessor } from '../../../../src/main/llm/factory'

describe('createLLMProcessor', () => {
  it('creates OpenAI processor', async () => {
    const processor = await createLLMProcessor({
      backend: 'openai',
      model: 'gpt-4o-mini',
      apiKey: 'test-key'
    })
    expect(processor.name).toBe('openai')
    processor.dispose()
  })

  it('creates Ollama processor', async () => {
    const processor = await createLLMProcessor({
      backend: 'ollama',
      model: 'llama3.2',
      ollamaUrl: 'http://localhost:11434'
    })
    expect(processor.name).toBe('ollama')
    processor.dispose()
  })

  it('throws on unknown backend', async () => {
    await expect(
      createLLMProcessor({
        backend: 'unknown' as 'openai',
        model: 'test'
      })
    ).rejects.toThrow('Unknown LLM backend')
  })

  it('throws when OpenAI has no API key', async () => {
    await expect(
      createLLMProcessor({
        backend: 'openai',
        model: 'gpt-4o-mini',
        apiKey: ''
      })
    ).rejects.toThrow('OpenAI API key is required')
  })
})
