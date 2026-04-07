import { ipcMain } from 'electron'
import { settingsService } from '../services/settings.service'
import { safeStorageService } from '../services/safe-storage.service'
import { getProviderManager } from '../services/provider-manager'

export function registerSettingsHandlers(): void {
  ipcMain.handle('settings:get', async (_event, key: string) => {
    try {
      const value = settingsService.get(key)
      return { success: true, data: value }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('settings:getAll', async () => {
    try {
      const data = settingsService.getAll()
      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('settings:set', async (_event, key: string, value: string) => {
    try {
      settingsService.set(key, value)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('settings:storeApiKey', async (_event, providerId: string, apiKey: string) => {
    try {
      safeStorageService.storeApiKey(providerId, apiKey)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('settings:hasApiKey', async (_event, providerId: string) => {
    try {
      const hasKey = safeStorageService.hasApiKey(providerId)
      return { success: true, data: hasKey }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('settings:deleteApiKey', async (_event, providerId: string) => {
    try {
      safeStorageService.deleteApiKey(providerId)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('settings:testConnection', async (_event, providerType: string, config: any) => {
    try {
      const providerManager = getProviderManager()
      const result = await providerManager.testConnection(providerType, config)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
