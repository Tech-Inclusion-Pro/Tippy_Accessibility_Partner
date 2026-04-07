import { useState, useEffect } from 'react'
import { Button } from '../common/Button'

interface ApiKeyInputProps {
  providerId: string
  label: string
}

export function ApiKeyInput({ providerId, label }: ApiKeyInputProps): JSX.Element {
  const [value, setValue] = useState('')
  const [hasKey, setHasKey] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showInput, setShowInput] = useState(false)

  useEffect(() => {
    window.api.settings.hasApiKey(providerId).then((result) => {
      if (result.success) setHasKey(!!result.data)
    })
  }, [providerId])

  const handleSave = async (): Promise<void> => {
    if (!value.trim()) return
    setSaving(true)
    const result = await window.api.settings.storeApiKey(providerId, value.trim())
    if (result.success) {
      setHasKey(true)
      setValue('')
      setShowInput(false)
    }
    setSaving(false)
  }

  const handleDelete = async (): Promise<void> => {
    await window.api.settings.deleteApiKey(providerId)
    setHasKey(false)
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-[var(--text-secondary)]">{label}</label>
      {hasKey && !showInput ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-green-600 flex items-center gap-1">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path d="M5 8L7 10L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Key saved securely
          </span>
          <Button variant="ghost" size="sm" onClick={() => setShowInput(true)}>
            Change
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDelete}>
            Remove
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`Enter ${label}`}
            className="flex-1 px-3 min-h-[var(--min-tap-target)] rounded-lg border bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-default)] text-sm focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)]"
            aria-label={label}
          />
          <Button onClick={handleSave} disabled={!value.trim() || saving} size="sm">
            Save
          </Button>
          {showInput && (
            <Button variant="ghost" size="sm" onClick={() => setShowInput(false)}>
              Cancel
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
