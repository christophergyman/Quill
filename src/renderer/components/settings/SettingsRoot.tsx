import { useState } from 'react'
import { useSettings } from '../../hooks/useSettings'
import { GeneralTab } from './GeneralTab'
import { VoiceTab } from './VoiceTab'
import { LLMTab } from './LLMTab'
import { ShortcutsTab } from './ShortcutsTab'
import { AboutTab } from './AboutTab'
import { cn } from '../../lib/utils'

const TABS = ['General', 'Voice', 'LLM', 'Shortcuts', 'About'] as const
type Tab = (typeof TABS)[number]

export function SettingsRoot() {
  const [activeTab, setActiveTab] = useState<Tab>('General')
  const { settings, loading, updateSettings } = useSettings()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-muted-foreground text-sm">
        Loading settings...
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar tabs */}
      <nav className="w-48 border-r border-border p-3 pt-8">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors mb-0.5',
              activeTab === tab
                ? 'bg-accent text-foreground font-medium'
                : 'text-muted-foreground hover:bg-accent/50'
            )}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        {activeTab === 'General' && (
          <GeneralTab
            settings={settings.general}
            onChange={(g) => updateSettings({ general: g })}
          />
        )}
        {activeTab === 'Voice' && (
          <VoiceTab settings={settings.voice} onChange={(v) => updateSettings({ voice: v })} />
        )}
        {activeTab === 'LLM' && (
          <LLMTab settings={settings.llm} onChange={(l) => updateSettings({ llm: l })} />
        )}
        {activeTab === 'Shortcuts' && (
          <ShortcutsTab
            settings={settings.shortcuts}
            onChange={(s) => updateSettings({ shortcuts: s })}
          />
        )}
        {activeTab === 'About' && <AboutTab />}
      </div>
    </div>
  )
}
