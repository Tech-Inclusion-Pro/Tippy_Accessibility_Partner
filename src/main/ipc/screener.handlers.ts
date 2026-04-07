import { ipcMain, dialog, BrowserWindow } from 'electron'
import { readFileSync } from 'fs'
import { basename } from 'path'
import { screenerService } from '../services/screener.service'

export function registerScreenerHandlers(): void {
  // List all screeners (built-in + custom), without content for performance
  ipcMain.handle('screener:list', async () => {
    try {
      const screeners = screenerService.getAll()
      return { success: true, data: screeners }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Get full content of a specific screener
  ipcMain.handle('screener:getContent', async (_event, id: string) => {
    try {
      const content = screenerService.getContent(id)
      if (!content) return { success: false, error: 'Screener not found' }
      return { success: true, data: content }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Add a custom screener from text content
  ipcMain.handle('screener:addCustom', async (_event, filename: string, content: string) => {
    try {
      const screener = screenerService.addCustom(filename, content)
      return { success: true, data: screener }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Import a custom screener via file picker
  ipcMain.handle('screener:import', async (event) => {
    try {
      const win = BrowserWindow.fromWebContents(event.sender)
      const result = await dialog.showOpenDialog(win!, {
        title: 'Import Screener File',
        filters: [{ name: 'Markdown', extensions: ['md'] }],
        properties: ['openFile', 'multiSelections']
      })

      if (result.canceled || result.filePaths.length === 0) {
        return { success: true, data: [] }
      }

      const imported: any[] = []
      for (const filePath of result.filePaths) {
        const content = readFileSync(filePath, 'utf-8')
        const filename = basename(filePath)
        const screener = screenerService.addCustom(filename, content)
        imported.push(screener)
      }

      return { success: true, data: imported }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Delete a custom screener (built-in cannot be deleted)
  ipcMain.handle('screener:delete', async (_event, id: string) => {
    try {
      const deleted = screenerService.deleteCustom(id)
      if (!deleted) return { success: false, error: 'Cannot delete built-in screener' }
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Export/download a screener file
  ipcMain.handle('screener:export', async (event, id: string) => {
    try {
      const content = screenerService.getContent(id)
      if (!content) return { success: false, error: 'Screener not found' }

      const screeners = screenerService.getAll()
      const screener = screeners.find((s) => s.id === id)
      if (!screener) return { success: false, error: 'Screener not found' }

      const win = BrowserWindow.fromWebContents(event.sender)
      const result = await dialog.showSaveDialog(win!, {
        title: 'Save Screener',
        defaultPath: screener.filename,
        filters: [{ name: 'Markdown', extensions: ['md'] }]
      })

      if (result.canceled || !result.filePath) {
        return { success: true, data: { saved: false } }
      }

      const { writeFileSync } = await import('fs')
      writeFileSync(result.filePath, content, 'utf-8')
      return { success: true, data: { saved: true, path: result.filePath } }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
