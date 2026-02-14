export const IpcChannel = {
  // Renderer → Main (invoke/handle)
  RECORDING_START: 'recording:start',
  RECORDING_STOP: 'recording:stop',
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',
  SESSION_LIST: 'session:list',
  SESSION_GET: 'session:get',
  SESSION_DELETE: 'session:delete',
  SESSION_EXPORT: 'session:export',
  OVERLAY_SET_MODE: 'overlay:set-mode',
  AUDIO_SEND_CHUNK: 'audio:send-chunk',
  CLIPBOARD_WRITE: 'clipboard:write',
  DIAGRAM_EXPORT: 'diagram:export',

  // Main → Renderer (send/on)
  RECORDING_STATE_CHANGED: 'recording:state-changed',
  TRANSCRIPTION_PARTIAL: 'transcription:partial',
  TRANSCRIPTION_COMPLETE: 'transcription:complete',
  TRANSCRIPTION_ERROR: 'transcription:error',
  OVERLAY_VISIBILITY_CHANGED: 'overlay:visibility-changed'
} as const

export type IpcChannel = (typeof IpcChannel)[keyof typeof IpcChannel]

export type RecordingState = 'idle' | 'recording' | 'processing' | 'complete' | 'error'

export type OverlayMode = 'passthrough' | 'drawing'

export interface TranscriptionResult {
  sessionId: string
  rawText: string
  cleanedText?: string
  summary?: string
  durationMs: number
}

export interface RecordingStatePayload {
  state: RecordingState
  sessionId?: string
}

export interface AudioChunkPayload {
  samples: Float32Array
  sampleRate: number
}
