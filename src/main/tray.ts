import { Tray, Menu, nativeImage } from 'electron'
import { join } from 'path'
import { createLogger } from '../shared/logger'

const logger = createLogger('tray')

interface TrayCallbacks {
  onToggleOverlay: () => void
  onOpenSettings: () => void
  onOpenLibrary: () => void
  onQuit: () => void
}

let tray: Tray | null = null

export function createTray(callbacks: TrayCallbacks): Tray {
  const iconPath = join(__dirname, '../../resources/tray-iconTemplate.png')
  const icon = nativeImage.createFromPath(iconPath)

  const trayIcon = icon.isEmpty()
    ? nativeImage.createEmpty()
    : icon.resize({ width: 18, height: 18 })

  tray = new Tray(trayIcon)
  tray.setToolTip('Quill')

  // If icon file was missing, show a text title so the tray is still visible
  if (icon.isEmpty()) {
    logger.warn('Tray icon not found at %s, using text fallback', iconPath)
    tray.setTitle('Q')
  }

  logger.info('Tray created')

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Toggle Overlay',
      click: () => {
        logger.debug('Menu: Toggle Overlay')
        callbacks.onToggleOverlay()
      }
    },
    { type: 'separator' },
    {
      label: 'Library',
      click: () => {
        logger.debug('Menu: Library')
        callbacks.onOpenLibrary()
      }
    },
    {
      label: 'Settings',
      click: () => {
        logger.debug('Menu: Settings')
        callbacks.onOpenSettings()
      }
    },
    { type: 'separator' },
    {
      label: 'Quit Quill',
      click: () => {
        logger.debug('Menu: Quit')
        callbacks.onQuit()
      }
    }
  ])

  tray.setContextMenu(contextMenu)
  return tray
}
