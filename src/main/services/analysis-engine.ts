import { BrowserWindow } from 'electron'
import { analyzeReadability } from './text-analyzer'
import { buildTippySystemPrompt } from './prompt-builder'
import { getProviderManager } from './provider-manager'
import { historyService } from './history.service'
import { screenerService } from './screener.service'
import { settingsService } from './settings.service'

export async function analyzeText(
  text: string,
  frameworks: string[],
  window: BrowserWindow
): Promise<{ id: string }> {
  const scores = analyzeReadability(text)

  // Load screener content for active frameworks
  const screeners = screenerService.getScreenersForFrameworks(frameworks)
  const screenerContent = screeners.map((s) => ({ name: s.name, content: s.content }))

  const userName = settingsService.get('user_name') || undefined
  const userContext = settingsService.get('user_context') || undefined

  const systemPrompt = buildTippySystemPrompt({
    analysisType: 'text',
    frameworks,
    readabilityScores: scores,
    screenerContent,
    userName,
    userContext
  })

  const providerManager = getProviderManager()
  const provider = await providerManager.getActiveProvider()

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    {
      role: 'user' as const,
      content: `Please analyze the following text for accessibility and plain language:\n\n${text}`
    }
  ]

  let fullResponse = ''

  await provider.stream(messages, {
    onToken: (token: string) => {
      fullResponse += token
      window.webContents.send('analysis:stream-token', { token, done: false })
    },
    onDone: () => {
      window.webContents.send('analysis:stream-token', { token: '', done: true })
    },
    onError: (error: string) => {
      fullResponse += `\n\n[Error: ${error}]`
      window.webContents.send('analysis:stream-token', {
        token: `\n\n[Error: ${error}]`,
        done: true
      })
    }
  })

  const id = historyService.save({
    type: 'text',
    input: text,
    result: fullResponse,
    scores: JSON.stringify(scores),
    frameworks: JSON.stringify(frameworks),
    provider: provider.name
  })

  return { id }
}
