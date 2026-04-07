import { useEffect } from 'react'

export function useKeyboardNavigation(): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      // Escape to go back / close
      if (e.key === 'Escape') {
        const activeElement = document.activeElement as HTMLElement
        if (activeElement && activeElement !== document.body) {
          activeElement.blur()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}
