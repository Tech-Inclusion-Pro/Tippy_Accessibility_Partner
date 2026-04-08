import { ipcMain } from 'electron'
import { folderService } from '../services/folder.service'

export function registerFolderHandlers(): void {
  ipcMain.handle('folder:list', async () => {
    try {
      const folders = folderService.list()
      const data = folders.map((f) => ({
        ...f,
        itemCount: folderService.getItemCount(f.id)
      }))
      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('folder:create', async (_event, name: string) => {
    try {
      const id = folderService.create(name)
      return { success: true, data: { id } }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('folder:rename', async (_event, id: string, name: string) => {
    try {
      folderService.rename(id, name)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('folder:delete', async (_event, id: string) => {
    try {
      folderService.delete(id)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
