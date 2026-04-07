import { BrowserWindow } from 'electron'
import { buildTippySystemPrompt } from './prompt-builder'
import { getProviderManager } from './provider-manager'
import { historyService } from './history.service'

export interface AxeResult {
  violations: any[]
  passes: any[]
  incomplete: any[]
  inapplicable: any[]
  url: string
  timestamp: string
}

async function runAxeAnalysis(url: string): Promise<AxeResult> {
  // Dynamic import to avoid issues when playwright isn't installed
  let chromium: any, AxeBuilder: any
  try {
    const pw = await import('playwright')
    chromium = pw.chromium
  } catch {
    throw new Error(
      'Playwright is not installed. Run "npx playwright install chromium" to enable URL analysis.'
    )
  }

  try {
    const { default: AxeBuilderModule } = await import('@axe-core/playwright')
    AxeBuilder = AxeBuilderModule
  } catch {
    throw new Error(
      '@axe-core/playwright is not installed. Run "npm install @axe-core/playwright" to enable URL analysis.'
    )
  }

  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage()
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    return {
      violations: results.violations,
      passes: results.passes,
      incomplete: results.incomplete,
      inapplicable: results.inapplicable,
      url,
      timestamp: new Date().toISOString()
    }
  } finally {
    await browser.close()
  }
}

export async function analyzeUrl(
  url: string,
  frameworks: string[],
  window: BrowserWindow
): Promise<{ id: string; axeResults: AxeResult }> {
  // Send status update
  window.webContents.send('analysis:status', { status: 'scanning', message: 'Running accessibility scan...' })

  const axeResults = await runAxeAnalysis(url)

  window.webContents.send('analysis:status', { status: 'analyzing', message: 'AI analysis in progress...' })

  const systemPrompt = buildTippySystemPrompt({
    analysisType: 'url',
    frameworks,
    axeResults: {
      violationCount: axeResults.violations.length,
      passCount: axeResults.passes.length,
      incompleteCount: axeResults.incomplete.length,
      violations: axeResults.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        help: v.help,
        helpUrl: v.helpUrl,
        nodes: v.nodes.length,
        tags: v.tags
      }))
    }
  })

  const providerManager = getProviderManager()
  const provider = await providerManager.getActiveProvider()

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    {
      role: 'user' as const,
      content: `Please analyze the accessibility of this URL: ${url}\n\nThe automated scan found ${axeResults.violations.length} violations, ${axeResults.passes.length} passing rules, and ${axeResults.incomplete.length} items needing review.`
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
    type: 'url',
    input: url,
    result: fullResponse,
    scores: JSON.stringify({
      violations: axeResults.violations.length,
      passes: axeResults.passes.length,
      incomplete: axeResults.incomplete.length
    }),
    frameworks: JSON.stringify(frameworks),
    provider: provider.name
  })

  return { id, axeResults }
}
