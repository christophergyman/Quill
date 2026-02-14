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
    overlayWindow.setIgnoreMouseEvents(true, { forward: true })
  } else {
    overlayWindow.show()
    overlayWindow.setIgnoreMouseEvents(true, { forward: true })
  }
}

function toggleDrawingMode() {
  if (!overlayWindow || overlayWindow.isDestroyed() || !overlayWindow.isVisible()) return

  const isPassthrough = overlayWindow.isAlwaysOnTop()
  if (isPassthrough) {
    overlayWindow.setIgnoreMouseEvents(false)
    overlayWindow.webContents.send('overlay:mode-changed', 'drawing')
  } else {
    overlayWindow.setIgnoreMouseEvents(true, { forward: true })
    overlayWindow.webContents.send('overlay:mode-changed', 'passthrough')
  }
}

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
  logger.info('Quill shutting down')
})

app.on('window-all-closed', (e: Event) => {
  e.preventDefault()
})
