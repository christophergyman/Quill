export interface LLMResult {
  cleanedText: string
  summary?: string
}

export interface LLMProcessor {
  readonly name: string
  initialize(config: LLMProcessorConfig): Promise<void>
  cleanup(rawText: string): Promise<LLMResult>
  dispose(): void
}

export interface LLMProcessorConfig {
  backend: 'openai' | 'ollama'
  model: string
  apiKey?: string
  ollamaUrl?: string
}
