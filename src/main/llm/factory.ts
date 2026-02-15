import type { LLMProcessor, LLMProcessorConfig } from './processor'
import { OpenAILLMProcessor } from './openai'
import { OllamaLLMProcessor } from './ollama'
import { createLogger } from '../../shared/logger'

const logger = createLogger('llm-factory')

export async function createLLMProcessor(config: LLMProcessorConfig): Promise<LLMProcessor> {
  let processor: LLMProcessor

  switch (config.backend) {
    case 'openai':
      processor = new OpenAILLMProcessor()
      break
    case 'ollama':
      processor = new OllamaLLMProcessor()
      break
    default:
      logger.error('Unknown LLM backend: %s', config.backend)
      throw new Error(`Unknown LLM backend: ${config.backend}`)
  }

  await processor.initialize(config)
  logger.info('LLM processor created: %s', processor.name)
  return processor
}
