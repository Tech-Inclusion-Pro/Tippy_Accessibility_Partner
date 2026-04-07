import { useCallback, useRef, useEffect } from 'react'

export function useAnnounce(): (message: string) => void {
  const regionRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Create live region if it doesn't exist
    let region = document.getElementById('tippy-live-region') as HTMLDivElement
    if (!region) {
      region = document.createElement('div')
      region.id = 'tippy-live-region'
      region.setAttribute('role', 'status')
      region.setAttribute('aria-live', 'polite')
      region.setAttribute('aria-atomic', 'true')
      region.style.position = 'absolute'
      region.style.width = '1px'
      region.style.height = '1px'
      region.style.overflow = 'hidden'
      region.style.clip = 'rect(0,0,0,0)'
      region.style.whiteSpace = 'nowrap'
      document.body.appendChild(region)
    }
    regionRef.current = region
  }, [])

  return useCallback((message: string) => {
    if (regionRef.current) {
      regionRef.current.textContent = ''
      // Force reflow for screen readers
      requestAnimationFrame(() => {
        if (regionRef.current) {
          regionRef.current.textContent = message
        }
      })
    }
  }, [])
}
