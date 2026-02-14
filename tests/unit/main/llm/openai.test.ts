import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { OpenAILLMProcessor } from '../../../../src/main/llm/openai'

describe('OpenAILLMProcessor', () => {
  let processor: OpenAILLMProcessor

  beforeEach(async () => {
    processor = new OpenAILLMProcessor()
    await processor.initialize({
      backend: 'openai',
      model: 'gpt-4o-mini',
      apiKey: 'test-key'
    })
  })

  afterEach(() => {
    processor.dispose()
    vi.restoreAllMocks()
  })

  it('has correct name', () => {
    expect(processor.name).toBe('openai')
  })

  it('sends cleanup and summary requests', async () => {
    let callCount = 0
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      callCount++
      const text = callCount === 1 ? 'Cleaned text here.' : 'Summary of the text.'
      return new Response(
        JSON.stringify({
          choices: [{ message: { content: text } }]
        }),
        { status: 200 }
      )
    })

    const result = await processor.cleanup('um like hello world basically')

    expect(result.cleanedText).toBe('Cleaned text here.')
    expect(result.summary).toBe('Summary of the text.')
    expect(callCount).toBe(2) // One for cleanup, one for summary
  })

  it('throws on API error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('Rate limited', { status: 429 }))

    await expect(processor.cleanup('test')).rejects.toThrow('OpenAI API error (429)')
  })
})
