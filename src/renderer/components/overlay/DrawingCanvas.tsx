import { lazy, Suspense } from 'react'

interface DrawingCanvasProps {
  active: boolean
  onEditorReady?: (editor: unknown) => void
}

// Lazy-load tldraw to reduce initial bundle size (~2MB)
const TldrawCanvas = lazy(() => import('./TldrawCanvas'))

export function DrawingCanvas({ active, onEditorReady }: DrawingCanvasProps) {
  if (!active) return null

  return (
    <div className="absolute inset-0">
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
