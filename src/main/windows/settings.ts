import { BrowserWindow } from 'electron'
import { join } from 'path'
import { is } from 'electron-vite/runtime'

export function createSettingsWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 600,
    height: 500,
    title: 'Quill Settings',
    show: false,
    resizable: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'] + '#/settings')
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'), { hash: '/settings' })
  }

  return win
}
