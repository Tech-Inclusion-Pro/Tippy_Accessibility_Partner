import { useSettingsStore } from '../../stores/settings.store'

export function CloudWarningBanner(): JSX.Element | null {
  const { settings } = useSettingsStore()
  const providerType = settings.provider_type || 'ollama'

  if (providerType === 'ollama') return null

  return (
    <div
      role="alert"
      className="flex items-center gap-2 px-3 py-2 bg-amber-50 border-b border-amber-200 text-amber-800 text-xs"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0" aria-hidden="true">
        <path
          d="M8 1L1 14H15L8 1Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M8 6V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
      </svg>
      <span>
        <strong>Cloud provider active.</strong> Your content will be sent to {providerType === 'anthropic' ? 'Anthropic' : providerType} for analysis.
      </span>
    </div>
  )
}
