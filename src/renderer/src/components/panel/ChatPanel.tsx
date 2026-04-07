import { useEffect, useRef, useCallback, useState } from 'react'
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
  'Upload a document for review',
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
    setActiveFrameworks,
    clearMessages
  } = useChatStore()
  const analysisStore = useAnalysisStore()
  const { loadSettings } = useSettingsStore()
  const announce = useAnnounce()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const streamBuffer = useRef('')
  const [saveStatus, setSaveStatus] = useState<string | null>(null)

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

  const handleFileClick = useCallback(async () => {
    analysisStore.reset()
    analysisStore.setAnalyzing(true, 'file')
    analysisStore.setStatusMessage('Opening file dialog...')

    const result = await window.api.analyze.file(activeFrameworks)
    if (result.success && result.data?.canceled) {
      analysisStore.reset()
      return
    }
    if (!result.success) {
      analysisStore.setAnalyzing(false)
      analysisStore.setStatusMessage('')
      const userMsg: ChatMessage = {
        id: uuidv4(),
        role: 'user',
        content: `[File upload failed: ${result.error}]`,
        timestamp: Date.now()
      }
      addMessage(userMsg)
      return
    }

    // Add a user message showing the filename
    const filePath = result.data?.filePath || 'document'
    const filename = filePath.split('/').pop() || filePath
    analysisStore.setUploadedFilename(filename)
    if (result.data?.id) {
      analysisStore.setAnalysisId(result.data.id)
    }

    const userMsg: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: `📄 Uploaded: ${filename}`,
      timestamp: Date.now()
    }
    addMessage(userMsg)
  }, [activeFrameworks, analysisStore, addMessage])

  const handleFileDrop = useCallback(
    async (path: string) => {
      const filename = path.split('/').pop() || path
      analysisStore.reset()
      analysisStore.setAnalyzing(true, 'file')
      analysisStore.setUploadedFilename(filename)
      analysisStore.setStatusMessage('Analyzing document...')

      const userMsg: ChatMessage = {
        id: uuidv4(),
        role: 'user',
        content: `📄 Uploaded: ${filename}`,
        timestamp: Date.now()
      }
      addMessage(userMsg)

      const result = await window.api.analyze.filePath(path, activeFrameworks)
      if (!result.success) {
        analysisStore.setAnalyzing(false)
        analysisStore.setStatusMessage('')
        const errorMsg: ChatMessage = {
          id: uuidv4(),
          role: 'user',
          content: `[File analysis failed: ${result.error}]`,
          timestamp: Date.now()
        }
        addMessage(errorMsg)
      } else if (result.data?.id) {
        analysisStore.setAnalysisId(result.data.id)
      }
    },
    [activeFrameworks, analysisStore, addMessage]
  )

  const handleSend = useCallback(
    async (text: string) => {
      // Handle the "Upload a document" quick prompt
      if (text === 'Upload a document for review') {
        handleFileClick()
        return
      }

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
    [messages, activeFrameworks, addMessage, setStreaming, updateLastAssistant, analysisStore, announce, handleFileClick]
  )

  const handleSaveSession = useCallback(async () => {
    if (messages.length === 0) return
    const result = await window.api.chat.saveSession(messages, activeFrameworks)
    if (result.success) {
      setSaveStatus('Saved!')
      setTimeout(() => setSaveStatus(null), 2000)
    }
  }, [messages, activeFrameworks])

  const handleNewChat = useCallback(async () => {
    if (messages.length > 0) {
      await window.api.chat.saveSession(messages, activeFrameworks)
    }
    clearMessages()
    analysisStore.reset()
  }, [messages, activeFrameworks, clearMessages, analysisStore])

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

      {/* Session controls */}
      {messages.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[var(--border-default)]" role="toolbar" aria-label="Session controls">
          <button
            onClick={handleSaveSession}
            disabled={isStreaming || analysisStore.isAnalyzing}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)]"
            aria-label="Save session"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M12.5 14H3.5C2.67 14 2 13.33 2 12.5V3.5C2 2.67 2.67 2 3.5 2H10.5L14 5.5V12.5C14 13.33 13.33 14 12.5 14Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M11 14V9H5V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 2V5H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {saveStatus || 'Save'}
          </button>
          <button
            onClick={handleNewChat}
            disabled={isStreaming || analysisStore.isAnalyzing}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)]"
            aria-label="New chat"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            New Chat
          </button>
          <button
            onClick={handleNewChat}
            disabled={isStreaming || analysisStore.isAnalyzing}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)]"
            aria-label="End chat"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            End Chat
          </button>
        </div>
      )}

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

      <ChatInput
        onSend={handleSend}
        onFileClick={handleFileClick}
        onFileDrop={handleFileDrop}
        disabled={isStreaming || analysisStore.isAnalyzing}
      />
    </div>
  )
}
