import { AIProvider, AIMessage, StreamCallbacks } from './ai-provider.interface'

export class AnthropicProvider implements AIProvider {
  name = 'Anthropic'
  type = 'anthropic' as const
  isLocal = false

  constructor(
    private apiKey: string,
    private modelId: string = 'claude-sonnet-4-20250514'
  ) {}

  async stream(messages: AIMessage[], callbacks: StreamCallbacks): Promise<void> {
    const systemMsg = messages.find((m) => m.role === 'system')
    const chatMessages = messages.filter((m) => m.role !== 'system')

    let response: Response
    try {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.modelId,
          max_tokens: 4096,
          system: systemMsg?.content || '',
          messages: chatMessages.map((m) => ({ role: m.role, content: m.content })),
          stream: true
        })
      })
    } catch (err: any) {
      throw new Error(`Cannot connect to Anthropic API. (${err.message})`)
    }

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      throw new Error(`Anthropic error ${response.status}: ${body || 'API request failed'}`)
    }
    if (!response.body) throw new Error('No response body from Anthropic')

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const json = JSON.parse(line.slice(6))
            if (json.type === 'content_block_delta' && json.delta?.text) {
              callbacks.onToken(json.delta.text)
            }
            if (json.type === 'message_stop') {
              callbacks.onDone()
              return
            }
          } catch {
            // skip malformed
          }
        }
      }
    }
    callbacks.onDone()
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.modelId,
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Hi' }]
        })
      })
      return response.ok
    } catch {
      return false
    }
  }
}
