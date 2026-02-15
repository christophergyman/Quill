import { BrowserWindow } from 'electron'
import { join } from 'path'
import { createLogger } from '../../shared/logger'

const logger = createLogger('window-app')

export function createAppWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 900,
    height: 650,
    title: 'Quill',
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'] + '#/app')
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'), { hash: '/app' })
  }

  logger.info('App window created')
  return win
}
