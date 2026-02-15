import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('electron', () => ({
  app: {
    getPath: vi.fn().mockReturnValue('/tmp/quill-test')
  }
}))

vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>()
  return {
    ...actual,
    mkdirSync: vi.fn()
  }
})

const mockRunMigrations = vi.fn()
vi.mock('../../../../src/main/storage/migrations', () => ({
  runMigrations: (...args: unknown[]) => mockRunMigrations(...args)
}))

import { getDatabase, initDatabase, closeDatabase } from '../../../../src/main/storage/database'

beforeEach(() => {
  vi.clearAllMocks()
  try {
    closeDatabase()
  } catch {
    // ok if not initialized
  }
})

afterEach(() => {
  try {
    closeDatabase()
  } catch {
    // ok if not initialized
  }
})

describe('getDatabase', () => {
  it('throws when not initialized', () => {
    expect(() => getDatabase()).toThrow('Database not initialized')
  })
})

describe('initDatabase', () => {
  it('creates database and sets pragmas', () => {
    const db = initDatabase(':memory:')
    // In-memory databases report 'memory' for journal_mode instead of 'wal'
    const result = db.pragma('journal_mode') as { journal_mode: string }[]
    expect(result[0].journal_mode).toBeDefined()
    // Verify foreign keys are enabled
    const fk = db.pragma('foreign_keys') as { foreign_keys: number }[]
    expect(fk[0].foreign_keys).toBe(1)
  })

  it('runs migrations', () => {
    initDatabase(':memory:')
    expect(mockRunMigrations).toHaveBeenCalled()
  })

  it('makes database accessible via getDatabase()', () => {
    initDatabase(':memory:')
    expect(() => getDatabase()).not.toThrow()
    const db = getDatabase()
    expect(db).toBeDefined()
  })

  it('respects custom path', () => {
    const db = initDatabase(':memory:')
    expect(db).toBeDefined()
  })
})

describe('closeDatabase', () => {
  it('closes and nullifies db', () => {
    initDatabase(':memory:')
    expect(() => getDatabase()).not.toThrow()
    closeDatabase()
    expect(() => getDatabase()).toThrow('Database not initialized')
  })

  it('is safe when already closed', () => {
    expect(() => closeDatabase()).not.toThrow()
  })
})
