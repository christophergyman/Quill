import { describe, it, expect } from 'vitest'
import { IpcChannel } from '../../../src/shared/types/ipc'

describe('IpcChannel', () => {
  it('defines recording channels', () => {
    expect(IpcChannel.RECORDING_START).toBe('recording:start')
    expect(IpcChannel.RECORDING_STOP).toBe('recording:stop')
    expect(IpcChannel.RECORDING_STATE_CHANGED).toBe('recording:state-changed')
  })

  it('defines transcription channels', () => {
    expect(IpcChannel.TRANSCRIPTION_PARTIAL).toBe('transcription:partial')
    expect(IpcChannel.TRANSCRIPTION_COMPLETE).toBe('transcription:complete')
    expect(IpcChannel.TRANSCRIPTION_ERROR).toBe('transcription:error')
  })

  it('defines settings channels', () => {
    expect(IpcChannel.SETTINGS_GET).toBe('settings:get')
    expect(IpcChannel.SETTINGS_SET).toBe('settings:set')
  })

  it('defines session channels', () => {
    expect(IpcChannel.SESSION_LIST).toBe('session:list')
    expect(IpcChannel.SESSION_GET).toBe('session:get')
    expect(IpcChannel.SESSION_DELETE).toBe('session:delete')
  })
})
