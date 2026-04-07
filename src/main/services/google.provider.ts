import { AIProvider, AIMessage, StreamCallbacks } from './ai-provider.interface'

export class GoogleProvider implements AIProvider {
  name = 'Google Gemini'
  type = 'google' as const
  isLocal = false

  constructor(
    private apiKey: string,
    private modelId: string = 'gemini-2.0-flash'
  ) {}

  async stream(messages: AIMessage[], callbacks: StreamCallbacks): Promise<void> {
    const systemMsg = messages.find((m) => m.role === 'system')
    const chatMessages = messages.filter((m) => m.role !== 'system')

    const contents = chatMessages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }))

    const body: any = {
      contents,
      generationConfig: {
        maxOutputTokens: 4096
      }
    }

    if (systemMsg?.content) {
      body.systemInstruction = { parts: [{ text: systemMsg.content }] }
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelId}:streamGenerateContent?alt=sse&key=${this.apiKey}`

    let response: Response
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
    } catch (err: any) {
      throw new Error(`Cannot connect to Google Gemini API. (${err.message})`)
    }

    if (!response.ok) {
      const errBody = await response.text().catch(() => '')
      throw new Error(`Gemini error ${response.status}: ${errBody || 'API request failed'}`)
    }
    if (!response.body) throw new Error('No response body from Gemini')

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
            const text = json.candidates?.[0]?.content?.parts?.[0]?.text
            if (text) {
              callbacks.onToken(text)
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
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelId}:generateContent?key=${this.apiKey}`
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Hi' }] }],
          generationConfig: { maxOutputTokens: 10 }
        })
      })
      return response.ok
    } catch {
      return false
    }
  }
}
