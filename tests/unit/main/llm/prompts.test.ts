import { describe, it, expect } from 'vitest'
import {
  CLEANUP_SYSTEM_PROMPT,
  SUMMARY_SYSTEM_PROMPT,
  buildCleanupPrompt,
  buildSummaryPrompt
} from '../../../../src/main/llm/prompts'

describe('LLM prompts', () => {
  it('cleanup system prompt mentions filler words', () => {
    expect(CLEANUP_SYSTEM_PROMPT).toContain('filler words')
  })

  it('summary system prompt mentions summarize', () => {
    expect(SUMMARY_SYSTEM_PROMPT).toContain('Summarize')
  })

  it('buildCleanupPrompt includes raw text', () => {
    const prompt = buildCleanupPrompt('um hello world')
    expect(prompt).toContain('um hello world')
    expect(prompt).toContain('Clean up')
  })

  it('buildSummaryPrompt includes text', () => {
    const prompt = buildSummaryPrompt('We discussed the new API design.')
    expect(prompt).toContain('We discussed the new API design.')
    expect(prompt).toContain('Summarize')
  })
})
