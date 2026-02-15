import { createRendererLogger } from '../../lib/logger'

const logger = createRendererLogger('Toolbar')

interface ToolbarProps {
  sessionId?: string
  onExportSvg?: () => Promise<string | null>
  onGetSnapshot?: () => string | null
  onClear?: () => void
}

export function Toolbar({ sessionId, onExportSvg, onGetSnapshot, onClear }: ToolbarProps) {
  const handleExport = async () => {
    const svg = await onExportSvg?.()
    if (svg) {
      if (!sessionId) {
        logger.warn('No session ID for diagram export')
      }
      await window.api?.exportDiagram(sessionId || '', 'svg', svg)
    }
  }

  const handleSave = () => {
    const snapshot = onGetSnapshot?.()
    if (snapshot) {
      if (!sessionId) {
        logger.warn('No session ID for diagram save')
      }
      window.api?.exportDiagram(sessionId || '', 'svg', snapshot)
    }
  }

  return (
    <div className="flex items-center gap-2 rounded-xl bg-black/60 backdrop-blur-md px-3 py-2">
      <span className="text-white/60 text-xs mr-2">Drawing mode</span>
      <button
        onClick={handleExport}
        className="text-white/70 hover:text-white text-xs px-2 py-1 rounded-md hover:bg-white/10 transition-colors"
      >
        Export SVG
      </button>
      <button
        onClick={handleSave}
        className="text-white/70 hover:text-white text-xs px-2 py-1 rounded-md hover:bg-white/10 transition-colors"
      >
        Save
      </button>
      <button
        onClick={onClear}
        className="text-white/70 hover:text-white text-xs px-2 py-1 rounded-md hover:bg-white/10 transition-colors"
      >
        Clear
      </button>
      <span className="text-white/40 text-xs ml-2">⌘⇧D to exit</span>
    </div>
  )
}
