interface DrawingCanvasProps {
  active: boolean
}

/**
 * Placeholder for tldraw canvas integration (Phase 6).
 * When active, renders a full-screen transparent capture area.
 */
export function DrawingCanvas({ active }: DrawingCanvasProps) {
  if (!active) return null

  return (
    <div className="absolute inset-0 cursor-crosshair">
      {/* tldraw will be integrated here in Phase 6 */}
    </div>
  )
}
