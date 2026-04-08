import { getDatabase } from '../db/connection'
import { v4 as uuidv4 } from 'uuid'

export interface Folder {
  id: string
  name: string
  created_at: string
}

class FolderService {
  create(name: string): string {
    const db = getDatabase()
    const id = uuidv4()
    db.prepare('INSERT INTO folders (id, name) VALUES (?, ?)').run(id, name)
    return id
  }

  list(): Folder[] {
    const db = getDatabase()
    return db.prepare('SELECT * FROM folders ORDER BY name').all() as Folder[]
  }

  rename(id: string, name: string): void {
    const db = getDatabase()
    db.prepare('UPDATE folders SET name = ? WHERE id = ?').run(name, id)
  }

  delete(id: string): void {
    const db = getDatabase()
    db.prepare('DELETE FROM folders WHERE id = ?').run(id)
  }

  getItemCount(id: string): number {
    const db = getDatabase()
    return (
      db.prepare('SELECT COUNT(*) as count FROM audit_history WHERE folder_id = ?').get(id) as {
        count: number
      }
    ).count
  }
}

export const folderService = new FolderService()
