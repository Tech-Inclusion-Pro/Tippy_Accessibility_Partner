export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface StreamCallbacks {
  onToken: (token: string) => void
  onDone: () => void
  onError: (error: string) => void
}

export interface AIProvider {
  name: string
  type: 'ollama' | 'anthropic'
  isLocal: boolean
  stream(messages: AIMessage[], callbacks: StreamCallbacks): Promise<void>
  testConnection(): Promise<boolean>
}
