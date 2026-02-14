import type { LLMProcessor, LLMProcessorConfig, LLMResult } from './processor'
import {
  CLEANUP_SYSTEM_PROMPT,
  SUMMARY_SYSTEM_PROMPT,
  buildCleanupPrompt,
  buildSummaryPrompt
} from './prompts'
import { createLogger } from '../../shared/logger'

const logger = createLogger('llm-ollama')

export class OllamaLLMProcessor implements LLMProcessor {
  readonly name = 'ollama'
  private baseUrl = 'http://localhost:11434'
  private model = 'llama3.2'

  async initialize(config: LLMProcessorConfig): Promise<void> {
    this.baseUrl = config.ollamaUrl || 'http://localhost:11434'
    this.model = config.model || 'llama3.2'
    logger.info('Ollama LLM processor initialized (url: %s, model: %s)', this.baseUrl, this.model)
  }

  async cleanup(rawText: string): Promise<LLMResult> {
    logger.debug('Cleaning up %d chars of text via Ollama', rawText.length)

    const cleanedText = await this.chat(CLEANUP_SYSTEM_PROMPT, buildCleanupPrompt(rawText))
    const summary = await this.chat(SUMMARY_SYSTEM_PROMPT, buildSummaryPrompt(cleanedText))

    return { cleanedText, summary }
  }

  private async chat(systemPrompt: string, userMessage: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        stream: false,
        options: { temperature: 0.3 }
      }),
      signal: AbortSignal.timeout(120_000)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Ollama API error (${response.status}): ${errorText}`)
    }

    const result = (await response.json()) as {
      message: { content: string }
    }

    return result.message?.content?.trim() || ''
  }

  dispose(): void {
    logger.info('Ollama LLM processor disposed')
  }
}
