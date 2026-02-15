import type { LLMSettings } from '@shared/types/settings'
import { Switch } from '../ui/switch'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

interface LLMTabProps {
  settings: LLMSettings
  onChange: (settings: LLMSettings) => void
}

export function LLMTab({ settings, onChange }: LLMTabProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-4">LLM Post-Processing</h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between py-2">
          <div>
            <Label htmlFor="llm-enabled">Enable LLM cleanup</Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Clean up filler words and grammar after transcription
            </p>
          </div>
          <Switch
            id="llm-enabled"
            checked={settings.enabled}
            onCheckedChange={(checked) => onChange({ ...settings, enabled: checked })}
          />
        </div>

        {settings.enabled && (
          <>
            <div>
              <Label className="text-xs mb-1">Backend</Label>
              <Select
                value={settings.backend}
                onValueChange={(value) =>
                  onChange({ ...settings, backend: value as LLMSettings['backend'] })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI GPT</SelectItem>
                  <SelectItem value="ollama">Ollama (Local)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {settings.backend === 'openai' && (
              <>
                <div>
                  <Label htmlFor="llm-api-key" className="text-xs mb-1">
                    OpenAI API Key
                  </Label>
                  <Input
                    id="llm-api-key"
                    type="password"
                    placeholder="sk-..."
                    value={settings.openaiApiKey}
                    onChange={(e) => onChange({ ...settings, openaiApiKey: e.target.value })}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Your API key is encrypted and stored locally
                  </p>
                </div>
                <div>
                  <Label className="text-xs mb-1">Model</Label>
                  <Select
                    value={settings.openaiModel}
                    onValueChange={(value) => onChange({ ...settings, openaiModel: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o-mini">GPT-4o Mini (Fast, cheap)</SelectItem>
                      <SelectItem value="gpt-4o">GPT-4o (Better quality)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {settings.backend === 'ollama' && (
              <>
                <div>
                  <Label htmlFor="ollama-url" className="text-xs mb-1">
                    Ollama URL
                  </Label>
                  <Input
                    id="ollama-url"
                    value={settings.ollamaUrl}
                    onChange={(e) => onChange({ ...settings, ollamaUrl: e.target.value })}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Default: http://localhost:11434
                  </p>
                </div>
                <div>
                  <Label htmlFor="ollama-model" className="text-xs mb-1">
                    Model
                  </Label>
                  <Input
                    id="ollama-model"
                    value={settings.ollamaModel}
                    onChange={(e) => onChange({ ...settings, ollamaModel: e.target.value })}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    e.g., llama3.2, mistral, gemma2
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
