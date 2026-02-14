import { app, BrowserWindow, globalShortcut } from 'electron'
import { createTray } from './tray'
import { createOverlayWindow } from './windows/overlay'
import { createSettingsWindow } from './windows/settings'
import { createLibraryWindow } from './windows/library'
import { registerIpcHandlers } from './ipc/handlers'
import { registerShortcuts } from './shortcuts'
import { createLogger } from '../shared/logger'

const logger = createLogger('main')

let overlayWindow: BrowserWindow | null = null
let settingsWindow: BrowserWindow | null = null
let libraryWindow: BrowserWindow | null = null
let overlayMode: 'passthrough' | 'drawing' = 'passthrough'

app.dock?.hide()

app.whenReady().then(() => {
  logger.info('Quill starting up')

  overlayWindow = createOverlayWindow()

  createTray({
    onToggleOverlay: () => toggleOverlay(),
    onOpenSettings: () => {
      if (!settingsWindow || settingsWindow.isDestroyed()) {
        settingsWindow = createSettingsWindow()
      }
      settingsWindow.show()
      settingsWindow.focus()
    },
    onOpenLibrary: () => {
      if (!libraryWindow || libraryWindow.isDestroyed()) {
        libraryWindow = createLibraryWindow()
      }
      libraryWindow.show()
      libraryWindow.focus()
    },
    onQuit: () => app.quit()
  })

  registerIpcHandlers()
  registerShortcuts({
    onToggleOverlay: () => toggleOverlay(),
    onToggleDrawing: () => toggleDrawingMode()
  })

  logger.info('Quill ready')
})

function toggleOverlay() {
  if (!overlayWindow || overlayWindow.isDestroyed()) {
    overlayWindow = createOverlayWindow()
  }

  if (overlayWindow.isVisible()) {
    overlayWindow.hide()
    // Reset to passthrough when hiding
    overlayMode = 'passthrough'
    overlayWindow.setIgnoreMouseEvents(true, { forward: true })
    logger.debug('Overlay hidden')
  } else {
    overlayWindow.show()
    overlayWindow.setIgnoreMouseEvents(true, { forward: true })
    overlayMode = 'passthrough'
    logger.debug('Overlay shown')
  }
}

function toggleDrawingMode() {
  if (!overlayWindow || overlayWindow.isDestroyed() || !overlayWindow.isVisible()) return

  if (overlayMode === 'passthrough') {
    overlayMode = 'drawing'
    overlayWindow.setIgnoreMouseEvents(false)
    overlayWindow.webContents.send('overlay:mode-changed', 'drawing')
    logger.debug('Switched to drawing mode')
  } else {
    overlayMode = 'passthrough'
    overlayWindow.setIgnoreMouseEvents(true, { forward: true })
    overlayWindow.webContents.send('overlay:mode-changed', 'passthrough')
    logger.debug('Switched to passthrough mode')
  }
}

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
  logger.info('Quill shutting down')
})

app.on('window-all-closed', (e: Event) => {
  e.preventDefault()
})
