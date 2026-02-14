import type Database from 'better-sqlite3'
import { createLogger } from '../../shared/logger'

const logger = createLogger('migrations')

const MIGRATIONS = [
  {
    version: 1,
    up: `
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        title TEXT,
        raw_text TEXT NOT NULL,
        cleaned_text TEXT,
        summary TEXT,
        duration_ms INTEGER NOT NULL DEFAULT 0,
        voice_backend TEXT NOT NULL DEFAULT 'whisper-cloud',
        llm_enabled INTEGER NOT NULL DEFAULT 0,
        language TEXT NOT NULL DEFAULT 'en',
        metadata TEXT
      );

      CREATE TABLE IF NOT EXISTS diagrams (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
        tldraw_snapshot TEXT,
        png_data BLOB,
        created_at TEXT NOT NULL
      );

      CREATE VIRTUAL TABLE IF NOT EXISTS sessions_fts USING fts5(
        title, raw_text, cleaned_text, summary,
        content='sessions',
        content_rowid='rowid'
      );

      CREATE TRIGGER IF NOT EXISTS sessions_ai AFTER INSERT ON sessions BEGIN
        INSERT INTO sessions_fts(rowid, title, raw_text, cleaned_text, summary)
        VALUES (new.rowid, new.title, new.raw_text, new.cleaned_text, new.summary);
      END;

      CREATE TRIGGER IF NOT EXISTS sessions_ad AFTER DELETE ON sessions BEGIN
        INSERT INTO sessions_fts(sessions_fts, rowid, title, raw_text, cleaned_text, summary)
        VALUES ('delete', old.rowid, old.title, old.raw_text, old.cleaned_text, old.summary);
      END;

      CREATE TRIGGER IF NOT EXISTS sessions_au AFTER UPDATE ON sessions BEGIN
        INSERT INTO sessions_fts(sessions_fts, rowid, title, raw_text, cleaned_text, summary)
        VALUES ('delete', old.rowid, old.title, old.raw_text, old.cleaned_text, old.summary);
        INSERT INTO sessions_fts(rowid, title, raw_text, cleaned_text, summary)
        VALUES (new.rowid, new.title, new.raw_text, new.cleaned_text, new.summary);
      END;
    `
  }
]

export function runMigrations(db: Database.Database): void {
  db.exec('CREATE TABLE IF NOT EXISTS schema_version (version INTEGER NOT NULL)')

  const row = db.prepare('SELECT MAX(version) as version FROM schema_version').get() as
    | { version: number | null }
    | undefined
  const currentVersion = row?.version ?? 0

  for (const migration of MIGRATIONS) {
    if (migration.version > currentVersion) {
      logger.info('Running migration v%d', migration.version)
      db.exec(migration.up)
      db.prepare('INSERT INTO schema_version (version) VALUES (?)').run(migration.version)
    }
  }
}
