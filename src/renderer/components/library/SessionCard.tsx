import { clsx } from 'clsx'
import type { SessionListItem } from '@shared/types/session'

interface SessionCardProps {
  session: SessionListItem
  selected: boolean
  onClick: () => void
}

export function SessionCard({ session, selected, onClick }: SessionCardProps) {
  const date = new Date(session.createdAt)
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  const durationSec = Math.round(session.durationMs / 1000)
  const preview = session.rawText.slice(0, 80) + (session.rawText.length > 80 ? '...' : '')

  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full text-left px-4 py-3 border-b border-neutral-100 transition-colors',
        selected ? 'bg-blue-50' : 'hover:bg-neutral-100'
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-neutral-900">
          {session.title || `${dateStr} ${timeStr}`}
        </span>
        <span className="text-xs text-neutral-400">{durationSec}s</span>
      </div>
      <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">{preview}</p>
      {session.hasDiagram && (
        <span className="inline-block mt-1 text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
          diagram
        </span>
      )}
    </button>
  )
}
