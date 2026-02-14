import { BrowserWindow } from 'electron'
import { IpcChannel } from '../../shared/types/ipc'
import type { TranscriptionResult, RecordingState } from '../../shared/types/ipc'

export function emitRecordingStateChanged(
  win: BrowserWindow,
  state: RecordingState,
  sessionId?: string
) {
  win.webContents.send(IpcChannel.RECORDING_STATE_CHANGED, state, sessionId)
}

export function emitTranscriptionPartial(win: BrowserWindow, text: string) {
  win.webContents.send(IpcChannel.TRANSCRIPTION_PARTIAL, text)
}

export function emitTranscriptionComplete(win: BrowserWindow, result: TranscriptionResult) {
  win.webContents.send(IpcChannel.TRANSCRIPTION_COMPLETE, result)
}

export function emitTranscriptionError(win: BrowserWindow, error: string) {
  win.webContents.send(IpcChannel.TRANSCRIPTION_ERROR, error)
}

export function emitOverlayVisibilityChanged(win: BrowserWindow, visible: boolean) {
  win.webContents.send(IpcChannel.OVERLAY_VISIBILITY_CHANGED, visible)
}
