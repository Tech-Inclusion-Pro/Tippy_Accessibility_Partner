import { getDatabase } from '../db/connection'

class SettingsService {
  get(key: string): string | null {
    const db = getDatabase()
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as
      | { value: string }
      | undefined
    return row?.value ?? null
  }

  set(key: string, value: string): void {
    const db = getDatabase()
    db.prepare(
      "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))"
    ).run(key, value)
  }

  getAll(): Record<string, string> {
    const db = getDatabase()
    const rows = db.prepare('SELECT key, value FROM settings').all() as {
      key: string
      value: string
    }[]
    const result: Record<string, string> = {}
    for (const row of rows) {
      result[row.key] = row.value
    }
    return result
  }

  delete(key: string): void {
    const db = getDatabase()
    db.prepare('DELETE FROM settings WHERE key = ?').run(key)
  }
}

export const settingsService = new SettingsService()
