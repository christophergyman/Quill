import { useEffect } from 'react'
import { useSession } from '../../hooks/useSession'
import { SessionList } from './SessionList'
import { SessionDetail } from './SessionDetail'

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
    <div className="flex h-screen bg-neutral-50">
      {/* Sidebar */}
      <div className="w-80 border-r border-neutral-200 flex flex-col">
        <div className="p-4 border-b border-neutral-200">
          <h1 className="text-lg font-semibold text-neutral-900 mb-3">Library</h1>
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
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
          <div className="flex h-full items-center justify-center text-neutral-400 text-sm">
            Select a session to view details
          </div>
        )}
      </div>
    </div>
  )
}
