import { useEffect, useCallback, useRef } from 'react'
import { useRecordingStore } from '../stores/recording'
import type { TranscriptionResult } from '@shared/types/ipc'
import { AUDIO_SAMPLE_RATE } from '@shared/constants'
import { createRendererLogger } from '../lib/logger'

const logger = createRendererLogger('useRecording')

export function useRecording() {
  const { state, partialText, finalText, setState, setPartialText, setFinalText, reset } =
    useRecordingStore()
  const streamRef = useRef<MediaStream | null>(null)
  const contextRef = useRef<AudioContext | null>(null)
  const workletRef = useRef<AudioWorkletNode | null>(null)

  useEffect(() => {
    if (!window.api) return

    const cleanupState = window.api.onRecordingStateChanged((newState, sessionId) => {
      logger.debug('State changed: %s', newState)
      setState(newState as 'idle' | 'recording' | 'processing' | 'complete' | 'error', sessionId)
    })

    const cleanupPartial = window.api.onTranscriptionPartial((text) => {
      setPartialText(text)
    })

    const cleanupComplete = window.api.onTranscriptionComplete((result) => {
      const r = result as TranscriptionResult
      setFinalText(r.cleanedText || r.rawText)
    })

    const cleanupError = window.api.onTranscriptionError(() => {
      setState('error')
    })

    return () => {
      cleanupState()
      cleanupPartial()
      cleanupComplete()
      cleanupError()
    }
  }, [setState, setPartialText, setFinalText])

  // Clean up audio resources on unmount
  useEffect(() => {
    return () => {
      if (workletRef.current) {
        workletRef.current.disconnect()
        workletRef.current = null
      }
      if (contextRef.current) {
        contextRef.current.close()
        contextRef.current = null
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
    }
  }, [])

  const startRecording = useCallback(async () => {
    try {
      logger.info('Starting recording')
      reset()
      setState('recording')

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: AUDIO_SAMPLE_RATE,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      })
      streamRef.current = stream

      const audioContext = new AudioContext({ sampleRate: AUDIO_SAMPLE_RATE })
      contextRef.current = audioContext

      await audioContext.audioWorklet.addModule(
        new URL('../lib/audio-worklet-processor.js', import.meta.url).href
      )

      const source = audioContext.createMediaStreamSource(stream)
      const worklet = new AudioWorkletNode(audioContext, 'pcm-processor')
      workletRef.current = worklet

      worklet.port.onmessage = (event) => {
        const samples = event.data as Float32Array
        window.api?.sendAudioChunk(samples, AUDIO_SAMPLE_RATE)
      }

      source.connect(worklet)
      worklet.connect(audioContext.destination)
      logger.debug('Audio pipeline connected')

      await window.api?.startRecording()
    } catch (err) {
      logger.error('Failed to start recording:', err)
      setState('error')
    }
  }, [reset, setState])

  const stopRecording = useCallback(async () => {
    logger.info('Stopping recording')
    // Stop audio capture
    if (workletRef.current) {
      workletRef.current.disconnect()
      workletRef.current = null
    }
    if (contextRef.current) {
      await contextRef.current.close()
      contextRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    setState('processing')
    await window.api?.stopRecording()
  }, [setState])

  return {
    state,
    partialText,
    finalText,
    startRecording,
    stopRecording,
    reset
  }
}
