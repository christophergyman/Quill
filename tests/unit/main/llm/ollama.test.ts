import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { OllamaLLMProcessor } from '../../../../src/main/llm/ollama'

describe('OllamaLLMProcessor', () => {
  let processor: OllamaLLMProcessor

  beforeEach(async () => {
    processor = new OllamaLLMProcessor()
    await processor.initialize({
      backend: 'ollama',
      model: 'llama3.2',
      ollamaUrl: 'http://localhost:11434'
    })
  })

  afterEach(() => {
    processor.dispose()
    vi.restoreAllMocks()
  })

  it('has correct name', () => {
    expect(processor.name).toBe('ollama')
  })

  it('sends requests to Ollama API', async () => {
    let callCount = 0
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      callCount++
      expect(url).toBe('http://localhost:11434/api/chat')
      const text = callCount === 1 ? 'Cleaned text.' : 'A brief summary.'
      return new Response(JSON.stringify({ message: { content: text } }), { status: 200 })
    })

    const result = await processor.cleanup('uh testing one two three')

    expect(result.cleanedText).toBe('Cleaned text.')
    expect(result.summary).toBe('A brief summary.')
    expect(callCount).toBe(2)
  })

  it('throws on Ollama API error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('Model not found', { status: 404 })
    )

    await expect(processor.cleanup('test')).rejects.toThrow('Ollama API error (404)')
  })
})
