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
  const iconPath = join(__dirname, '../../resources/tray-icon.png')
  const icon = nativeImage.createFromPath(iconPath)

  // Fallback to a small empty icon if resource not found
  const trayIcon = icon.isEmpty()
    ? nativeImage.createEmpty()
    : icon.resize({ width: 18, height: 18 })

  tray = new Tray(trayIcon)
  tray.setToolTip('Quill')
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
