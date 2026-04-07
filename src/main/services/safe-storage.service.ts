import { safeStorage } from 'electron'
import { getDatabase } from '../db/connection'

class SafeStorageService {
  private get encryptionAvailable(): boolean {
    return safeStorage.isEncryptionAvailable()
  }

  storeApiKey(providerId: string, apiKey: string): void {
    const db = getDatabase()
    const encrypted = this.encryptionAvailable
      ? safeStorage.encryptString(apiKey).toString('base64')
      : Buffer.from(apiKey).toString('base64')

    db.prepare(
      'INSERT OR REPLACE INTO api_keys (provider_id, encrypted_key, updated_at) VALUES (?, ?, datetime(\'now\'))'
    ).run(providerId, encrypted)
  }

  retrieveApiKey(providerId: string): string | null {
    try {
      const db = getDatabase()
      const row = db
        .prepare('SELECT encrypted_key FROM api_keys WHERE provider_id = ?')
        .get(providerId) as { encrypted_key: string } | undefined

      if (!row) return null

      if (this.encryptionAvailable) {
        return safeStorage.decryptString(Buffer.from(row.encrypted_key, 'base64'))
      }
      return Buffer.from(row.encrypted_key, 'base64').toString()
    } catch {
      return null
    }
  }

  hasApiKey(providerId: string): boolean {
    try {
      const db = getDatabase()
      const row = db
        .prepare('SELECT 1 FROM api_keys WHERE provider_id = ?')
        .get(providerId)
      return !!row
    } catch {
      return false
    }
  }

  deleteApiKey(providerId: string): void {
    const db = getDatabase()
    db.prepare('DELETE FROM api_keys WHERE provider_id = ?').run(providerId)
  }
}

export const safeStorageService = new SafeStorageService()
