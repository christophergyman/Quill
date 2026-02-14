import { v4 as uuidv4 } from 'uuid'
import { getDatabase } from './database'
import type {
  Session,
  SessionListItem,
  SessionWithDiagrams,
  Diagram
} from '../../shared/types/session'
import { createLogger } from '../../shared/logger'

const logger = createLogger('sessions')

export function createSession(data: {
  rawText: string
  cleanedText?: string
  summary?: string
  durationMs: number
  voiceBackend: 'whisper-local' | 'whisper-cloud'
  llmEnabled: boolean
  language?: string
}): Session {
  const db = getDatabase()
  const id = uuidv4()
  const now = new Date().toISOString()

  db.prepare(
    `INSERT INTO sessions (id, created_at, updated_at, title, raw_text, cleaned_text, summary, duration_ms, voice_backend, llm_enabled, language)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    now,
    now,
    null,
    data.rawText,
    data.cleanedText || null,
    data.summary || null,
    data.durationMs,
    data.voiceBackend,
    data.llmEnabled ? 1 : 0,
    data.language || 'en'
  )

  logger.info('Session created: %s', id)
  return getSession(id)!
}

export function getSession(id: string): Session | null {
  const db = getDatabase()
  const row = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id) as SessionRow | undefined
  if (!row) return null
  return rowToSession(row)
}

export function getSessionWithDiagrams(id: string): SessionWithDiagrams | null {
  const session = getSession(id)
  if (!session) return null

  const db = getDatabase()
  const diagrams = db
    .prepare('SELECT * FROM diagrams WHERE session_id = ? ORDER BY created_at ASC')
    .all(id) as DiagramRow[]

  return {
    ...session,
    diagrams: diagrams.map(rowToDiagram)
  }
}

export function listSessions(query?: string): SessionListItem[] {
  const db = getDatabase()

  if (query && query.trim()) {
    const rows = db
      .prepare(
        `SELECT s.id, s.created_at, s.title, s.raw_text, s.duration_ms,
                EXISTS(SELECT 1 FROM diagrams d WHERE d.session_id = s.id) as has_diagram
         FROM sessions s
         JOIN sessions_fts ON sessions_fts.rowid = s.rowid
         WHERE sessions_fts MATCH ?
         ORDER BY s.created_at DESC`
      )
      .all(query.trim()) as SessionListRow[]

    return rows.map(rowToSessionListItem)
  }

  const rows = db
    .prepare(
      `SELECT s.id, s.created_at, s.title, s.raw_text, s.duration_ms,
              EXISTS(SELECT 1 FROM diagrams d WHERE d.session_id = s.id) as has_diagram
       FROM sessions s
       ORDER BY s.created_at DESC`
    )
    .all() as SessionListRow[]

  return rows.map(rowToSessionListItem)
}

export function updateSession(
  id: string,
  data: Partial<Pick<Session, 'title' | 'cleanedText' | 'summary'>>
): void {
  const db = getDatabase()
  const now = new Date().toISOString()
  const sets: string[] = ['updated_at = ?']
  const values: unknown[] = [now]

  if (data.title !== undefined) {
    sets.push('title = ?')
    values.push(data.title)
  }
  if (data.cleanedText !== undefined) {
    sets.push('cleaned_text = ?')
    values.push(data.cleanedText)
  }
  if (data.summary !== undefined) {
    sets.push('summary = ?')
    values.push(data.summary)
  }

  values.push(id)
  db.prepare(`UPDATE sessions SET ${sets.join(', ')} WHERE id = ?`).run(...values)
  logger.info('Session updated: %s', id)
}

export function deleteSession(id: string): void {
  const db = getDatabase()
  db.prepare('DELETE FROM sessions WHERE id = ?').run(id)
  logger.info('Session deleted: %s', id)
}

export function saveDiagram(sessionId: string, tldrawSnapshot: string, pngData?: Buffer): Diagram {
  const db = getDatabase()
  const id = uuidv4()
  const now = new Date().toISOString()

  db.prepare(
    `INSERT INTO diagrams (id, session_id, tldraw_snapshot, png_data, created_at)
     VALUES (?, ?, ?, ?, ?)`
  ).run(id, sessionId, tldrawSnapshot, pngData || null, now)

  logger.info('Diagram saved: %s for session %s', id, sessionId)
  return { id, sessionId, tldrawSnapshot, pngData: pngData || null, createdAt: now }
}

// --- Row types and converters ---

interface SessionRow {
  id: string
  created_at: string
  updated_at: string
  title: string | null
  raw_text: string
  cleaned_text: string | null
  summary: string | null
  duration_ms: number
  voice_backend: string
  llm_enabled: number
  language: string
  metadata: string | null
}

interface SessionListRow {
  id: string
  created_at: string
  title: string | null
  raw_text: string
  duration_ms: number
  has_diagram: number
}

interface DiagramRow {
  id: string
  session_id: string
  tldraw_snapshot: string | null
  png_data: Buffer | null
  created_at: string
}

function rowToSession(row: SessionRow): Session {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    title: row.title,
    rawText: row.raw_text,
    cleanedText: row.cleaned_text,
    summary: row.summary,
    durationMs: row.duration_ms,
    voiceBackend: row.voice_backend as Session['voiceBackend'],
    llmEnabled: row.llm_enabled === 1,
    language: row.language,
    metadata: row.metadata ? JSON.parse(row.metadata) : null
  }
}

function rowToSessionListItem(row: SessionListRow): SessionListItem {
  return {
    id: row.id,
    createdAt: row.created_at,
    title: row.title,
    rawText: row.raw_text,
    durationMs: row.duration_ms,
    hasDiagram: row.has_diagram === 1
  }
}

function rowToDiagram(row: DiagramRow): Diagram {
  return {
    id: row.id,
    sessionId: row.session_id,
    tldrawSnapshot: row.tldraw_snapshot,
    pngData: row.png_data,
    createdAt: row.created_at
  }
}
