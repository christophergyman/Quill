import type { SessionListItem } from '@shared/types/session'
import { SessionCard } from './SessionCard'

interface SessionListProps {
  sessions: SessionListItem[]
  loading: boolean
  selectedId?: string
  onSelect: (id: string) => void
}

export function SessionList({ sessions, loading, selectedId, onSelect }: SessionListProps) {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-neutral-400 text-sm">
        Loading...
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-neutral-400 text-sm px-4 text-center">
        No sessions yet. Start recording to create one.
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto">
      {sessions.map((session) => (
        <SessionCard
          key={session.id}
          session={session}
          selected={session.id === selectedId}
          onClick={() => onSelect(session.id)}
        />
      ))}
    </div>
  )
}
