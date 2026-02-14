import { describe, it, expect } from 'vitest'
import { DEFAULT_SETTINGS } from '../../../src/shared/types/settings'

describe('DEFAULT_SETTINGS', () => {
  it('has voice backend defaulting to whisper-cloud', () => {
    expect(DEFAULT_SETTINGS.voice.backend).toBe('whisper-cloud')
  })

  it('has LLM disabled by default', () => {
    expect(DEFAULT_SETTINGS.llm.enabled).toBe(false)
  })

  it('has correct default shortcuts', () => {
    expect(DEFAULT_SETTINGS.shortcuts.toggleOverlay).toBe('CommandOrControl+Shift+Space')
    expect(DEFAULT_SETTINGS.shortcuts.toggleDrawing).toBe('CommandOrControl+Shift+D')
  })

  it('defaults to English language', () => {
    expect(DEFAULT_SETTINGS.general.language).toBe('en')
  })

  it('hides dock icon by default', () => {
    expect(DEFAULT_SETTINGS.general.showDockIcon).toBe(false)
  })
})
