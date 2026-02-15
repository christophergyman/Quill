import type {
  Session,
  SessionListItem,
  SessionWithDiagrams,
  Diagram
} from '../../src/shared/types/session'
import type { AppSettings } from '../../src/shared/types/settings'
import type { TranscriptionResult, RecordingStatePayload } from '../../src/shared/types/ipc'

// ---------------------------------------------------------------------------
// DeepPartial utility — allows nested partial overrides for settings etc.
// ---------------------------------------------------------------------------
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------
let counter = 0

function nextId(prefix: string): string {
  counter += 1
  return `${prefix}-${counter}`
}

const BASE_DATE = new Date('2024-01-01T00:00:00.000Z')

function offsetDate(offset: number): string {
  const d = new Date(BASE_DATE.getTime() + offset * 60_000)
  return d.toISOString()
}

function deepMerge<T extends Record<string, unknown>>(base: T, overrides: DeepPartial<T>): T {
  const result = { ...base }
  for (const key of Object.keys(overrides) as (keyof T)[]) {
    const overrideVal = overrides[key]
    const baseVal = base[key]
    if (
      overrideVal !== null &&
      overrideVal !== undefined &&
      typeof overrideVal === 'object' &&
      !Array.isArray(overrideVal) &&
      typeof baseVal === 'object' &&
      baseVal !== null &&
      !Array.isArray(baseVal)
    ) {
      result[key] = deepMerge(
        baseVal as Record<string, unknown>,
        overrideVal as DeepPartial<Record<string, unknown>>
      ) as T[keyof T]
    } else {
      result[key] = overrideVal as T[keyof T]
    }
  }
  return result
}

/**
 * Reset the internal counter. Useful in `beforeEach` to get deterministic IDs
 * across test runs.
 */
export function resetFactoryCounter(): void {
  counter = 0
}

// ---------------------------------------------------------------------------
// Factory functions
// ---------------------------------------------------------------------------

export function createMockSession(overrides?: Partial<Session>): Session {
  const id = nextId('session')
  const ts = offsetDate(counter)
  return {
    id,
    createdAt: ts,
    updatedAt: ts,
    title: `Session ${counter}`,
    rawText: 'Mock transcription text',
    cleanedText: null,
    summary: null,
    durationMs: 5000,
    voiceBackend: 'whisper-cloud',
    llmEnabled: false,
    language: 'en',
    metadata: null,
    ...overrides
  }
}

export function createMockSessionListItem(overrides?: Partial<SessionListItem>): SessionListItem {
  const id = nextId('session')
  const ts = offsetDate(counter)
  return {
    id,
    createdAt: ts,
    title: `Session ${counter}`,
    rawText: 'Mock transcription text',
    durationMs: 5000,
    hasDiagram: false,
    ...overrides
  }
}

export function createMockDiagram(overrides?: Partial<Diagram>): Diagram {
  const id = nextId('diagram')
  const ts = offsetDate(counter)
  return {
    id,
    sessionId: nextId('session'),
    tldrawSnapshot: null,
    pngData: null,
    createdAt: ts,
    ...overrides
  }
}

export function createMockSessionWithDiagrams(
  overrides?: Partial<SessionWithDiagrams>
): SessionWithDiagrams {
  const { diagrams, ...sessionOverrides } = overrides ?? {}
  const session = createMockSession(sessionOverrides)
  return {
    ...session,
    diagrams: diagrams ?? []
  }
}

export function createMockSettings(overrides?: DeepPartial<AppSettings>): AppSettings {
  const defaults: AppSettings = {
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

  if (!overrides) return defaults
  return deepMerge(defaults, overrides)
}

export function createMockTranscriptionResult(
  overrides?: Partial<TranscriptionResult>
): TranscriptionResult {
  const id = nextId('session')
  return {
    sessionId: id,
    rawText: 'Mock transcription text',
    durationMs: 5000,
    ...overrides
  }
}

export function createMockRecordingStatePayload(
  overrides?: Partial<RecordingStatePayload>
): RecordingStatePayload {
  return {
    state: 'idle',
    ...overrides
  }
}
