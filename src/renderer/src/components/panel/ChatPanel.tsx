import { useEffect, useRef, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useChatStore, ChatMessage } from '../../stores/chat.store'
import { useAnalysisStore } from '../../stores/analysis.store'
import { useSettingsStore } from '../../stores/settings.store'
import { useStreamingResponse } from '../../hooks/useStreamingResponse'
import { useAnnounce } from '../../hooks/useAnnounce'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'
import { CloudWarningBanner } from './CloudWarningBanner'
import { AnalysisResults } from './AnalysisResults'
import { Badge } from '../common/Badge'
import tippyAvatar from '../../assets/tippy-avatar.png'

const FRAMEWORK_OPTIONS = [
  { id: 'wcag', label: 'WCAG' },
  { id: 'udl', label: 'UDL' },
  { id: 'discrit', label: 'DisCrit' },
  { id: 'plain-language', label: 'Plain Language' }
]

const QUICK_PROMPTS = [
  'Check a URL for accessibility',
  'Review my text for plain language',
  'Explain WCAG 2.1 AA requirements',
  'What is Universal Design for Learning?'
]

export function ChatPanel(): JSX.Element {
  const {
    messages,
    isStreaming,
    activeFrameworks,
    addMessage,
    updateLastAssistant,
    setStreaming,
    setActiveFrameworks
  } = useChatStore()
  const analysisStore = useAnalysisStore()
  const { loadSettings } = useSettingsStore()
  const announce = useAnnounce()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const streamBuffer = useRef('')

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  // Chat streaming
  useStreamingResponse({
    channel: 'chat:stream-token',
    onToken: (token) => {
      streamBuffer.current += token
      updateLastAssistant(streamBuffer.current)
    },
    onDone: () => {
      setStreaming(false)
      announce('TIPPY has finished responding')
      streamBuffer.current = ''
    }
  })

  // Analysis streaming
  useStreamingResponse({
    channel: 'analysis:stream-token',
    onToken: (token) => {
      analysisStore.appendContent(token)
    },
    onDone: () => {
      analysisStore.setAnalyzing(false)
      announce('Analysis complete')
    }
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = useCallback(
    async (text: string) => {
      const userMessage: ChatMessage = {
        id: uuidv4(),
        role: 'user',
        content: text,
        timestamp: Date.now()
      }
      addMessage(userMessage)

      // Detect URL
      const urlMatch = text.match(/https?:\/\/[^\s]+/)
      if (urlMatch) {
        analysisStore.reset()
        analysisStore.setAnalyzing(true, 'url')
        analysisStore.setStatusMessage('Scanning URL...')
        const result = await window.api.analyze.url(urlMatch[0], activeFrameworks)
        if (result.success && result.data?.axeResults) {
          analysisStore.setAxeResults(result.data.axeResults)
        }
        return
      }

      // Detect text analysis request
      if (text.length > 200 || text.toLowerCase().includes('review this text')) {
        analysisStore.reset()
        analysisStore.setAnalyzing(true, 'text')
        analysisStore.setStatusMessage('Analyzing text...')
        await window.api.analyze.text(text, activeFrameworks)
        return
      }

      // Regular chat
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: '',
        frameworks: activeFrameworks,
        timestamp: Date.now()
      }
      addMessage(assistantMessage)
      setStreaming(true)
      streamBuffer.current = ''

      const history = messages.map((m) => ({
        role: m.role,
        content: m.content
      }))

      await window.api.chat.message(text, history, activeFrameworks)
    },
    [messages, activeFrameworks, addMessage, setStreaming, updateLastAssistant, analysisStore, announce]
  )

  const toggleFramework = (id: string): void => {
    if (activeFrameworks.includes(id)) {
      if (activeFrameworks.length > 1) {
        setActiveFrameworks(activeFrameworks.filter((f) => f !== id))
      }
    } else {
      setActiveFrameworks([...activeFrameworks, id])
    }
  }

  const isEmpty = messages.length === 0 && !analysisStore.streamedContent

  return (
    <div className="flex flex-col h-full bg-[var(--bg-app)]">
      <CloudWarningBanner />

      {/* Framework toggles */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-[var(--border-default)]" role="toolbar" aria-label="Analysis frameworks">
        <span className="text-xs text-[var(--text-tertiary)] mr-1">Frameworks:</span>
        {FRAMEWORK_OPTIONS.map((f) => (
          <button
            key={f.id}
            onClick={() => toggleFramework(f.id)}
            className={`px-2 py-1 rounded-full text-xs font-medium transition-colors min-h-[28px] focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)] ${
              activeFrameworks.includes(f.id)
                ? 'bg-[var(--tippy-purple)] text-white'
                : 'bg-[var(--bg-muted)] text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)]'
            }`}
            aria-pressed={activeFrameworks.includes(f.id)}
            aria-label={`${f.label} framework`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Message area */}
      <div
        id="main-content"
        className="flex-1 overflow-y-auto"
        role="list"
        aria-label="Conversation messages"
      >
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full px-6 text-center">
            <img src={tippyAvatar} alt="" className="w-16 h-16 rounded-full mb-4" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
              Hi! I&apos;m TIPPY
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-xs">
              Your AI accessibility partner. I can help you analyze content for WCAG compliance, plain language, and inclusive design.
            </p>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="text-left text-sm px-4 py-3 rounded-xl border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors min-h-[var(--min-tap-target)] focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                role={msg.role}
                content={msg.content}
                frameworks={msg.frameworks}
                isStreaming={isStreaming && msg === messages[messages.length - 1] && msg.role === 'assistant'}
              />
            ))}
            <AnalysisResults />
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <ChatInput onSend={handleSend} disabled={isStreaming || analysisStore.isAnalyzing} />
    </div>
  )
}
