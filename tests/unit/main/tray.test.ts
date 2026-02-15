import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSetToolTip = vi.fn()
const mockSetContextMenu = vi.fn()
const mockBuildFromTemplate = vi.fn()

vi.mock('electron', () => ({
  Tray: class MockTray {
    constructor() {}
    setToolTip(tip: string) {
      mockSetToolTip(tip)
    }
    setContextMenu(menu: unknown) {
      mockSetContextMenu(menu)
    }
  },
  Menu: {
    buildFromTemplate: (template: unknown[]) => {
      mockBuildFromTemplate(template)
      return { items: template }
    }
  },
  nativeImage: {
    createFromPath: vi.fn().mockReturnValue({
      isEmpty: () => false,
      resize: () => ({ mock: 'resized-icon' })
    }),
    createEmpty: vi.fn().mockReturnValue({ mock: 'empty-icon' })
  }
}))

import { createTray } from '../../../src/main/tray'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('createTray', () => {
  it('creates tray with tooltip', () => {
    const callbacks = {
      onToggleOverlay: vi.fn(),
      onOpenApp: vi.fn(),
      onQuit: vi.fn()
    }

    createTray(callbacks)
    expect(mockSetToolTip).toHaveBeenCalledWith('Quill')
  })

  it('context menu has all expected items', () => {
    const callbacks = {
      onToggleOverlay: vi.fn(),
      onOpenApp: vi.fn(),
      onQuit: vi.fn()
    }

    createTray(callbacks)

    expect(mockBuildFromTemplate).toHaveBeenCalled()
    const template = mockBuildFromTemplate.mock.calls[0][0] as Array<{
      label?: string
      type?: string
    }>
    const labels = template.filter((item) => item.label).map((item) => item.label)
    expect(labels).toContain('Toggle Overlay')
    expect(labels).toContain('Open Quill')
    expect(labels).toContain('Quit Quill')
  })

  it('menu item clicks call correct callbacks', () => {
    const callbacks = {
      onToggleOverlay: vi.fn(),
      onOpenApp: vi.fn(),
      onQuit: vi.fn()
    }

    createTray(callbacks)

    const template = mockBuildFromTemplate.mock.calls[0][0] as Array<{
      label?: string
      click?: () => void
    }>
    const toggleItem = template.find((item) => item.label === 'Toggle Overlay')
    const openAppItem = template.find((item) => item.label === 'Open Quill')
    const quitItem = template.find((item) => item.label === 'Quit Quill')

    toggleItem?.click?.()
    expect(callbacks.onToggleOverlay).toHaveBeenCalled()

    openAppItem?.click?.()
    expect(callbacks.onOpenApp).toHaveBeenCalled()

    quitItem?.click?.()
    expect(callbacks.onQuit).toHaveBeenCalled()
  })

  it('returns a Tray instance', () => {
    const callbacks = {
      onToggleOverlay: vi.fn(),
      onOpenApp: vi.fn(),
      onQuit: vi.fn()
    }

    const tray = createTray(callbacks)
    expect(tray).toBeDefined()
  })
})
