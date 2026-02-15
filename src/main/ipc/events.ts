import { BrowserWindow } from 'electron'
import { IpcChannel } from '../../shared/types/ipc'
import type { TranscriptionResult, RecordingState } from '../../shared/types/ipc'
import { createLogger } from '../../shared/logger'

const logger = createLogger('ipc-events')

export function emitRecordingStateChanged(
  win: BrowserWindow,
  state: RecordingState,
  sessionId?: string
) {
  logger.debug('Emit recording state: %s', state)
  win.webContents.send(IpcChannel.RECORDING_STATE_CHANGED, state, sessionId)
}

export function emitTranscriptionPartial(win: BrowserWindow, text: string) {
  logger.debug('Emit transcription partial (%d chars)', text.length)
  win.webContents.send(IpcChannel.TRANSCRIPTION_PARTIAL, text)
}

export function emitTranscriptionComplete(win: BrowserWindow, result: TranscriptionResult) {
  logger.debug('Emit transcription complete: session=%s', result.sessionId)
  win.webContents.send(IpcChannel.TRANSCRIPTION_COMPLETE, result)
}

export function emitTranscriptionError(win: BrowserWindow, error: string) {
  logger.debug('Emit transcription error: %s', error)
  win.webContents.send(IpcChannel.TRANSCRIPTION_ERROR, error)
}

export function emitOverlayVisibilityChanged(win: BrowserWindow, visible: boolean) {
  logger.debug('Emit overlay visibility: %s', visible)
  win.webContents.send(IpcChannel.OVERLAY_VISIBILITY_CHANGED, visible)
}
