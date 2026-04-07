import { useState, useRef, useCallback } from 'react'
import { clsx } from 'clsx'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({ onSend, disabled, placeholder = 'Ask TIPPY about accessibility...' }: ChatInputProps): JSX.Element {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault()
      const trimmed = input.trim()
      if (!trimmed || disabled) return
      onSend(trimmed)
      setInput('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    },
    [input, disabled, onSend]
  )

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setInput(e.target.value)
    // Auto-resize
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 p-3 border-t border-[var(--border-default)]">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className={clsx(
          'flex-1 px-3 py-2 rounded-xl border bg-[var(--bg-surface)] text-sm',
          'text-[var(--text-primary)] border-[var(--border-default)]',
          'placeholder:text-[var(--text-tertiary)]',
          'focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)]',
          'resize-none overflow-y-auto',
          'disabled:opacity-50'
        )}
        style={{ maxHeight: '120px' }}
        aria-label="Message input"
      />
      <button
        type="submit"
        disabled={!input.trim() || disabled}
        className={clsx(
          'flex-shrink-0 w-[var(--min-tap-target)] h-[var(--min-tap-target)]',
          'flex items-center justify-center rounded-xl transition-colors',
          'bg-[var(--tippy-purple)] text-white',
          'hover:bg-[var(--tippy-purple-dark)]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)]'
        )}
        aria-label="Send message"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M3 10L17 3L10 17L9 11L3 10Z"
            fill="currentColor"
          />
        </svg>
      </button>
    </form>
  )
}
