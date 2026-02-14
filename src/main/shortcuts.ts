import { globalShortcut } from 'electron'
import { createLogger } from '../shared/logger'
import { getSettings } from './storage/settings'

const logger = createLogger('shortcuts')

interface ShortcutCallbacks {
  onToggleOverlay: () => void
  onToggleDrawing: () => void
}

export function registerShortcuts(callbacks: ShortcutCallbacks) {
  const { shortcuts } = getSettings()

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
