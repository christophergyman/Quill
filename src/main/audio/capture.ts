import { ipcMain } from 'electron'
import { IpcChannel } from '../../shared/types/ipc'
import { createLogger } from '../../shared/logger'

const logger = createLogger('audio-capture')

export type AudioChunkCallback = (samples: Float32Array, sampleRate: number) => void

let chunkCallback: AudioChunkCallback | null = null

export function registerAudioCapture() {
  ipcMain.handle(
    IpcChannel.AUDIO_SEND_CHUNK,
    (_event, samples: Float32Array, sampleRate: number) => {
      if (chunkCallback) {
        chunkCallback(samples, sampleRate)
      }
    }
  )

  logger.info('Audio capture IPC registered')
}

export function setAudioChunkCallback(cb: AudioChunkCallback | null) {
  chunkCallback = cb
}
