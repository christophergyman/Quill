import { lazy, Suspense, useState } from 'react'
import type { Editor } from 'tldraw'

interface DrawingCanvasProps {
  active: boolean
  onEditorReady?: (editor: Editor) => void
}

// Lazy-load tldraw to reduce initial bundle size (~2MB)
const TldrawCanvas = lazy(() => import('./TldrawCanvas'))

export function DrawingCanvas({ active, onEditorReady }: DrawingCanvasProps) {
  // Track whether the canvas has ever been activated to avoid loading tldraw eagerly
  const [mounted, setMounted] = useState(false)
  if (active && !mounted) setMounted(true)

  if (!mounted) return null

  return (
    <div className="absolute inset-0" style={{ display: active ? 'block' : 'none' }}>
      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-white/40 text-xs">Loading canvas...</span>
          </div>
        }
      >
        <TldrawCanvas onEditorReady={onEditorReady} />
      </Suspense>
    </div>
  )
}
