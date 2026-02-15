import type { SessionListItem } from '@shared/types/session'
import { SessionCard } from './SessionCard'
import { Skeleton } from '../ui/skeleton'

interface SessionListProps {
  sessions: SessionListItem[]
  loading: boolean
  selectedId?: string
  onSelect: (id: string) => void
}

export function SessionList({ sessions, loading, selectedId, onSelect }: SessionListProps) {
  if (loading) {
    return (
      <div className="flex-1 p-4 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-8" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm px-4 text-center">
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
