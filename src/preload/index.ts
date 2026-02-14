import { contextBridge, ipcRenderer } from 'electron'
import { IpcChannel } from '../shared/types/ipc'
import type { AppSettings } from '../shared/types/settings'

const api = {
  // Recording
  startRecording: () => ipcRenderer.invoke(IpcChannel.RECORDING_START),
  stopRecording: () => ipcRenderer.invoke(IpcChannel.RECORDING_STOP),

  // Audio
  sendAudioChunk: (samples: Float32Array, sampleRate: number) =>
    ipcRenderer.invoke(IpcChannel.AUDIO_SEND_CHUNK, samples, sampleRate),

  // Settings
  getSettings: () => ipcRenderer.invoke(IpcChannel.SETTINGS_GET) as Promise<AppSettings | null>,
  setSettings: (settings: Partial<AppSettings>) =>
    ipcRenderer.invoke(IpcChannel.SETTINGS_SET, settings),

  // Sessions
  listSessions: () => ipcRenderer.invoke(IpcChannel.SESSION_LIST),
  getSession: (id: string) => ipcRenderer.invoke(IpcChannel.SESSION_GET, id),
  deleteSession: (id: string) => ipcRenderer.invoke(IpcChannel.SESSION_DELETE, id),
  exportSession: (id: string, format: string) =>
    ipcRenderer.invoke(IpcChannel.SESSION_EXPORT, id, format),

  // Overlay
  setOverlayMode: (mode: 'passthrough' | 'drawing') =>
    ipcRenderer.invoke(IpcChannel.OVERLAY_SET_MODE, mode),

  // Clipboard
  writeClipboard: (text: string) => ipcRenderer.invoke(IpcChannel.CLIPBOARD_WRITE, text),

  // Diagram
  exportDiagram: (sessionId: string, format: 'png' | 'svg', data: string) =>
    ipcRenderer.invoke(IpcChannel.DIAGRAM_EXPORT, sessionId, format, data),

  // Event listeners (Main → Renderer)
  onRecordingStateChanged: (callback: (state: string, sessionId?: string) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, state: string, sessionId?: string) =>
      callback(state, sessionId)
    ipcRenderer.on(IpcChannel.RECORDING_STATE_CHANGED, listener)
    return () => ipcRenderer.removeListener(IpcChannel.RECORDING_STATE_CHANGED, listener)
  },

  onTranscriptionPartial: (callback: (text: string) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, text: string) => callback(text)
    ipcRenderer.on(IpcChannel.TRANSCRIPTION_PARTIAL, listener)
    return () => ipcRenderer.removeListener(IpcChannel.TRANSCRIPTION_PARTIAL, listener)
  },

  onTranscriptionComplete: (callback: (result: unknown) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, result: unknown) => callback(result)
    ipcRenderer.on(IpcChannel.TRANSCRIPTION_COMPLETE, listener)
    return () => ipcRenderer.removeListener(IpcChannel.TRANSCRIPTION_COMPLETE, listener)
  },

  onTranscriptionError: (callback: (error: string) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, error: string) => callback(error)
    ipcRenderer.on(IpcChannel.TRANSCRIPTION_ERROR, listener)
    return () => ipcRenderer.removeListener(IpcChannel.TRANSCRIPTION_ERROR, listener)
  },

  onOverlayModeChanged: (callback: (mode: string) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, mode: string) => callback(mode)
    ipcRenderer.on(IpcChannel.OVERLAY_MODE_CHANGED, listener)
    return () => ipcRenderer.removeListener(IpcChannel.OVERLAY_MODE_CHANGED, listener)
  },

  onOverlayVisibilityChanged: (callback: (visible: boolean) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, visible: boolean) => callback(visible)
    ipcRenderer.on(IpcChannel.OVERLAY_VISIBILITY_CHANGED, listener)
    return () => ipcRenderer.removeListener(IpcChannel.OVERLAY_VISIBILITY_CHANGED, listener)
  }
}

contextBridge.exposeInMainWorld('api', api)

export type QuillAPI = typeof api
