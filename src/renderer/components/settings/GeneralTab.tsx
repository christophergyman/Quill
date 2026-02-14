import type { GeneralSettings } from '@shared/types/settings'
import { Toggle } from '../ui/Toggle'
import { Select } from '../ui/Select'

interface GeneralTabProps {
  settings: GeneralSettings
  onChange: (settings: GeneralSettings) => void
}

export function GeneralTab({ settings, onChange }: GeneralTabProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-neutral-900 mb-4">General</h2>

      <div className="space-y-3">
        <Toggle
          label="Launch at login"
          description="Start Quill when you log in to your Mac"
          checked={settings.launchAtLogin}
          onChange={(checked) => onChange({ ...settings, launchAtLogin: checked })}
        />

        <Toggle
          label="Show dock icon"
          description="Show Quill in the Dock (requires restart)"
          checked={settings.showDockIcon}
          onChange={(checked) => onChange({ ...settings, showDockIcon: checked })}
        />

        <Select
          label="Language"
          value={settings.language}
          onChange={(e) => onChange({ ...settings, language: e.target.value })}
          options={[
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Spanish' },
            { value: 'fr', label: 'French' },
            { value: 'de', label: 'German' },
            { value: 'ja', label: 'Japanese' },
            { value: 'zh', label: 'Chinese' }
          ]}
        />
      </div>
    </div>
  )
}
