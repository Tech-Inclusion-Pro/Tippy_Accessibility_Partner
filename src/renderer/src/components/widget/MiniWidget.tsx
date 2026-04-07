import { useState, useRef, useEffect, useCallback } from 'react'
import tippyAvatar from '../../assets/tippy-avatar.png'

const DRAG_THRESHOLD = 5 // px of movement before it counts as a drag

export function MiniWidget(): JSX.Element {
  const [expanded, setExpanded] = useState(false)
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Track dragging vs clicking for the icon
  const isDragging = useRef(false)
  const mouseStart = useRef<{ x: number; y: number } | null>(null)

  // Listen for state changes from main process
  useEffect(() => {
    const cleanup = window.api.onWidgetState((state) => {
      setExpanded(state === 'expanded')
    })
    return cleanup
  }, [])

  // Focus the input when expanding
  useEffect(() => {
    if (expanded) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100)
      return () => clearTimeout(timer)
    }
  }, [expanded])

  // ── Custom drag for icon-only state ──
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (expanded) return
    mouseStart.current = { x: e.screenX, y: e.screenY }
    isDragging.current = false

    const onMouseMove = (ev: MouseEvent): void => {
      if (!mouseStart.current) return
      const dx = ev.screenX - mouseStart.current.x
      const dy = ev.screenY - mouseStart.current.y
      if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
        isDragging.current = true
      }
      if (isDragging.current) {
        // Move the window by the delta
        window.api.window.moveBy(dx, dy)
        mouseStart.current = { x: ev.screenX, y: ev.screenY }
      }
    }

    const onMouseUp = (): void => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      // If we didn't drag, treat it as a click → expand
      if (!isDragging.current) {
        setExpanded(true)
        window.api.window.expandWidget()
      }
      mouseStart.current = null
      isDragging.current = false
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }, [expanded])

  const handleOpenPanel = (): void => {
    window.api.window.expand()
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if (!input.trim()) return
    window.api.window.expand()
  }

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Escape' && expanded) {
      setExpanded(false)
      window.api.window.collapseWidget()
    }
  }

  // ── Icon-only state: just the TIPPY character, draggable + clickable ──
  if (!expanded) {
    return (
      <div className="widget-root w-full h-full">
        <div
          role="button"
          tabIndex={0}
          onMouseDown={handleMouseDown}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setExpanded(true)
              window.api.window.expandWidget()
            }
          }}
          className="w-full h-full cursor-grab active:cursor-grabbing bg-transparent p-0 border-0 select-none focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)] focus-visible:outline-offset-2"
          aria-label="TIPPY — click to open, drag to move"
        >
          <img
            src={tippyAvatar}
            alt="TIPPY"
            className="w-full h-full object-contain pointer-events-none"
            draggable={false}
          />
        </div>
      </div>
    )
  }

  // ── Expanded bar state (icon + input + arrow) ──
  return (
    <div className="widget-root w-full h-full" onKeyDown={handleKeyDown}>
      <div
        className="drag-region flex items-center gap-3 px-3 h-full rounded-2xl"
        style={{
          background: 'var(--bg-widget)',
          boxShadow: 'var(--shadow-widget)',
          backdropFilter: 'blur(12px)'
        }}
      >
        {/* Avatar — click to collapse back to icon */}
        <button
          onClick={() => {
            setExpanded(false)
            window.api.window.collapseWidget()
          }}
          className="no-drag flex-shrink-0 w-12 h-12 rounded-full overflow-hidden hover:ring-2 hover:ring-[var(--tippy-purple)] transition-shadow focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)]"
          aria-label="Collapse to icon"
        >
          <img src={tippyAvatar} alt="TIPPY" className="w-full h-full object-cover" draggable={false} />
        </button>

        {/* Input */}
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

          {/* Arrow → open full panel */}
          <button
            type="button"
            onClick={handleOpenPanel}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] transition-colors focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)]"
            aria-label="Open full panel"
            title="Open full panel"
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
