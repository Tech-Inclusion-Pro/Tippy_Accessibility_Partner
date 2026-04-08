import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'fs'

let db: Database.Database | null = null

function getDbConfigPath(): string {
  return join(app.getPath('userData'), 'db-config.json')
}

function resolveDbPath(): string {
  const configPath = getDbConfigPath()
  if (existsSync(configPath)) {
    try {
      const config = JSON.parse(readFileSync(configPath, 'utf-8'))
      if (config.dbPath && typeof config.dbPath === 'string') {
        return config.dbPath
      }
    } catch {
      // Ignore invalid config, use default
    }
  }
  return join(app.getPath('userData'), 'tippy.db')
}

export function getDbPath(): string {
  return resolveDbPath()
}

export function setCustomDbPath(newDir: string): string {
  const newPath = join(newDir, 'tippy.db')
  const configPath = getDbConfigPath()
  writeFileSync(configPath, JSON.stringify({ dbPath: newPath }), 'utf-8')
  closeDatabase()
  initializeDatabase()
  return newPath
}

export function resetDbPath(): string {
  const configPath = getDbConfigPath()
  if (existsSync(configPath)) {
    unlinkSync(configPath)
  }
  closeDatabase()
  initializeDatabase()
  return join(app.getPath('userData'), 'tippy.db')
}

export function getDatabase(): Database.Database {
  if (!db) throw new Error('Database not initialized')
  return db
}

export function initializeDatabase(): void {
  const dbPath = resolveDbPath()
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS api_keys (
      provider_id TEXT PRIMARY KEY,
      encrypted_key TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS audit_history (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL CHECK(type IN ('text', 'url', 'chat', 'file')),
      input TEXT NOT NULL,
      result TEXT NOT NULL,
      scores TEXT,
      frameworks TEXT,
      provider TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS folders (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `)

  // Migration: update CHECK constraint if table already exists with old constraint
  try {
    db.prepare("INSERT INTO audit_history (id, type, input, result) VALUES ('__test__', 'file', '', '')").run()
    db.prepare("DELETE FROM audit_history WHERE id = '__test__'").run()
  } catch {
    // Old constraint doesn't allow 'file' — recreate the table
    db.exec(`
      CREATE TABLE IF NOT EXISTS audit_history_new (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL CHECK(type IN ('text', 'url', 'chat', 'file')),
        input TEXT NOT NULL,
        result TEXT NOT NULL,
        scores TEXT,
        frameworks TEXT,
        provider TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );
      INSERT INTO audit_history_new SELECT * FROM audit_history;
      DROP TABLE audit_history;
      ALTER TABLE audit_history_new RENAME TO audit_history;
    `)
  }

  // Migration: add folder_id column to audit_history
  try {
    db.prepare("SELECT folder_id FROM audit_history LIMIT 0").run()
  } catch {
    db.exec("ALTER TABLE audit_history ADD COLUMN folder_id TEXT REFERENCES folders(id) ON DELETE SET NULL")
  }
}

export function closeDatabase(): void {
  if (db) {
    db.close()
    db = null
  }
}
