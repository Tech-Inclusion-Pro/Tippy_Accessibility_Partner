import { BrowserWindow } from 'electron'
import { extractTextFromFile } from './file-extractor'
import { analyzeReadability } from './text-analyzer'
import { buildTippySystemPrompt } from './prompt-builder'
import { getProviderManager } from './provider-manager'
import { historyService } from './history.service'
import { screenerService } from './screener.service'
import { settingsService } from './settings.service'

export async function analyzeFile(
  filePath: string,
  frameworks: string[],
  window: BrowserWindow
): Promise<{ id: string }> {
  // Step 1: Extract text
  window.webContents.send('analysis:status', {
    status: 'extracting',
    message: 'Extracting text from document...'
  })

  const extracted = await extractTextFromFile(filePath)

  // Step 2: Analyze readability
  window.webContents.send('analysis:status', {
    status: 'analyzing',
    message: 'Analyzing document...'
  })

  const scores = analyzeReadability(extracted.text)

  // Step 3: Build prompt
  const screeners = screenerService.getScreenersForFrameworks(frameworks)
  const screenerContent = screeners.map((s) => ({ name: s.name, content: s.content }))

  const userName = settingsService.get('user_name') || undefined
  const userContext = settingsService.get('user_context') || undefined

  const systemPrompt = buildTippySystemPrompt({
    analysisType: 'file',
    frameworks,
    readabilityScores: scores,
    screenerContent,
    userName,
    userContext
  })

  // Step 4: Stream AI analysis
  const providerManager = getProviderManager()
  const provider = await providerManager.getActiveProvider()

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    {
      role: 'user' as const,
      content: `Please analyze the following document "${extracted.filename}" (${extracted.extension}, ${(extracted.sizeBytes / 1024).toFixed(1)} KB) for accessibility and inclusion:\n\n${extracted.text}`
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

  // Step 5: Save to history
  const id = historyService.save({
    type: 'file',
    input: extracted.filename,
    result: fullResponse,
    scores: JSON.stringify(scores),
    frameworks: JSON.stringify(frameworks),
    provider: provider.name
  })

  return { id }
}
