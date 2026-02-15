import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockRegister = vi.fn()

vi.mock('electron', () => ({
  globalShortcut: {
    register: (...args: unknown[]) => mockRegister(...args)
  }
}))

vi.mock('../../../src/main/storage/settings', () => ({
  getSettings: vi.fn().mockReturnValue({
    general: { launchAtLogin: false, showDockIcon: false, language: 'en' },
    voice: {
      backend: 'whisper-cloud',
      model: 'whisper-1',
      language: 'en',
      openaiApiKey: ''
    },
    llm: {
      enabled: false,
      backend: 'openai',
      openaiModel: 'gpt-4o-mini',
      openaiApiKey: '',
      ollamaUrl: 'http://localhost:11434',
      ollamaModel: 'llama3.2'
    },
    shortcuts: {
      toggleOverlay: 'CommandOrControl+Shift+Space',
      toggleDrawing: 'CommandOrControl+Shift+D',
      holdToRecord: 'CommandOrControl+Shift+;'
    }
  })
}))

import { registerShortcuts } from '../../../src/main/shortcuts'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('registerShortcuts', () => {
  it('registers shortcuts from settings', () => {
    mockRegister.mockReturnValue(true)

    registerShortcuts({
      onToggleOverlay: vi.fn(),
      onToggleDrawing: vi.fn()
    })

    expect(mockRegister).toHaveBeenCalledWith('CommandOrControl+Shift+Space', expect.any(Function))
    expect(mockRegister).toHaveBeenCalledWith('CommandOrControl+Shift+D', expect.any(Function))
  })

  it('calls callbacks on shortcut trigger', () => {
    mockRegister.mockImplementation((_accelerator: string, callback: () => void) => {
      callback()
      return true
    })

    const onToggleOverlay = vi.fn()
    const onToggleDrawing = vi.fn()

    registerShortcuts({ onToggleOverlay, onToggleDrawing })

    expect(onToggleOverlay).toHaveBeenCalled()
    expect(onToggleDrawing).toHaveBeenCalled()
  })

  it('does not throw when registration fails', () => {
    mockRegister.mockReturnValue(false)

    expect(() =>
      registerShortcuts({
        onToggleOverlay: vi.fn(),
        onToggleDrawing: vi.fn()
      })
    ).not.toThrow()
  })
})
