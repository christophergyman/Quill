/**
 * AudioWorkletProcessor that extracts PCM Float32 samples
 * and sends them to the main thread via port.postMessage.
 */
class PCMProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0]
    if (input && input.length > 0) {
      const channelData = input[0]
      if (channelData.length > 0) {
        // Copy the data before posting (transferable)
        const copy = new Float32Array(channelData)
        this.port.postMessage(copy, [copy.buffer])
      }
    }
    return true
  }
}

registerProcessor('pcm-processor', PCMProcessor)
