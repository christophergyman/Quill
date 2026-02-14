export interface AppSettings {
  general: GeneralSettings
  voice: VoiceSettings
  llm: LLMSettings
  shortcuts: ShortcutSettings
}

export interface GeneralSettings {
  launchAtLogin: boolean
  showDockIcon: boolean
  language: string
}

export interface VoiceSettings {
  backend: 'whisper-local' | 'whisper-cloud'
  model: string
  language: string
  openaiApiKey: string
}

export interface LLMSettings {
  enabled: boolean
  backend: 'openai' | 'ollama'
  openaiModel: string
  openaiApiKey: string
  ollamaUrl: string
  ollamaModel: string
}

export interface ShortcutSettings {
  toggleOverlay: string
  toggleDrawing: string
  holdToRecord: string
}

export const DEFAULT_SETTINGS: AppSettings = {
  general: {
    launchAtLogin: false,
    showDockIcon: false,
    language: 'en'
  },
  voice: {
    backend: 'whisper-cloud',
    model: 'whisper-1',
    language: 'en',
    openaiApiKey: ''
  },
  llm: {
    enabled: false,
    backend: 'openai',
    openaiModel: 'gpt-4o-mini',
    openaiApiKey: '',
    ollamaUrl: 'http://localhost:11434',
    ollamaModel: 'llama3.2'
  },
  shortcuts: {
    toggleOverlay: 'CommandOrControl+Shift+Space',
    toggleDrawing: 'CommandOrControl+Shift+D',
    holdToRecord: 'CommandOrControl+Shift+;'
  }
}
