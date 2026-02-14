export interface Session {
  id: string
  createdAt: string
  updatedAt: string
  title: string | null
  rawText: string
  cleanedText: string | null
  summary: string | null
  durationMs: number
  voiceBackend: 'whisper-local' | 'whisper-cloud'
  llmEnabled: boolean
  language: string
  metadata: Record<string, unknown> | null
}

export interface Diagram {
  id: string
  sessionId: string
  tldrawSnapshot: string | null
  pngData: Buffer | null
  createdAt: string
}

export interface SessionWithDiagrams extends Session {
  diagrams: Diagram[]
}

export interface SessionListItem {
  id: string
  createdAt: string
  title: string | null
  rawText: string
  durationMs: number
  hasDiagram: boolean
}
