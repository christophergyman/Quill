import type { LLMProcessor, LLMProcessorConfig, LLMResult } from './processor'
import {
  CLEANUP_SYSTEM_PROMPT,
  SUMMARY_SYSTEM_PROMPT,
  buildCleanupPrompt,
  buildSummaryPrompt
} from './prompts'
import { createLogger } from '../../shared/logger'

const logger = createLogger('llm-openai')

export class OpenAILLMProcessor implements LLMProcessor {
  readonly name = 'openai'
  private apiKey = ''
  private model = 'gpt-4o-mini'

  async initialize(config: LLMProcessorConfig): Promise<void> {
    if (!config.apiKey) {
      throw new Error('OpenAI API key is required for OpenAI LLM backend')
    }
    this.apiKey = config.apiKey
    this.model = config.model || 'gpt-4o-mini'
    logger.info('OpenAI LLM processor initialized with model: %s', this.model)
  }

  async cleanup(rawText: string): Promise<LLMResult> {
    logger.debug('Cleaning up %d chars of text', rawText.length)

    const cleanedText = await this.chat(CLEANUP_SYSTEM_PROMPT, buildCleanupPrompt(rawText))
    const summary = await this.chat(SUMMARY_SYSTEM_PROMPT, buildSummaryPrompt(cleanedText))

    return { cleanedText, summary }
  }

  private async chat(systemPrompt: string, userMessage: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.3,
        max_tokens: 2048
      }),
      signal: AbortSignal.timeout(30_000)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`OpenAI API error (${response.status}): ${errorText}`)
    }

    const result = (await response.json()) as {
      choices: Array<{ message: { content: string } }>
    }

    return result.choices[0]?.message?.content?.trim() || ''
  }

  dispose(): void {
    logger.info('OpenAI LLM processor disposed')
  }
}
