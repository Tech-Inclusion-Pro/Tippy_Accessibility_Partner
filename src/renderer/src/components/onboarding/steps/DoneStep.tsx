import { useOnboardingStore } from '../../../stores/onboarding.store'

const PROVIDER_LABELS: Record<string, string> = {
  ollama: 'Ollama (Local)',
  anthropic: 'Anthropic',
  openai: 'OpenAI',
  google: 'Google Gemini'
}

export function DoneStep(): JSX.Element {
  const { userName, userContext, providerType } = useOnboardingStore()

  return (
    <div className="flex flex-col items-center text-center gap-6 py-4">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <path d="M10 16L14 20L22 12" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          You&apos;re All Set!
        </h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-xs">
          Here&apos;s a summary of your setup. You can change any of these later in Settings.
        </p>
      </div>

      <div className="w-full max-w-xs rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-left">
        <div className="px-4 py-3 border-b border-[var(--border-default)]">
          <span className="text-xs text-[var(--text-tertiary)]">Name</span>
          <p className="text-sm text-[var(--text-primary)]">{userName || 'Not set'}</p>
        </div>
        <div className="px-4 py-3 border-b border-[var(--border-default)]">
          <span className="text-xs text-[var(--text-tertiary)]">Work Context</span>
          <p className="text-sm text-[var(--text-primary)] line-clamp-2">{userContext || 'Not set'}</p>
        </div>
        <div className="px-4 py-3">
          <span className="text-xs text-[var(--text-tertiary)]">AI Provider</span>
          <p className="text-sm text-[var(--text-primary)]">{PROVIDER_LABELS[providerType] || providerType}</p>
        </div>
      </div>
    </div>
  )
}
