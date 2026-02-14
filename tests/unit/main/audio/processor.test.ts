import { describe, it, expect, beforeEach } from 'vitest'
import { AudioProcessor, encodeWav } from '../../../../src/main/audio/processor'

describe('AudioProcessor', () => {
  let processor: AudioProcessor

  beforeEach(() => {
    processor = new AudioProcessor(16000)
  })

  it('starts with zero samples', () => {
    expect(processor.getTotalSamples()).toBe(0)
    expect(processor.getDurationMs()).toBe(0)
  })

  it('accumulates chunks', () => {
    processor.addChunk(new Float32Array([0.1, 0.2, 0.3]))
    processor.addChunk(new Float32Array([0.4, 0.5]))
    expect(processor.getTotalSamples()).toBe(5)
  })

  it('calculates duration correctly', () => {
    // 16000 samples at 16kHz = 1000ms
    const samples = new Float32Array(16000)
    processor.addChunk(samples)
    expect(processor.getDurationMs()).toBe(1000)
  })

  it('resets state', () => {
    processor.addChunk(new Float32Array([0.1, 0.2]))
    processor.reset()
    expect(processor.getTotalSamples()).toBe(0)
  })

  it('produces a valid WAV buffer', () => {
    const samples = new Float32Array(1600) // 100ms at 16kHz
    for (let i = 0; i < samples.length; i++) {
      samples[i] = Math.sin((2 * Math.PI * 440 * i) / 16000)
    }
    processor.addChunk(samples)

    const wav = processor.toWav()

    // Check WAV header
    expect(wav.toString('ascii', 0, 4)).toBe('RIFF')
    expect(wav.toString('ascii', 8, 12)).toBe('WAVE')
    expect(wav.toString('ascii', 12, 16)).toBe('fmt ')
    expect(wav.toString('ascii', 36, 40)).toBe('data')

    // Check format
    expect(wav.readUInt16LE(20)).toBe(1) // PCM
    expect(wav.readUInt16LE(22)).toBe(1) // Mono
    expect(wav.readUInt32LE(24)).toBe(16000) // Sample rate
    expect(wav.readUInt16LE(34)).toBe(16) // Bits per sample

    // Check data size
    const dataSize = wav.readUInt32LE(40)
    expect(dataSize).toBe(1600 * 2) // 1600 samples * 2 bytes each

    // Total size: header (44) + data
    expect(wav.length).toBe(44 + dataSize)
  })
})

describe('encodeWav', () => {
  it('encodes silence correctly', () => {
    const silence = new Float32Array(100)
    const wav = encodeWav(silence, 16000, 1)

    // All data bytes should be 0 for silence
    for (let i = 44; i < wav.length; i += 2) {
      expect(wav.readInt16LE(i)).toBe(0)
    }
  })

  it('clamps values to [-1, 1]', () => {
    const samples = new Float32Array([2.0, -2.0, 0.5])
    const wav = encodeWav(samples, 16000, 1)

    // +2.0 clamped to +1.0 → 0x7FFF
    expect(wav.readInt16LE(44)).toBe(0x7fff)
    // -2.0 clamped to -1.0 → -0x8000
    expect(wav.readInt16LE(46)).toBe(-0x8000)
  })

  it('writes correct RIFF size', () => {
    const samples = new Float32Array(50)
    const wav = encodeWav(samples, 16000, 1)
    const riffSize = wav.readUInt32LE(4)
    expect(riffSize).toBe(36 + 50 * 2)
  })
})
