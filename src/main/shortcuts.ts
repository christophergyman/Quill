import { globalShortcut } from 'electron'
import { DEFAULT_SETTINGS } from '../shared/types/settings'
import { createLogger } from '../shared/logger'

const logger = createLogger('shortcuts')

interface ShortcutCallbacks {
  onToggleOverlay: () => void
  onToggleDrawing: () => void
}

export function registerShortcuts(callbacks: ShortcutCallbacks) {
  const { shortcuts } = DEFAULT_SETTINGS

  const registered = globalShortcut.register(shortcuts.toggleOverlay, () => {
    logger.debug('Toggle overlay shortcut pressed')
    callbacks.onToggleOverlay()
  })
  if (!registered) {
    logger.warn('Failed to register toggle overlay shortcut: %s', shortcuts.toggleOverlay)
  }

  const drawRegistered = globalShortcut.register(shortcuts.toggleDrawing, () => {
    logger.debug('Toggle drawing shortcut pressed')
    callbacks.onToggleDrawing()
  })
  if (!drawRegistered) {
    logger.warn('Failed to register toggle drawing shortcut: %s', shortcuts.toggleDrawing)
  }
}
