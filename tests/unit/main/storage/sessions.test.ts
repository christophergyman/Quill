import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Database from 'better-sqlite3'
import { runMigrations } from '../../../../src/main/storage/migrations'

// We test the session functions by directly using the DB since getDatabase()
// requires electron app context. We'll test the SQL logic directly.

describe('Session storage (in-memory SQLite)', () => {
  let db: Database.Database

  beforeEach(() => {
    db = new Database(':memory:')
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
    runMigrations(db)
  })

  afterEach(() => {
    db.close()
  })

  it('creates the sessions table', () => {
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='sessions'")
      .all()
    expect(tables).toHaveLength(1)
  })

  it('creates the diagrams table', () => {
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='diagrams'")
      .all()
    expect(tables).toHaveLength(1)
  })

  it('creates the FTS table', () => {
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='sessions_fts'")
      .all()
    expect(tables).toHaveLength(1)
  })

  it('inserts and retrieves a session', () => {
    const now = new Date().toISOString()
    db.prepare(
      `INSERT INTO sessions (id, created_at, updated_at, raw_text, duration_ms, voice_backend, llm_enabled, language)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run('test-1', now, now, 'Hello world', 5000, 'whisper-cloud', 0, 'en')

    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get('test-1') as {
      id: string
      raw_text: string
    }
    expect(session.id).toBe('test-1')
    expect(session.raw_text).toBe('Hello world')
  })

  it('supports FTS search', () => {
    const now = new Date().toISOString()
    db.prepare(
      `INSERT INTO sessions (id, created_at, updated_at, raw_text, duration_ms, voice_backend, llm_enabled, language)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      's1',
      now,
      now,
      'Meeting about the database migration plan',
      5000,
      'whisper-cloud',
      0,
      'en'
    )

    db.prepare(
      `INSERT INTO sessions (id, created_at, updated_at, raw_text, duration_ms, voice_backend, llm_enabled, language)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run('s2', now, now, 'Lunch order for tomorrow', 3000, 'whisper-cloud', 0, 'en')

    const results = db
      .prepare(
        `SELECT s.id FROM sessions s
         JOIN sessions_fts ON sessions_fts.rowid = s.rowid
         WHERE sessions_fts MATCH ?`
      )
      .all('database') as { id: string }[]

    expect(results).toHaveLength(1)
    expect(results[0].id).toBe('s1')
  })

  it('cascades diagram deletion with session', () => {
    const now = new Date().toISOString()
    db.prepare(
      `INSERT INTO sessions (id, created_at, updated_at, raw_text, duration_ms, voice_backend, llm_enabled, language)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run('s1', now, now, 'Test', 1000, 'whisper-cloud', 0, 'en')

    db.prepare(
      `INSERT INTO diagrams (id, session_id, tldraw_snapshot, created_at)
       VALUES (?, ?, ?, ?)`
    ).run('d1', 's1', '{}', now)

    // Verify diagram exists
    const before = db.prepare('SELECT * FROM diagrams WHERE session_id = ?').all('s1')
    expect(before).toHaveLength(1)

    // Delete session
    db.prepare('DELETE FROM sessions WHERE id = ?').run('s1')

    // Diagram should be cascade-deleted
    const after = db.prepare('SELECT * FROM diagrams WHERE session_id = ?').all('s1')
    expect(after).toHaveLength(0)
  })

  it('tracks schema version', () => {
    const row = db.prepare('SELECT MAX(version) as version FROM schema_version').get() as {
      version: number
    }
    expect(row.version).toBe(1)
  })

  it('does not re-run migrations', () => {
    // Run migrations again — should be a no-op
    runMigrations(db)
    const rows = db.prepare('SELECT * FROM schema_version').all()
    expect(rows).toHaveLength(1) // Still just version 1
  })
})
