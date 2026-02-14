import { useEffect, useCallback, useRef } from 'react'
import { useRecordingStore } from '../stores/recording'
import type { TranscriptionResult } from '@shared/types/ipc'

const AUDIO_SAMPLE_RATE = 16000

export function useRecording() {
  const { state, partialText, finalText, setState, setPartialText, setFinalText, reset } =
    useRecordingStore()
  const streamRef = useRef<MediaStream | null>(null)
  const contextRef = useRef<AudioContext | null>(null)
  const workletRef = useRef<AudioWorkletNode | null>(null)

  useEffect(() => {
    const cleanupState = window.api.onRecordingStateChanged((newState, sessionId) => {
      setState(newState as 'idle' | 'recording' | 'processing' | 'complete' | 'error', sessionId)
    })

    const cleanupPartial = window.api.onTranscriptionPartial((text) => {
      setPartialText(text)
    })

    const cleanupComplete = window.api.onTranscriptionComplete((result) => {
      const r = result as TranscriptionResult
      setFinalText(r.cleanedText || r.rawText)
    })

    return () => {
      cleanupState()
      cleanupPartial()
      cleanupComplete()
    }
  }, [setState, setPartialText, setFinalText])

  const startRecording = useCallback(async () => {
    try {
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
        window.api.sendAudioChunk(samples, AUDIO_SAMPLE_RATE)
      }

      source.connect(worklet)
      worklet.connect(audioContext.destination)

      await window.api.startRecording()
    } catch (err) {
      console.error('Failed to start recording:', err)
      setState('error')
    }
  }, [reset, setState])

  const stopRecording = useCallback(async () => {
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
    await window.api.stopRecording()
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
