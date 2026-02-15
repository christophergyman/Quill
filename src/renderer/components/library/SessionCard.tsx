import { cn } from '../../lib/utils'
import { Badge } from '../ui/badge'
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
      className={cn(
        'w-full text-left px-4 py-3 border-b border-border transition-colors',
        selected ? 'bg-accent' : 'hover:bg-accent/50'
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-foreground">
          {session.title || `${dateStr} ${timeStr}`}
        </span>
        <span className="text-xs text-muted-foreground">{durationSec}s</span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{preview}</p>
      {session.hasDiagram && (
        <Badge variant="secondary" className="mt-1 text-[10px]">
          diagram
        </Badge>
      )}
    </button>
  )
}
