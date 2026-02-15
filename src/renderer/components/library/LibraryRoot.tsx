import { useEffect } from 'react'
import { Settings } from 'lucide-react'
import { useSession } from '../../hooks/useSession'
import { SessionList } from './SessionList'
import { SessionDetail } from './SessionDetail'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

interface LibraryRootProps {
  onOpenSettings?: () => void
}

export function LibraryRoot({ onOpenSettings }: LibraryRootProps) {
  const {
    sessions,
    currentSession,
    searchQuery,
    loading,
    setSearchQuery,
    loadSessions,
    loadSession,
    deleteSession
  } = useSession()

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  return (
    <div className="flex h-full bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-semibold text-foreground">Library</h1>
            {onOpenSettings && (
              <Button variant="ghost" size="icon-sm" onClick={onOpenSettings}>
                <Settings className="size-4" />
              </Button>
            )}
          </div>
          <Input
            type="text"
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <SessionList
          sessions={sessions}
          loading={loading}
          selectedId={currentSession?.id}
          onSelect={(id) => loadSession(id)}
        />
      </div>

      {/* Detail */}
      <div className="flex-1 overflow-auto">
        {currentSession ? (
          <SessionDetail session={currentSession} onDelete={deleteSession} />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
            Select a session to view details
          </div>
        )}
      </div>
    </div>
  )
}
