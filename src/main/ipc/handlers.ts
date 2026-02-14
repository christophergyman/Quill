import { ipcMain, clipboard } from 'electron'
import { IpcChannel } from '../../shared/types/ipc'
import { createLogger } from '../../shared/logger'

const logger = createLogger('ipc')

export function registerIpcHandlers() {
  ipcMain.handle(IpcChannel.CLIPBOARD_WRITE, (_event, text: string) => {
    clipboard.writeText(text)
    logger.debug('Text written to clipboard')
  })

  ipcMain.handle(IpcChannel.OVERLAY_SET_MODE, (_event, mode: string) => {
    logger.debug('Overlay mode set to: %s', mode)
  })

  ipcMain.handle(IpcChannel.RECORDING_START, () => {
    logger.debug('Recording start requested')
  })

  ipcMain.handle(IpcChannel.RECORDING_STOP, () => {
    logger.debug('Recording stop requested')
  })

  ipcMain.handle(IpcChannel.SETTINGS_GET, () => {
    logger.debug('Settings get requested')
    return null
  })

  ipcMain.handle(IpcChannel.SETTINGS_SET, (_event, _settings: unknown) => {
    logger.debug('Settings set requested')
  })

  ipcMain.handle(IpcChannel.SESSION_LIST, () => {
    logger.debug('Session list requested')
    return []
  })

  ipcMain.handle(IpcChannel.SESSION_GET, (_event, _id: string) => {
    logger.debug('Session get requested')
    return null
  })

  ipcMain.handle(IpcChannel.SESSION_DELETE, (_event, _id: string) => {
    logger.debug('Session delete requested')
  })

  logger.info('IPC handlers registered')
}
