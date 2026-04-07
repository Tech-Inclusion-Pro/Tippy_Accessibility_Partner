import { AIProvider } from './ai-provider.interface'
import { OllamaProvider } from './ollama.provider'
import { AnthropicProvider } from './anthropic.provider'
import { settingsService } from './settings.service'
import { safeStorageService } from './safe-storage.service'

let instance: ProviderManager | null = null

class ProviderManager {
  async getActiveProvider(): Promise<AIProvider> {
    const providerType = settingsService.get('provider_type') || 'ollama'

    if (providerType === 'anthropic') {
      const apiKey = safeStorageService.retrieveApiKey('anthropic')
      if (!apiKey) throw new Error('No Anthropic API key configured. Please add it in Settings.')
      const modelId = settingsService.get('anthropic_model') || 'claude-sonnet-4-20250514'
      return new AnthropicProvider(apiKey, modelId)
    }

    // Default to Ollama
    const baseUrl = settingsService.get('ollama_url') || 'http://localhost:11434'
    const modelId = settingsService.get('ollama_model') || ''
    return new OllamaProvider(baseUrl, modelId)
  }

  async testConnection(providerType: string, config: any): Promise<{ connected: boolean; error?: string }> {
    try {
      let provider: AIProvider
      if (providerType === 'anthropic') {
        provider = new AnthropicProvider(config.apiKey || '', config.modelId)
      } else {
        provider = new OllamaProvider(config.baseUrl, config.modelId)
      }
      const connected = await provider.testConnection()
      return { connected }
    } catch (error: any) {
      return { connected: false, error: error.message }
    }
  }

  async detectOllama(): Promise<boolean> {
    const provider = new OllamaProvider()
    return provider.testConnection()
  }
}

export function getProviderManager(): ProviderManager {
  if (!instance) instance = new ProviderManager()
  return instance
}
