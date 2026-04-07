import { ipcMain, BrowserWindow, dialog } from 'electron'
import { writeFileSync } from 'fs'
import { analyzeFile } from '../services/file-analyzer'
import { generateDocx } from '../services/docx-exporter'
import { getSupportedExtensions } from '../services/file-extractor'
import { historyService } from '../services/history.service'

export function registerFileHandlers(): void {
  // Open file dialog and analyze
  ipcMain.handle('analyze:file', async (event, frameworks: string[]) => {
    try {
      const window = BrowserWindow.fromWebContents(event.sender)
      if (!window) throw new Error('No window')

      const extensions = getSupportedExtensions().map((e) => e.slice(1)) // remove dots
      const result = await dialog.showOpenDialog(window, {
        title: 'Select a document to review',
        filters: [{ name: 'Documents', extensions }],
        properties: ['openFile']
      })

      if (result.canceled || result.filePaths.length === 0) {
        return { success: true, data: { canceled: true } }
      }

      const filePath = result.filePaths[0]
      const analysisResult = await analyzeFile(filePath, frameworks, window)
      return { success: true, data: { ...analysisResult, filePath } }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Analyze a file by path (for drag-and-drop)
  ipcMain.handle('analyze:file-path', async (event, filePath: string, frameworks: string[]) => {
    try {
      const window = BrowserWindow.fromWebContents(event.sender)
      if (!window) throw new Error('No window')

      const result = await analyzeFile(filePath, frameworks, window)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Export analysis as DOCX
  ipcMain.handle(
    'export:docx',
    async (event, options: { content: string; title?: string; frameworks?: string[] }) => {
      try {
        const window = BrowserWindow.fromWebContents(event.sender)
        if (!window) throw new Error('No window')

        const buffer = await generateDocx(options)

        const saveResult = await dialog.showSaveDialog(window, {
          title: 'Save Analysis Report',
          defaultPath: `tippy-analysis-${Date.now()}.docx`,
          filters: [{ name: 'Word Document', extensions: ['docx'] }]
        })

        if (saveResult.canceled || !saveResult.filePath) {
          return { success: true, data: { saved: false } }
        }

        writeFileSync(saveResult.filePath, buffer)
        return { success: true, data: { saved: true, path: saveResult.filePath } }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    }
  )
}
