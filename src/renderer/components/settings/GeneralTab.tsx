import type { GeneralSettings } from '@shared/types/settings'
import { Switch } from '../ui/switch'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

interface GeneralTabProps {
  settings: GeneralSettings
  onChange: (settings: GeneralSettings) => void
}

export function GeneralTab({ settings, onChange }: GeneralTabProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-4">General</h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between py-2">
          <div>
            <Label htmlFor="launch-at-login">Launch at login</Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Start Quill when you log in to your Mac
            </p>
          </div>
          <Switch
            id="launch-at-login"
            checked={settings.launchAtLogin}
            onCheckedChange={(checked) => onChange({ ...settings, launchAtLogin: checked })}
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <Label htmlFor="show-dock-icon">Show dock icon</Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Show Quill in the Dock (requires restart)
            </p>
          </div>
          <Switch
            id="show-dock-icon"
            checked={settings.showDockIcon}
            onCheckedChange={(checked) => onChange({ ...settings, showDockIcon: checked })}
          />
        </div>

        <div>
          <Label className="text-xs mb-1">Language</Label>
          <Select
            value={settings.language}
            onValueChange={(value) => onChange({ ...settings, language: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="de">German</SelectItem>
              <SelectItem value="ja">Japanese</SelectItem>
              <SelectItem value="zh">Chinese</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
