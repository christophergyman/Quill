import Database from 'better-sqlite3'
import { app } from 'electron'
import { join, dirname } from 'path'
import { mkdirSync } from 'fs'
import { DB_FILENAME } from '../../shared/constants'
import { createLogger } from '../../shared/logger'
import { runMigrations } from './migrations'

const logger = createLogger('database')

let db: Database.Database | null = null

export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.')
  }
  return db
}

export function initDatabase(dbPath?: string): Database.Database {
  const dir = dbPath ? dirname(dbPath) : app.getPath('userData')
  const fullPath = dbPath || join(dir, DB_FILENAME)

  mkdirSync(dir, { recursive: true })

  logger.info('Opening database at: %s', fullPath)

  db = new Database(fullPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  runMigrations(db)

  logger.info('Database initialized')
  return db
}

export function closeDatabase(): void {
  if (db) {
    db.close()
    db = null
    logger.info('Database closed')
  }
}
