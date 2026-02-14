import { useEffect, useState } from 'react'
import { TranscriptionPanel } from './TranscriptionPanel'
import { StatusIndicator } from './StatusIndicator'
import { Toolbar } from './Toolbar'

export function OverlayRoot() {
  const [mode, setMode] = useState<'passthrough' | 'drawing'>('passthrough')
  const [transcription, setTranscription] = useState('')
  const [recordingState, setRecordingState] = useState<string>('idle')

  useEffect(() => {
    document.body.classList.add('overlay-mode')

    const cleanupMode = window.api.onOverlayModeChanged((newMode) => {
      setMode(newMode as 'passthrough' | 'drawing')
    })

    const cleanupState = window.api.onRecordingStateChanged((state) => {
      setRecordingState(state)
    })

    const cleanupPartial = window.api.onTranscriptionPartial((text) => {
      setTranscription(text)
    })

    const cleanupComplete = window.api.onTranscriptionComplete((result) => {
      const r = result as { cleanedText?: string; rawText?: string }
      setTranscription(r.cleanedText || r.rawText || '')
    })

    return () => {
      document.body.classList.remove('overlay-mode')
      cleanupMode()
      cleanupState()
      cleanupPartial()
      cleanupComplete()
    }
  }, [])

  return (
    <div className="relative h-screen w-screen">
      {/* Drawing mode backdrop */}
      {mode === 'drawing' && <div className="absolute inset-0 bg-black/[0.03]" />}

      {/* Status indicator — top right */}
      <div className="absolute top-4 right-4">
        <StatusIndicator state={recordingState} />
      </div>

      {/* Transcription panel — bottom center */}
      {transcription && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 max-w-2xl w-full px-4">
          <TranscriptionPanel text={transcription} />
        </div>
      )}

      {/* Toolbar — only visible in drawing mode */}
      {mode === 'drawing' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2">
          <Toolbar />
        </div>
      )}
    </div>
  )
}
