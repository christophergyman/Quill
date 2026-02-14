import { Tldraw } from 'tldraw'
import type { Editor } from 'tldraw'
import 'tldraw/tldraw.css'
import '../../assets/styles/tldraw.css'

interface TldrawCanvasProps {
  onEditorReady?: (editor: unknown) => void
}

export default function TldrawCanvas({ onEditorReady }: TldrawCanvasProps) {
  const handleMount = (editor: Editor) => {
    // Set to draw tool by default in overlay mode
    editor.setCurrentTool('draw')
    onEditorReady?.(editor)
  }

  return (
    <div className="h-full w-full">
      <Tldraw onMount={handleMount} hideUi={false} inferDarkMode={false} />
    </div>
  )
}
