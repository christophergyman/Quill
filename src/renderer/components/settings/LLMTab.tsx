import type { LLMSettings } from '@shared/types/settings'
import { Toggle } from '../ui/Toggle'
import { Select } from '../ui/Select'
import { Input } from '../ui/Input'

interface LLMTabProps {
  settings: LLMSettings
  onChange: (settings: LLMSettings) => void
}

export function LLMTab({ settings, onChange }: LLMTabProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-neutral-900 mb-4">LLM Post-Processing</h2>

      <div className="space-y-4">
        <Toggle
          label="Enable LLM cleanup"
          description="Clean up filler words and grammar after transcription"
          checked={settings.enabled}
          onChange={(checked) => onChange({ ...settings, enabled: checked })}
        />

        {settings.enabled && (
          <>
            <Select
              label="Backend"
              value={settings.backend}
              onChange={(e) =>
                onChange({ ...settings, backend: e.target.value as LLMSettings['backend'] })
              }
              options={[
                { value: 'openai', label: 'OpenAI GPT' },
                { value: 'ollama', label: 'Ollama (Local)' }
              ]}
            />

            {settings.backend === 'openai' && (
              <>
                <Input
                  label="OpenAI API Key"
                  type="password"
                  placeholder="sk-..."
                  value={settings.openaiApiKey}
                  onChange={(e) => onChange({ ...settings, openaiApiKey: e.target.value })}
                  hint="Your API key is encrypted and stored locally"
                />
                <Select
                  label="Model"
                  value={settings.openaiModel}
                  onChange={(e) => onChange({ ...settings, openaiModel: e.target.value })}
                  options={[
                    { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Fast, cheap)' },
                    { value: 'gpt-4o', label: 'GPT-4o (Better quality)' }
                  ]}
                />
              </>
            )}

            {settings.backend === 'ollama' && (
              <>
                <Input
                  label="Ollama URL"
                  value={settings.ollamaUrl}
                  onChange={(e) => onChange({ ...settings, ollamaUrl: e.target.value })}
                  hint="Default: http://localhost:11434"
                />
                <Input
                  label="Model"
                  value={settings.ollamaModel}
                  onChange={(e) => onChange({ ...settings, ollamaModel: e.target.value })}
                  hint="e.g., llama3.2, mistral, gemma2"
                />
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
