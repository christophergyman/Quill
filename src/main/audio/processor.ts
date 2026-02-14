import { AUDIO_SAMPLE_RATE, AUDIO_CHANNELS } from '../../shared/constants'

/**
 * Accumulates PCM Float32 chunks and assembles them into a WAV buffer.
 */
export class AudioProcessor {
  private chunks: Float32Array[] = []
  private sampleRate: number

  constructor(sampleRate: number = AUDIO_SAMPLE_RATE) {
    this.sampleRate = sampleRate
  }

  addChunk(samples: Float32Array) {
    this.chunks.push(new Float32Array(samples))
  }

  getTotalSamples(): number {
    return this.chunks.reduce((sum, chunk) => sum + chunk.length, 0)
  }

  getDurationMs(): number {
    return (this.getTotalSamples() / this.sampleRate) * 1000
  }

  /**
   * Assemble all accumulated PCM chunks into a WAV buffer.
   */
  toWav(): Buffer {
    const totalSamples = this.getTotalSamples()
    const pcm = new Float32Array(totalSamples)

    let offset = 0
    for (const chunk of this.chunks) {
      pcm.set(chunk, offset)
      offset += chunk.length
    }

    return encodeWav(pcm, this.sampleRate, AUDIO_CHANNELS)
  }

  reset() {
    this.chunks = []
  }
}

/**
 * Encode Float32 PCM samples into a WAV file buffer.
 * Output: 16-bit PCM WAV.
 */
export function encodeWav(samples: Float32Array, sampleRate: number, numChannels: number): Buffer {
  const bitsPerSample = 16
  const bytesPerSample = bitsPerSample / 8
  const dataSize = samples.length * bytesPerSample
  const headerSize = 44
  const buffer = Buffer.alloc(headerSize + dataSize)

  // RIFF header
  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + dataSize, 4)
  buffer.write('WAVE', 8)

  // fmt sub-chunk
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16) // Sub-chunk size
  buffer.writeUInt16LE(1, 20) // PCM format
  buffer.writeUInt16LE(numChannels, 22)
  buffer.writeUInt32LE(sampleRate, 24)
  buffer.writeUInt32LE(sampleRate * numChannels * bytesPerSample, 28) // Byte rate
  buffer.writeUInt16LE(numChannels * bytesPerSample, 32) // Block align
  buffer.writeUInt16LE(bitsPerSample, 34)

  // data sub-chunk
  buffer.write('data', 36)
  buffer.writeUInt32LE(dataSize, 40)

  // Convert Float32 [-1, 1] to Int16
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]))
    const int16 = s < 0 ? s * 0x8000 : s * 0x7fff
    buffer.writeInt16LE(Math.round(int16), headerSize + i * bytesPerSample)
  }

  return buffer
}
