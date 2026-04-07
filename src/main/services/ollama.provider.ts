import { AIProvider, AIMessage, StreamCallbacks } from './ai-provider.interface'

export class OllamaProvider implements AIProvider {
  name = 'Ollama'
  type = 'ollama' as const
  isLocal = true

  constructor(
    private baseUrl: string = 'http://localhost:11434',
    private modelId: string = ''
  ) {}

  private async getModel(): Promise<string> {
    if (this.modelId) return this.modelId

    try {
      const res = await fetch(`${this.baseUrl}/api/tags`)
      if (res.ok) {
        const data = await res.json()
        if (data.models?.length > 0) {
          return data.models[0].name
        }
      }
    } catch {
      // fall through
    }

    throw new Error(
      'No Ollama model configured and none found. ' +
        'Please pull a model (e.g. "ollama pull gemma3:4b") or set the Model ID in Settings.'
    )
  }

  async stream(messages: AIMessage[], callbacks: StreamCallbacks): Promise<void> {
    const model = await this.getModel()

    let response: Response
    try {
      response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages, stream: true })
      })
    } catch (err: any) {
      throw new Error(
        `Cannot connect to Ollama at ${this.baseUrl}. Make sure Ollama is running. (${err.message})`
      )
    }

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      throw new Error(`Ollama error ${response.status}: ${body || 'Request failed'}`)
    }
    if (!response.body) throw new Error('No response body from Ollama')

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let gotDone = false

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const text = decoder.decode(value, { stream: true })
      for (const line of text.split('\n').filter(Boolean)) {
        try {
          const json = JSON.parse(line)
          if (json.error) throw new Error(`Ollama: ${json.error}`)
          if (json.message?.content) callbacks.onToken(json.message.content)
          if (json.done) {
            gotDone = true
            callbacks.onDone()
          }
        } catch (e: any) {
          if (e.message?.startsWith('Ollama:')) throw e
        }
      }
    }

    if (!gotDone) callbacks.onDone()
  }

  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`)
      return res.ok
    } catch {
      return false
    }
  }
}
