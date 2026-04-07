import { ipcMain } from 'electron'
import { historyService } from '../services/history.service'

export function registerHistoryHandlers(): void {
  ipcMain.handle('history:list', async (_event, page: number = 1, limit: number = 20, filters?: any) => {
    try {
      const data = historyService.list(page, limit, filters)
      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('history:get', async (_event, id: string) => {
    try {
      const data = historyService.get(id)
      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('history:delete', async (_event, id: string) => {
    try {
      historyService.delete(id)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
