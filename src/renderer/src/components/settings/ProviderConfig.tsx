import { useState, useEffect } from 'react'
import { useSettingsStore } from '../../stores/settings.store'
import { Input } from '../common/Input'
import { Button } from '../common/Button'
import { ApiKeyInput } from './ApiKeyInput'
import { Spinner } from '../common/Spinner'

const PROVIDERS = [
  { id: 'ollama', label: 'Ollama (Local)' },
  { id: 'anthropic', label: 'Anthropic' },
  { id: 'openai', label: 'OpenAI' },
  { id: 'google', label: 'Google Gemini' }
] as const

type ProviderId = (typeof PROVIDERS)[number]['id']

export function ProviderConfig(): JSX.Element {
  const { settings, setSetting, loadSettings } = useSettingsStore()
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ connected: boolean; error?: string } | null>(null)

  const providerType = (settings.provider_type || 'ollama') as ProviderId
  const ollamaUrl = settings.ollama_url || 'http://localhost:11434'
  const ollamaModel = settings.ollama_model || ''
  const anthropicModel = settings.anthropic_model || 'claude-sonnet-4-20250514'
  const openaiModel = settings.openai_model || 'gpt-4o'
  const googleModel = settings.google_model || 'gemini-2.0-flash'

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const handleTestConnection = async (): Promise<void> => {
    setTesting(true)
    setTestResult(null)
    let config: any
    if (providerType === 'ollama') {
      config = { baseUrl: ollamaUrl, modelId: ollamaModel }
    } else if (providerType === 'anthropic') {
      config = { modelId: anthropicModel }
    } else if (providerType === 'openai') {
      config = { modelId: openaiModel }
    } else {
      config = { modelId: googleModel }
    }
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
        <div className="flex flex-wrap gap-2">
          {PROVIDERS.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setSetting('provider_type', p.id)
                setTestResult(null)
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[var(--min-tap-target)] focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)] ${
                providerType === p.id
                  ? 'bg-[var(--tippy-purple)] text-white'
                  : 'bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
              }`}
              aria-pressed={providerType === p.id}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {providerType === 'ollama' && (
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
      )}

      {providerType === 'anthropic' && (
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

      {providerType === 'openai' && (
        <div className="flex flex-col gap-4">
          <ApiKeyInput providerId="openai" label="OpenAI API Key" />
          <Input
            label="Model"
            value={openaiModel}
            onChange={(e) => setSetting('openai_model', e.target.value)}
            placeholder="gpt-4o"
          />
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
            <strong>Cloud provider:</strong> Your content will be sent to OpenAI&apos;s API for analysis.
            Usage charges apply based on your OpenAI plan.
          </div>
        </div>
      )}

      {providerType === 'google' && (
        <div className="flex flex-col gap-4">
          <ApiKeyInput providerId="google" label="Google Gemini API Key" />
          <Input
            label="Model"
            value={googleModel}
            onChange={(e) => setSetting('google_model', e.target.value)}
            placeholder="gemini-2.0-flash"
          />
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
            <strong>Cloud provider:</strong> Your content will be sent to Google&apos;s Gemini API for analysis.
            Usage charges apply based on your Google AI plan.
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
