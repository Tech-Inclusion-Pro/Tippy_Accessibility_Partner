import { BrowserWindow } from 'electron'
import { analyzeReadability } from './text-analyzer'
import { buildTippySystemPrompt } from './prompt-builder'
import { getProviderManager } from './provider-manager'
import { historyService } from './history.service'

export async function analyzeText(
  text: string,
  frameworks: string[],
  window: BrowserWindow
): Promise<{ id: string }> {
  const scores = analyzeReadability(text)

  const systemPrompt = buildTippySystemPrompt({
    analysisType: 'text',
    frameworks,
    readabilityScores: scores
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
