export const APP_NAME = 'Quill'
export const APP_ID = 'com.quill.app'

export const AUDIO_SAMPLE_RATE = 16000
export const AUDIO_CHANNELS = 1
export const AUDIO_CHUNK_DURATION_MS = 100

export const WHISPER_MODELS_DIR = 'models'

export const DB_FILENAME = 'quill.db'

export const LOG_FILENAME = 'quill.log'

// API request timeouts (ms)
export const WHISPER_API_TIMEOUT_MS = 60_000
export const OPENAI_CHAT_TIMEOUT_MS = 30_000
export const OLLAMA_CHAT_TIMEOUT_MS = 120_000

// IPC validation limits
export const MAX_CLIPBOARD_LENGTH = 1_000_000
export const MAX_AUDIO_CHUNK_SAMPLES = 960_000
export const MAX_DIAGRAM_DATA_LENGTH = 10_000_000
