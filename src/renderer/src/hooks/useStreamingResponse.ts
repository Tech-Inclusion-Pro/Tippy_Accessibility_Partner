import { useEffect, useRef, useCallback } from 'react'

interface UseStreamingOptions {
  channel: string
  onToken: (token: string) => void
  onDone: () => void
}

export function useStreamingResponse({ channel, onToken, onDone }: UseStreamingOptions): void {
  const onTokenRef = useRef(onToken)
  const onDoneRef = useRef(onDone)

  onTokenRef.current = onToken
  onDoneRef.current = onDone

  useEffect(() => {
    const cleanup = window.api.onStreamToken(channel, (data) => {
      if (data.done) {
        onDoneRef.current()
      } else if (data.token) {
        onTokenRef.current(data.token)
      }
    })
    return cleanup
  }, [channel])
}
