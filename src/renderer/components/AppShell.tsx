import { useState } from 'react'
import { LibraryRoot } from './library/LibraryRoot'
import { SettingsRoot } from './settings/SettingsRoot'

type View = 'library' | 'settings'

export function AppShell() {
  const [view, setView] = useState<View>('library')

  return (
    <div className="flex h-screen bg-background">
      {view === 'library' ? (
        <LibraryRoot onOpenSettings={() => setView('settings')} />
      ) : (
        <SettingsRoot onBack={() => setView('library')} />
      )}
    </div>
  )
}
