import { getDatabase } from '../db/connection'
import { v4 as uuidv4 } from 'uuid'

export interface AuditRecord {
  id: string
  type: 'text' | 'url' | 'chat' | 'file'
  input: string
  result: string
  scores: string | null
  frameworks: string | null
  provider: string | null
  folder_id: string | null
  created_at: string
}

class HistoryService {
  save(record: Omit<AuditRecord, 'id' | 'created_at'> & { folder_id?: string | null }): string {
    const db = getDatabase()
    const id = uuidv4()
    db.prepare(
      'INSERT INTO audit_history (id, type, input, result, scores, frameworks, provider, folder_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(id, record.type, record.input, record.result, record.scores, record.frameworks, record.provider, record.folder_id ?? null)
    return id
  }

  get(id: string): AuditRecord | null {
    const db = getDatabase()
    return (db.prepare('SELECT * FROM audit_history WHERE id = ?').get(id) as AuditRecord) || null
  }

  list(
    page: number = 1,
    limit: number = 20,
    filters?: { type?: string; startDate?: string; endDate?: string; search?: string; folderId?: string | null }
  ): { items: AuditRecord[]; total: number } {
    const db = getDatabase()
    let where = 'WHERE 1=1'
    const params: any[] = []

    if (filters?.type) {
      where += ' AND type = ?'
      params.push(filters.type)
    }
    if (filters?.startDate) {
      where += ' AND created_at >= ?'
      params.push(filters.startDate)
    }
    if (filters?.endDate) {
      where += ' AND created_at <= ?'
      params.push(filters.endDate)
    }
    if (filters?.search) {
      where += ' AND (input LIKE ? OR result LIKE ?)'
      const term = `%${filters.search}%`
      params.push(term, term)
    }
    if (filters?.folderId !== undefined && filters?.folderId !== null) {
      if (filters.folderId === '__unfiled__') {
        where += ' AND folder_id IS NULL'
      } else {
        where += ' AND folder_id = ?'
        params.push(filters.folderId)
      }
    }

    const total = (
      db.prepare(`SELECT COUNT(*) as count FROM audit_history ${where}`).get(...params) as {
        count: number
      }
    ).count

    const offset = (page - 1) * limit
    const items = db
      .prepare(`SELECT * FROM audit_history ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
      .all(...params, limit, offset) as AuditRecord[]

    return { items, total }
  }

  delete(id: string): void {
    const db = getDatabase()
    db.prepare('DELETE FROM audit_history WHERE id = ?').run(id)
  }

  updateFolder(id: string, folderId: string | null): void {
    const db = getDatabase()
    db.prepare('UPDATE audit_history SET folder_id = ? WHERE id = ?').run(folderId, id)
  }

  bulkUpdateFolder(ids: string[], folderId: string | null): void {
    const db = getDatabase()
    const update = db.prepare('UPDATE audit_history SET folder_id = ? WHERE id = ?')
    const transaction = db.transaction((itemIds: string[]) => {
      for (const id of itemIds) {
        update.run(folderId, id)
      }
    })
    transaction(ids)
  }
}

export const historyService = new HistoryService()
