import { useEffect } from 'react'
import { useSession } from '../../hooks/useSession'
import { SessionList } from './SessionList'
import { SessionDetail } from './SessionDetail'
import { Input } from '../ui/input'

export function LibraryRoot() {
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
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h1 className="text-lg font-semibold text-foreground mb-3">Library</h1>
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
