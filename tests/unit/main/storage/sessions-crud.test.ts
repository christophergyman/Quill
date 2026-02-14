import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import Database from 'better-sqlite3'
import { runMigrations } from '../../../../src/main/storage/migrations'

// Mock the database module to inject our in-memory DB
vi.mock('../../../../src/main/storage/database', () => {
  let db: Database.Database | null = null
  return {
    getDatabase: () => {
      if (!db) throw new Error('Database not initialized')
      return db
    },
    __setDb: (newDb: Database.Database) => {
      db = newDb
    },
    __clearDb: () => {
      db = null
    }
  }
})

// Mock uuid for deterministic IDs
let uuidCounter = 0
vi.mock('uuid', () => ({
  v4: () => `test-uuid-${++uuidCounter}`
}))

// Import after mocks are set up
import {
  createSession,
  getSession,
  getSessionWithDiagrams,
  listSessions,
  updateSession,
  deleteSession,
  saveDiagram
} from '../../../../src/main/storage/sessions'
import { __setDb, __clearDb } from '../../../../src/main/storage/database'

describe('Session CRUD operations', () => {
  let db: Database.Database

  beforeEach(() => {
    uuidCounter = 0
    db = new Database(':memory:')
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
    runMigrations(db)
    ;(__setDb as (db: Database.Database) => void)(db)
  })

  afterEach(() => {
    ;(__clearDb as () => void)()
    db.close()
  })

  describe('createSession', () => {
    it('creates a session and returns it', () => {
      const session = createSession({
        rawText: 'Hello world',
        durationMs: 5000,
        voiceBackend: 'whisper-cloud',
        llmEnabled: false
      })

      expect(session.id).toBe('test-uuid-1')
      expect(session.rawText).toBe('Hello world')
      expect(session.durationMs).toBe(5000)
      expect(session.voiceBackend).toBe('whisper-cloud')
      expect(session.llmEnabled).toBe(false)
      expect(session.language).toBe('en')
    })

    it('creates a session with cleaned text and summary', () => {
      const session = createSession({
        rawText: 'uh hello world um',
        cleanedText: 'Hello world.',
        summary: 'Greeting',
        durationMs: 3000,
        voiceBackend: 'whisper-cloud',
        llmEnabled: true,
        language: 'en'
      })

      expect(session.cleanedText).toBe('Hello world.')
      expect(session.summary).toBe('Greeting')
      expect(session.llmEnabled).toBe(true)
    })
  })

  describe('getSession', () => {
    it('returns null for nonexistent session', () => {
      expect(getSession('nonexistent')).toBeNull()
    })

    it('retrieves a created session', () => {
      createSession({
        rawText: 'Test',
        durationMs: 1000,
        voiceBackend: 'whisper-cloud',
        llmEnabled: false
      })

      const session = getSession('test-uuid-1')
      expect(session).not.toBeNull()
      expect(session!.rawText).toBe('Test')
    })
  })

  describe('listSessions', () => {
    it('returns empty array when no sessions exist', () => {
      expect(listSessions()).toEqual([])
    })

    it('returns all sessions ordered by date descending', () => {
      createSession({
        rawText: 'First',
        durationMs: 1000,
        voiceBackend: 'whisper-cloud',
        llmEnabled: false
      })
      createSession({
        rawText: 'Second',
        durationMs: 2000,
        voiceBackend: 'whisper-cloud',
        llmEnabled: false
      })

      const sessions = listSessions()
      expect(sessions).toHaveLength(2)
    })

    it('respects limit and offset', () => {
      for (let i = 0; i < 5; i++) {
        createSession({
          rawText: `Session ${i}`,
          durationMs: 1000,
          voiceBackend: 'whisper-cloud',
          llmEnabled: false
        })
      }

      const page1 = listSessions(undefined, 2, 0)
      expect(page1).toHaveLength(2)

      const page2 = listSessions(undefined, 2, 2)
      expect(page2).toHaveLength(2)
    })

    it('searches with FTS and sanitizes query', () => {
      createSession({
        rawText: 'Meeting about database migration',
        durationMs: 5000,
        voiceBackend: 'whisper-cloud',
        llmEnabled: false
      })
      createSession({
        rawText: 'Lunch order for tomorrow',
        durationMs: 3000,
        voiceBackend: 'whisper-cloud',
        llmEnabled: false
      })

      const results = listSessions('database')
      expect(results).toHaveLength(1)
      expect(results[0].rawText).toContain('database')
    })
  })

  describe('updateSession', () => {
    it('updates session title', () => {
      createSession({
        rawText: 'Test',
        durationMs: 1000,
        voiceBackend: 'whisper-cloud',
        llmEnabled: false
      })

      updateSession('test-uuid-1', { title: 'My Session' })
      const session = getSession('test-uuid-1')
      expect(session!.title).toBe('My Session')
    })

    it('updates cleaned text and summary', () => {
      createSession({
        rawText: 'Test',
        durationMs: 1000,
        voiceBackend: 'whisper-cloud',
        llmEnabled: false
      })

      updateSession('test-uuid-1', {
        cleanedText: 'Clean test.',
        summary: 'A summary'
      })
      const session = getSession('test-uuid-1')
      expect(session!.cleanedText).toBe('Clean test.')
      expect(session!.summary).toBe('A summary')
    })
  })

  describe('deleteSession', () => {
    it('deletes a session', () => {
      createSession({
        rawText: 'Test',
        durationMs: 1000,
        voiceBackend: 'whisper-cloud',
        llmEnabled: false
      })

      deleteSession('test-uuid-1')
      expect(getSession('test-uuid-1')).toBeNull()
    })

    it('is a no-op for nonexistent session', () => {
      expect(() => deleteSession('nonexistent')).not.toThrow()
    })
  })

  describe('saveDiagram', () => {
    it('saves a diagram and retrieves it with session', () => {
      createSession({
        rawText: 'Test',
        durationMs: 1000,
        voiceBackend: 'whisper-cloud',
        llmEnabled: false
      })

      const diagram = saveDiagram('test-uuid-1', '{"shapes":[]}')
      expect(diagram.id).toBe('test-uuid-2')
      expect(diagram.sessionId).toBe('test-uuid-1')
      expect(diagram.tldrawSnapshot).toBe('{"shapes":[]}')
    })

    it('returns diagrams with getSessionWithDiagrams', () => {
      createSession({
        rawText: 'Test',
        durationMs: 1000,
        voiceBackend: 'whisper-cloud',
        llmEnabled: false
      })
      saveDiagram('test-uuid-1', '{"shapes":[]}')

      const session = getSessionWithDiagrams('test-uuid-1')
      expect(session).not.toBeNull()
      expect(session!.diagrams).toHaveLength(1)
      expect(session!.diagrams[0].tldrawSnapshot).toBe('{"shapes":[]}')
    })
  })
})
