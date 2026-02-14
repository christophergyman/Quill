import type { ShortcutSettings } from '@shared/types/settings'
import { Input } from '../ui/Input'

interface ShortcutsTabProps {
  settings: ShortcutSettings
  onChange: (settings: ShortcutSettings) => void
}

export function ShortcutsTab({ settings, onChange }: ShortcutsTabProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-neutral-900 mb-4">Shortcuts</h2>

      <div className="space-y-4">
        <Input
          label="Toggle Overlay"
          value={settings.toggleOverlay}
          onChange={(e) => onChange({ ...settings, toggleOverlay: e.target.value })}
          hint="Show/hide the overlay window"
        />

        <Input
          label="Toggle Drawing Mode"
          value={settings.toggleDrawing}
          onChange={(e) => onChange({ ...settings, toggleDrawing: e.target.value })}
          hint="Switch between passthrough and drawing mode"
        />

        <Input
          label="Hold to Record"
          value={settings.holdToRecord}
          onChange={(e) => onChange({ ...settings, holdToRecord: e.target.value })}
          hint="Hold this key to record audio"
        />
      </div>

      <p className="mt-6 text-xs text-neutral-400">
        Use Electron accelerator format: CommandOrControl+Shift+Key
      </p>
    </div>
  )
}
