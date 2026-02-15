import { useEffect } from 'react'
import { useOverlay } from '../../hooks/useOverlay'
import { useRecording } from '../../hooks/useRecording'
import { useTldraw } from '../../hooks/useTldraw'
import { TranscriptionPanel } from './TranscriptionPanel'
import { StatusIndicator } from './StatusIndicator'
import { Toolbar } from './Toolbar'
import { DrawingCanvas } from './DrawingCanvas'

export function OverlayRoot() {
  const { mode } = useOverlay()
  const { state: recordingState, partialText, finalText } = useRecording()
  const { setEditor, getSnapshot, exportAsSvg, clear } = useTldraw()

  const transcription = finalText || partialText

  useEffect(() => {
    document.body.classList.add('overlay-mode')
    return () => document.body.classList.remove('overlay-mode')
  }, [])

  return (
    <div className="relative h-screen w-screen">
      {/* Drawing mode backdrop */}
      {mode === 'drawing' && <div className="absolute inset-0 bg-black/[0.03]" />}

      {/* Drawing canvas (tldraw) */}
      <DrawingCanvas
        active={mode === 'drawing'}
        onEditorReady={(editor) => setEditor(editor as Parameters<typeof setEditor>[0])}
      />

      {/* Status indicator — top right */}
      <div className="absolute top-4 right-4 z-50">
        <StatusIndicator state={recordingState} />
      </div>

      {/* Transcription panel — bottom center */}
      {transcription && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 max-w-2xl w-full px-4 z-50">
          <TranscriptionPanel text={transcription} />
        </div>
      )}

      {/* Toolbar — only visible in drawing mode */}
      {mode === 'drawing' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
          <Toolbar onExportSvg={exportAsSvg} onGetSnapshot={getSnapshot} onClear={clear} />
        </div>
      )}
    </div>
  )
}
