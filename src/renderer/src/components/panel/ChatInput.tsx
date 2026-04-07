import { useState, useRef, useCallback } from 'react'
import { clsx } from 'clsx'

const SUPPORTED_EXTENSIONS = ['.txt', '.md', '.html', '.docx', '.pdf']

interface ChatInputProps {
  onSend: (message: string) => void
  onFileClick?: () => void
  onFileDrop?: (path: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({
  onSend,
  onFileClick,
  onFileDrop,
  disabled,
  placeholder = 'Ask TIPPY about accessibility...'
}: ChatInputProps): JSX.Element {
  const [input, setInput] = useState('')
  const [isDragging, setIsDragging] = useState(false)
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

  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent): void => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent): void => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (disabled || !onFileDrop) return

    const file = e.dataTransfer.files[0]
    if (!file) return

    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
      return
    }

    // Electron exposes .path on File objects
    const filePath = (file as any).path
    if (filePath) {
      onFileDrop(filePath)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={clsx(
        'flex items-end gap-2 p-3 border-t transition-colors',
        isDragging
          ? 'border-2 border-dashed border-[var(--tippy-purple)] bg-purple-50/10'
          : 'border-[var(--border-default)]'
      )}
    >
      {/* Paperclip / attach button */}
      {onFileClick && (
        <button
          type="button"
          onClick={onFileClick}
          disabled={disabled}
          className={clsx(
            'flex-shrink-0 w-[var(--min-tap-target)] h-[var(--min-tap-target)]',
            'flex items-center justify-center rounded-xl transition-colors',
            'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)]'
          )}
          aria-label="Upload a document for review"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M15.5 10L10.5 15C9.12 16.38 6.88 16.38 5.5 15C4.12 13.62 4.12 11.38 5.5 10L11 4.5C11.83 3.67 13.17 3.67 14 4.5C14.83 5.33 14.83 6.67 14 7.5L8.5 13C8.22 13.28 7.78 13.28 7.5 13C7.22 12.72 7.22 12.28 7.5 12L12.5 7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      <textarea
        ref={textareaRef}
        value={input}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={isDragging ? 'Drop a file here...' : placeholder}
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
