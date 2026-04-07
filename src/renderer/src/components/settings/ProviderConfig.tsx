import { useState, useEffect } from 'react'
import { useSettingsStore } from '../../stores/settings.store'
import { Input } from '../common/Input'
import { Button } from '../common/Button'
import { ApiKeyInput } from './ApiKeyInput'
import { Spinner } from '../common/Spinner'

export function ProviderConfig(): JSX.Element {
  const { settings, setSetting, loadSettings } = useSettingsStore()
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ connected: boolean; error?: string } | null>(null)

  const providerType = settings.provider_type || 'ollama'
  const ollamaUrl = settings.ollama_url || 'http://localhost:11434'
  const ollamaModel = settings.ollama_model || ''
  const anthropicModel = settings.anthropic_model || 'claude-sonnet-4-20250514'

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const handleTestConnection = async (): Promise<void> => {
    setTesting(true)
    setTestResult(null)
    const config = providerType === 'ollama'
      ? { baseUrl: ollamaUrl, modelId: ollamaModel }
      : { modelId: anthropicModel }
    const result = await window.api.settings.testConnection(providerType, config)
    if (result.success) {
      setTestResult(result.data!)
    } else {
      setTestResult({ connected: false, error: result.error })
    }
    setTesting(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">AI Provider</h3>
        <div className="flex gap-2">
          {(['ollama', 'anthropic'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSetting('provider_type', type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[var(--min-tap-target)] focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)] ${
                providerType === type
                  ? 'bg-[var(--tippy-purple)] text-white'
                  : 'bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
              }`}
              aria-pressed={providerType === type}
            >
              {type === 'ollama' ? 'Ollama (Local)' : 'Anthropic (Cloud)'}
            </button>
          ))}
        </div>
      </div>

      {providerType === 'ollama' ? (
        <div className="flex flex-col gap-4">
          <Input
            label="Ollama URL"
            value={ollamaUrl}
            onChange={(e) => setSetting('ollama_url', e.target.value)}
            placeholder="http://localhost:11434"
          />
          <Input
            label="Model ID (optional)"
            value={ollamaModel}
            onChange={(e) => setSetting('ollama_model', e.target.value)}
            placeholder="Auto-detect first available"
          />
          <p className="text-xs text-[var(--text-tertiary)]">
            Ollama runs locally — your data never leaves your computer.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <ApiKeyInput providerId="anthropic" label="Anthropic API Key" />
          <Input
            label="Model"
            value={anthropicModel}
            onChange={(e) => setSetting('anthropic_model', e.target.value)}
            placeholder="claude-sonnet-4-20250514"
          />
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
            <strong>Cloud provider:</strong> Your content will be sent to Anthropic&apos;s API for analysis.
            Usage charges apply based on your Anthropic plan.
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleTestConnection}
          disabled={testing}
        >
          {testing ? <Spinner size="sm" label="Testing" /> : 'Test Connection'}
        </Button>
        {testResult && (
          <span className={`text-sm ${testResult.connected ? 'text-green-600' : 'text-red-600'}`}>
            {testResult.connected ? 'Connected!' : testResult.error || 'Connection failed'}
          </span>
        )}
      </div>
    </div>
  )
}
