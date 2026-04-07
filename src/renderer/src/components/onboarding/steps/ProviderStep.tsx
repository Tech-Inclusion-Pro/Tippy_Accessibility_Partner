import { useOnboardingStore } from '../../../stores/onboarding.store'
import { ApiKeyInput } from '../../settings/ApiKeyInput'

const PROVIDERS = [
  { id: 'ollama', label: 'Ollama (Local)', description: 'Runs on your computer. Free, private, no API key needed.' },
  { id: 'anthropic', label: 'Anthropic', description: 'Claude models. Requires an API key.' },
  { id: 'openai', label: 'OpenAI', description: 'GPT models. Requires an API key.' },
  { id: 'google', label: 'Google Gemini', description: 'Gemini models. Requires an API key.' }
]

export function ProviderStep(): JSX.Element {
  const { providerType, setProviderType } = useOnboardingStore()

  return (
    <div className="flex flex-col gap-5 py-2">
      <div className="text-center">
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">Choose an AI Provider</h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Pick the AI service TIPPY will use. You can change this later in Settings.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {PROVIDERS.map((p) => (
          <button
            key={p.id}
            onClick={() => setProviderType(p.id)}
            className={`flex flex-col text-left px-4 py-3 rounded-lg border transition-colors focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)] ${
              providerType === p.id
                ? 'border-[var(--tippy-purple)] bg-[var(--tippy-purple)]/5'
                : 'border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)]'
            }`}
            aria-pressed={providerType === p.id}
          >
            <span className="text-sm font-medium text-[var(--text-primary)]">{p.label}</span>
            <span className="text-xs text-[var(--text-tertiary)]">{p.description}</span>
          </button>
        ))}
      </div>

      {providerType !== 'ollama' && (
        <div className="pt-1">
          <ApiKeyInput
            providerId={providerType}
            label={`${PROVIDERS.find((p) => p.id === providerType)?.label} API Key`}
          />
        </div>
      )}
    </div>
  )
}
