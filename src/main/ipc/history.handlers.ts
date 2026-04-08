import { ipcMain, BrowserWindow, dialog } from 'electron'
import { historyService } from '../services/history.service'
import { getProviderManager } from '../services/provider-manager'
import { getDbPath, setCustomDbPath, resetDbPath } from '../db/connection'

export function registerHistoryHandlers(): void {
  ipcMain.handle('history:report-themes', async (event) => {
    try {
      const window = BrowserWindow.fromWebContents(event.sender)
      if (!window) throw new Error('No window')

      const { items } = historyService.list(1, 100)
      if (items.length === 0) {
        return { success: false, error: 'No history items found. Use TIPPY first to build up history.' }
      }

      const summary = items
        .map(
          (item, i) =>
            `${i + 1}. [${item.type}] Input: ${item.input.substring(0, 200)}${item.input.length > 200 ? '...' : ''}\n   Result excerpt: ${item.result.substring(0, 200)}${item.result.length > 200 ? '...' : ''}\n   Frameworks: ${item.frameworks || 'none'}`
        )
        .join('\n\n')

      const systemPrompt = `You are TIPPY, an AI accessibility partner. You are generating a "Themes Report" that analyzes patterns across a user's accessibility audit history.

Below is a summary of the user's recent accessibility audits and chat sessions. Analyze them and produce a comprehensive themes report.

Structure your report with these sections:
## Themes Overview
A high-level summary of the recurring themes and patterns you observe.

## Common Issues
The most frequent accessibility issues found across analyses.

## Framework Insights
Which frameworks (WCAG, UDL, DisCrit, Plain Language) appear most and what the results reveal about each.

## Growth Areas
What the user does well and where there is room for improvement.

## Recommendations
Specific, actionable learning recommendations based on the patterns.

Here is the history data:

${summary}`

      const messages = [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: 'Please generate my themes report based on my accessibility audit history.' }
      ]

      const provider = await getProviderManager().getActiveProvider()
      let fullResponse = ''

      await provider.stream(messages, {
        onToken: (token: string) => {
          fullResponse += token
          window.webContents.send('history:report-stream-token', { token, done: false })
        },
        onDone: () => {
          window.webContents.send('history:report-stream-token', { token: '', done: true })
        },
        onError: (error: string) => {
          window.webContents.send('history:report-stream-token', {
            token: `\n\n[Error: ${error}]`,
            done: true
          })
        }
      })

      const id = historyService.save({
        type: 'chat',
        input: 'Themes Report',
        result: fullResponse,
        scores: null,
        frameworks: null,
        provider: null
      })

      return { success: true, data: { id } }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

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

  ipcMain.handle('history:move-to-folder', async (_event, ids: string | string[], folderId: string | null) => {
    try {
      const idArray = Array.isArray(ids) ? ids : [ids]
      if (idArray.length === 1) {
        historyService.updateFolder(idArray[0], folderId)
      } else {
        historyService.bulkUpdateFolder(idArray, folderId)
      }
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('history:get-db-path', async () => {
    try {
      return { success: true, data: getDbPath() }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('history:set-db-path', async (event) => {
    try {
      const window = BrowserWindow.fromWebContents(event.sender)
      if (!window) throw new Error('No window')

      const result = await dialog.showOpenDialog(window, {
        title: 'Choose Database Location',
        properties: ['openDirectory', 'createDirectory']
      })

      if (result.canceled || result.filePaths.length === 0) {
        return { success: true, data: { canceled: true, path: getDbPath() } }
      }

      const newPath = setCustomDbPath(result.filePaths[0])
      return { success: true, data: { canceled: false, path: newPath } }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('history:reset-db-path', async () => {
    try {
      const defaultPath = resetDbPath()
      return { success: true, data: defaultPath }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
