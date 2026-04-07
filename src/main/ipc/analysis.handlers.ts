import { ipcMain, BrowserWindow } from 'electron'
import { getWindowManager } from '../index'
import { analyzeText } from '../services/analysis-engine'
import { analyzeUrl } from '../services/url-analyzer'

export function registerAnalysisHandlers(): void {
  ipcMain.handle('analyze:text', async (event, text: string, frameworks: string[]) => {
    try {
      const window = BrowserWindow.fromWebContents(event.sender)
      if (!window) throw new Error('No window')
      const result = await analyzeText(text, frameworks, window)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('analyze:url', async (event, url: string, frameworks: string[]) => {
    try {
      const window = BrowserWindow.fromWebContents(event.sender)
      if (!window) throw new Error('No window')
      const result = await analyzeUrl(url, frameworks, window)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
