import { useRef, useEffect } from 'react'
import { Button } from '../common/Button'

interface ConversationStarterModalProps {
  onSubmit: (text: string) => void
  onSkip: () => void
  onCancel: () => void
}

export function ConversationStarterModal({
  onSubmit,
  onSkip,
  onCancel
}: ConversationStarterModalProps): JSX.Element {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const handleSubmit = (): void => {
    const text = textareaRef.current?.value.trim() || ''
    if (text) {
      onSubmit(text)
    } else {
      onSkip()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      onCancel()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Custom screener guidance"
        className="bg-[var(--bg-app)] rounded-xl shadow-lg border border-[var(--border-default)] w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-2">
          Custom Screener Guidance
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          You have custom screeners loaded. Provide a guiding question or focus area for TIPPY to
          use when analyzing through your custom screener.
        </p>

        <textarea
          ref={textareaRef}
          className="w-full h-28 px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-muted)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--tippy-purple)]"
          placeholder="e.g., Focus on how this document addresses neurodivergent learners..."
          onKeyDown={handleKeyDown}
          aria-label="Guiding question or focus area"
        />

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="secondary" size="sm" onClick={onSkip}>
            Skip
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            Analyze
          </Button>
        </div>
      </div>
    </div>
  )
}
