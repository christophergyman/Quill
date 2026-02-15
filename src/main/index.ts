import { app, BrowserWindow, globalShortcut } from 'electron'
import { join } from 'path'
import { createTray } from './tray'
import { createOverlayWindow } from './windows/overlay'
import { createSettingsWindow } from './windows/settings'
import { createLibraryWindow } from './windows/library'
import { registerIpcHandlers } from './ipc/handlers'
import { registerShortcuts } from './shortcuts'
import { setLogFilePath, createLogger } from '../shared/logger'
import { LOG_FILENAME } from '../shared/constants'
import { initDatabase, closeDatabase } from './storage/database'
import { IpcChannel } from '../shared/types/ipc'

// Initialize file logging in production
if (process.env.NODE_ENV === 'production') {
  const logDir = join(process.env.HOME || '~', 'Library', 'Logs', 'Quill')
  setLogFilePath(join(logDir, LOG_FILENAME))
}

const logger = createLogger('main')

let overlayWindow: BrowserWindow | null = null
let settingsWindow: BrowserWindow | null = null
let libraryWindow: BrowserWindow | null = null
let overlayMode: 'passthrough' | 'drawing' = 'passthrough'

if (process.env.QUILL_TEST_USER_DATA) {
  app.setPath('userData', process.env.QUILL_TEST_USER_DATA)
}

app.dock?.hide()

app
  .whenReady()
  .then(() => {
    logger.info('Quill starting up')

    const db = initDatabase()

    // Expose database for E2E test seeding
    if (process.env.QUILL_TEST_USER_DATA) {
      ;(global as Record<string, unknown>).__quillTestDb = db
    }

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
  .catch((err) => {
    logger.error('Startup failed: %s', err)
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
    overlayWindow.webContents.send(IpcChannel.OVERLAY_MODE_CHANGED, 'drawing')
    logger.debug('Switched to drawing mode')
  } else {
    overlayMode = 'passthrough'
    overlayWindow.setIgnoreMouseEvents(true, { forward: true })
    overlayWindow.webContents.send(IpcChannel.OVERLAY_MODE_CHANGED, 'passthrough')
    logger.debug('Switched to passthrough mode')
  }
}

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
  closeDatabase()
  logger.info('Quill shutting down')
})

app.on('window-all-closed', (e: Event) => {
  e.preventDefault()
})
