import { useEffect } from 'react'
import { useSettingsStore } from '../../stores/settings.store'
import { Input } from '../common/Input'

export function AboutMeSettings(): JSX.Element {
  const { settings, setSetting, loadSettings } = useSettingsStore()

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const userName = settings.user_name || ''
  const userContext = settings.user_context || ''

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">About Me</h3>
        <p className="text-xs text-[var(--text-tertiary)] mb-3">
          Help TIPPY personalize responses by sharing a bit about yourself and your work.
        </p>
      </div>
      <Input
        label="Your Name"
        value={userName}
        onChange={(e) => setSetting('user_name', e.target.value)}
        placeholder="e.g. Jordan"
      />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-[var(--text-secondary)]">
          Work Context
        </label>
        <textarea
          value={userContext}
          onChange={(e) => setSetting('user_context', e.target.value)}
          placeholder="e.g. I'm a UX designer at a university, working on making our student portal more accessible."
          rows={3}
          className="px-3 py-2 rounded-lg border bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-default)] text-sm resize-y focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)]"
          aria-label="Work Context"
        />
        <p className="text-xs text-[var(--text-tertiary)]">
          TIPPY uses this to tailor advice to your role and domain.
        </p>
      </div>
    </div>
  )
}
