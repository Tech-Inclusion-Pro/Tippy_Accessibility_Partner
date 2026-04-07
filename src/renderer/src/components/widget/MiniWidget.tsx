import { useState, useRef } from 'react'
import tippyAvatar from '../../assets/tippy-avatar.png'

export function MiniWidget(): JSX.Element {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleExpand = (): void => {
    window.api.window.expand()
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if (!input.trim()) return
    // Expand to panel and pass the input
    window.api.window.expand()
  }

  return (
    <div className="widget-root w-full h-full">
      <div
        className="drag-region flex items-center gap-3 px-3 h-full rounded-2xl"
        style={{
          background: 'var(--bg-widget)',
          boxShadow: 'var(--shadow-widget)',
          backdropFilter: 'blur(12px)'
        }}
      >
        <button
          onClick={handleExpand}
          className="no-drag flex-shrink-0 w-12 h-12 rounded-full overflow-hidden hover:ring-2 hover:ring-[var(--tippy-purple)] transition-shadow focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)]"
          aria-label="Open TIPPY panel"
        >
          <img src={tippyAvatar} alt="TIPPY" className="w-full h-full object-cover" />
        </button>

        <form onSubmit={handleSubmit} className="no-drag flex-1 flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask TIPPY..."
            className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none"
            aria-label="Message TIPPY"
          />
          <button
            type="button"
            onClick={handleExpand}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] transition-colors focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)]"
            aria-label="Expand panel"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M6 3L11 8L6 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}
