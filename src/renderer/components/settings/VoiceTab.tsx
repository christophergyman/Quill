import type { VoiceSettings } from '@shared/types/settings'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

interface VoiceTabProps {
  settings: VoiceSettings
  onChange: (settings: VoiceSettings) => void
}

export function VoiceTab({ settings, onChange }: VoiceTabProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-4">Voice</h2>

      <div className="space-y-4">
        <div>
          <Label className="text-xs mb-1">Backend</Label>
          <Select
            value={settings.backend}
            onValueChange={(value) =>
              onChange({ ...settings, backend: value as VoiceSettings['backend'] })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="whisper-cloud">OpenAI Whisper (Cloud)</SelectItem>
              <SelectItem value="whisper-local">Whisper.cpp (Local)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {settings.backend === 'whisper-cloud' && (
          <div>
            <Label htmlFor="voice-api-key" className="text-xs mb-1">
              OpenAI API Key
            </Label>
            <Input
              id="voice-api-key"
              type="password"
              placeholder="sk-..."
              value={settings.openaiApiKey}
              onChange={(e) => onChange({ ...settings, openaiApiKey: e.target.value })}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Your API key is encrypted and stored locally
            </p>
          </div>
        )}

        {settings.backend === 'whisper-local' && (
          <div>
            <Label className="text-xs mb-1">Model</Label>
            <Select
              value={settings.model}
              onValueChange={(value) => onChange({ ...settings, model: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tiny">Tiny (75MB)</SelectItem>
                <SelectItem value="base">Base (142MB)</SelectItem>
                <SelectItem value="small">Small (466MB)</SelectItem>
                <SelectItem value="medium">Medium (1.5GB)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

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
              <SelectItem value="auto">Auto-detect</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
