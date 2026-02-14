import type { VoiceSettings } from '@shared/types/settings'
import { Select } from '../ui/Select'
import { Input } from '../ui/Input'

interface VoiceTabProps {
  settings: VoiceSettings
  onChange: (settings: VoiceSettings) => void
}

export function VoiceTab({ settings, onChange }: VoiceTabProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-neutral-900 mb-4">Voice</h2>

      <div className="space-y-4">
        <Select
          label="Backend"
          value={settings.backend}
          onChange={(e) =>
            onChange({ ...settings, backend: e.target.value as VoiceSettings['backend'] })
          }
          options={[
            { value: 'whisper-cloud', label: 'OpenAI Whisper (Cloud)' },
            { value: 'whisper-local', label: 'Whisper.cpp (Local)' }
          ]}
        />

        {settings.backend === 'whisper-cloud' && (
          <Input
            label="OpenAI API Key"
            type="password"
            placeholder="sk-..."
            value={settings.openaiApiKey}
            onChange={(e) => onChange({ ...settings, openaiApiKey: e.target.value })}
            hint="Your API key is encrypted and stored locally"
          />
        )}

        {settings.backend === 'whisper-local' && (
          <Select
            label="Model"
            value={settings.model}
            onChange={(e) => onChange({ ...settings, model: e.target.value })}
            options={[
              { value: 'tiny', label: 'Tiny (75MB)' },
              { value: 'base', label: 'Base (142MB)' },
              { value: 'small', label: 'Small (466MB)' },
              { value: 'medium', label: 'Medium (1.5GB)' }
            ]}
          />
        )}

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
            { value: 'zh', label: 'Chinese' },
            { value: 'auto', label: 'Auto-detect' }
          ]}
        />
      </div>
    </div>
  )
}
