import { useRef, useCallback } from 'react'
import tippyAvatar from '../../assets/tippy-avatar.png'

const DRAG_THRESHOLD = 5 // px of movement before it counts as a drag

export function MiniWidget(): JSX.Element {
  // Track dragging vs clicking for the icon
  const isDragging = useRef(false)
  const mouseStart = useRef<{ x: number; y: number } | null>(null)

  // ── Custom drag for icon-only state ──
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
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
        window.api.window.moveBy(dx, dy)
        mouseStart.current = { x: ev.screenX, y: ev.screenY }
      }
    }

    const onMouseUp = (): void => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      // If we didn't drag, treat it as a click → open full panel
      if (!isDragging.current) {
        window.api.window.expand()
      }
      mouseStart.current = null
      isDragging.current = false
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }, [])

  return (
    <div className="widget-root w-full h-full">
      <div
        role="button"
        tabIndex={0}
        onMouseDown={handleMouseDown}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            window.api.window.expand()
          }
        }}
        className="w-full h-full cursor-grab active:cursor-grabbing bg-transparent p-0 border-0 select-none focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)] focus-visible:outline-offset-2"
        aria-label="TIPPY — click to open panel, drag to move"
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
