import { describe, it, expect } from 'vitest'
import { APP_NAME, AUDIO_SAMPLE_RATE, DB_FILENAME } from '../../../src/shared/constants'

describe('constants', () => {
  it('exports correct app name', () => {
    expect(APP_NAME).toBe('Quill')
  })

  it('uses 16kHz sample rate for whisper compatibility', () => {
    expect(AUDIO_SAMPLE_RATE).toBe(16000)
  })

  it('exports database filename', () => {
    expect(DB_FILENAME).toBe('quill.db')
  })
})
