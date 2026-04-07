import { ipcMain, BrowserWindow } from 'electron'
import { getProviderManager } from '../services/provider-manager'
import { buildTippySystemPrompt } from '../services/prompt-builder'
import { screenerService } from '../services/screener.service'
import { settingsService } from '../services/settings.service'

export function registerChatHandlers(): void {
  ipcMain.handle('chat:message', async (event, message: string, history: any[], frameworks: string[]) => {
    try {
      const window = BrowserWindow.fromWebContents(event.sender)
      if (!window) throw new Error('No window')

      // Load screener content for active frameworks
      const screeners = screenerService.getScreenersForFrameworks(frameworks)
      const screenerContent = screeners.map((s) => ({ name: s.name, content: s.content }))

      const userName = settingsService.get('user_name') || undefined
      const userContext = settingsService.get('user_context') || undefined

      const systemPrompt = buildTippySystemPrompt({ userMessage: message, frameworks, screenerContent, userName, userContext })
      const providerManager = getProviderManager()
      const provider = await providerManager.getActiveProvider()

      const messages = [
        { role: 'system' as const, content: systemPrompt },
        ...history,
        { role: 'user' as const, content: message }
      ]

      let fullResponse = ''

      await provider.stream(messages, {
        onToken: (token: string) => {
          fullResponse += token
          window.webContents.send('chat:stream-token', { token, done: false })
        },
        onDone: () => {
          window.webContents.send('chat:stream-token', { token: '', done: true })
        },
        onError: (error: string) => {
          window.webContents.send('chat:stream-token', { token: `\n\n[Error: ${error}]`, done: true })
        }
      })

      return { success: true, data: { response: fullResponse } }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
