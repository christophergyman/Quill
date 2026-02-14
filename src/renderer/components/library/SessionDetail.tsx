import type { SessionWithDiagrams } from '@shared/types/session'
import { copyToClipboard } from '../../lib/clipboard'

interface SessionDetailProps {
  session: SessionWithDiagrams
  onDelete: (id: string) => void
}

export function SessionDetail({ session, onDelete }: SessionDetailProps) {
  const date = new Date(session.createdAt)
  const durationSec = Math.round(session.durationMs / 1000)

  const handleCopy = () => {
    copyToClipboard(session.cleanedText || session.rawText)
  }

  return (
    <div className="p-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">
            {session.title || date.toLocaleString()}
          </h2>
          <div className="flex items-center gap-3 mt-1 text-xs text-neutral-400">
            <span>{date.toLocaleString()}</span>
            <span>{durationSec}s</span>
            <span>{session.voiceBackend}</span>
            {session.llmEnabled && <span>LLM cleaned</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="text-xs px-3 py-1.5 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
          >
            Copy
          </button>
          <button
            onClick={() => onDelete(session.id)}
            className="text-xs px-3 py-1.5 rounded-md bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Summary */}
      {session.summary && (
        <div className="mb-6">
          <h3 className="text-xs font-medium text-neutral-500 uppercase mb-2">Summary</h3>
          <p className="text-sm text-neutral-700 leading-relaxed">{session.summary}</p>
        </div>
      )}

      {/* Cleaned text */}
      {session.cleanedText && (
        <div className="mb-6">
          <h3 className="text-xs font-medium text-neutral-500 uppercase mb-2">Cleaned</h3>
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <p className="text-sm text-neutral-800 leading-relaxed whitespace-pre-wrap">
              {session.cleanedText}
            </p>
          </div>
        </div>
      )}

      {/* Raw text */}
      <div className="mb-6">
        <h3 className="text-xs font-medium text-neutral-500 uppercase mb-2">Raw Transcription</h3>
        <div className="bg-neutral-100 rounded-lg border border-neutral-200 p-4">
          <p
            className="text-sm text-neutral-600 leading-relaxed whitespace-pre-wrap"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {session.rawText}
          </p>
        </div>
      </div>

      {/* Diagrams */}
      {session.diagrams.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-neutral-500 uppercase mb-2">Diagrams</h3>
          <div className="grid grid-cols-2 gap-3">
            {session.diagrams.map((diagram) => (
              <div
                key={diagram.id}
                className="bg-white rounded-lg border border-neutral-200 p-3 text-xs text-neutral-400"
              >
                {diagram.pngData ? (
                  <img
                    src={`data:image/png;base64,${Buffer.from(diagram.pngData).toString('base64')}`}
                    alt="Diagram"
                    className="w-full rounded"
                  />
                ) : (
                  <span>Diagram snapshot saved</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
