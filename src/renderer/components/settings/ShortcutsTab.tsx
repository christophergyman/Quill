import type { ShortcutSettings } from '@shared/types/settings'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

interface ShortcutsTabProps {
  settings: ShortcutSettings
  onChange: (settings: ShortcutSettings) => void
}

export function ShortcutsTab({ settings, onChange }: ShortcutsTabProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-4">Shortcuts</h2>

      <div className="space-y-4">
        <div>
          <Label htmlFor="toggle-overlay" className="text-xs mb-1">
            Toggle Overlay
          </Label>
          <Input
            id="toggle-overlay"
            value={settings.toggleOverlay}
            onChange={(e) => onChange({ ...settings, toggleOverlay: e.target.value })}
          />
          <p className="mt-1 text-xs text-muted-foreground">Show/hide the overlay window</p>
        </div>

        <div>
          <Label htmlFor="toggle-drawing" className="text-xs mb-1">
            Toggle Drawing Mode
          </Label>
          <Input
            id="toggle-drawing"
            value={settings.toggleDrawing}
            onChange={(e) => onChange({ ...settings, toggleDrawing: e.target.value })}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Switch between passthrough and drawing mode
          </p>
        </div>

        <div>
          <Label htmlFor="hold-to-record" className="text-xs mb-1">
            Hold to Record
          </Label>
          <Input
            id="hold-to-record"
            value={settings.holdToRecord}
            onChange={(e) => onChange({ ...settings, holdToRecord: e.target.value })}
          />
          <p className="mt-1 text-xs text-muted-foreground">Hold this key to record audio</p>
        </div>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Use Electron accelerator format: CommandOrControl+Shift+Key
      </p>
    </div>
  )
}
