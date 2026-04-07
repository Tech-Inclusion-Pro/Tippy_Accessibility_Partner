import { AIProvider, AIMessage, StreamCallbacks } from './ai-provider.interface'

export class OpenAIProvider implements AIProvider {
  name = 'OpenAI'
  type = 'openai' as const
  isLocal = false

  constructor(
    private apiKey: string,
    private modelId: string = 'gpt-4o'
  ) {}

  async stream(messages: AIMessage[], callbacks: StreamCallbacks): Promise<void> {
    let response: Response
    try {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.modelId,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          max_tokens: 4096,
          stream: true
        })
      })
    } catch (err: any) {
      throw new Error(`Cannot connect to OpenAI API. (${err.message})`)
    }

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      throw new Error(`OpenAI error ${response.status}: ${body || 'API request failed'}`)
    }
    if (!response.body) throw new Error('No response body from OpenAI')

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
          const data = line.slice(6).trim()
          if (data === '[DONE]') {
            callbacks.onDone()
            return
          }
          try {
            const json = JSON.parse(data)
            const delta = json.choices?.[0]?.delta?.content
            if (delta) {
              callbacks.onToken(delta)
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
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`
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
