import { create } from 'zustand'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  frameworks?: string[]
  timestamp: number
}

interface ChatState {
  messages: ChatMessage[]
  isStreaming: boolean
  activeFrameworks: string[]
  addMessage: (message: ChatMessage) => void
  updateLastAssistant: (content: string) => void
  setStreaming: (streaming: boolean) => void
  setActiveFrameworks: (frameworks: string[]) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isStreaming: false,
  activeFrameworks: ['wcag', 'udl', 'discrit', 'plain-language'],

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  updateLastAssistant: (content) =>
    set((state) => {
      const messages = [...state.messages]
      const lastIdx = messages.findLastIndex((m) => m.role === 'assistant')
      if (lastIdx >= 0) {
        messages[lastIdx] = { ...messages[lastIdx], content }
      }
      return { messages }
    }),

  setStreaming: (isStreaming) => set({ isStreaming }),

  setActiveFrameworks: (activeFrameworks) => set({ activeFrameworks }),

  clearMessages: () => set({ messages: [] })
}))
