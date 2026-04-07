import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  // Window management
  window: {
    expand: () => ipcRenderer.invoke('window:expand'),
    collapse: () => ipcRenderer.invoke('window:collapse'),
    showPanel: (view: string) => ipcRenderer.invoke('window:showPanel', view)
  },

  // Analysis
  analyze: {
    text: (text: string, frameworks: string[]) =>
      ipcRenderer.invoke('analyze:text', text, frameworks),
    url: (url: string, frameworks: string[]) =>
      ipcRenderer.invoke('analyze:url', url, frameworks)
  },

  // Chat
  chat: {
    message: (message: string, history: any[], frameworks: string[]) =>
      ipcRenderer.invoke('chat:message', message, history, frameworks)
  },

  // Settings
  settings: {
    get: (key: string) => ipcRenderer.invoke('settings:get', key),
    getAll: () => ipcRenderer.invoke('settings:getAll'),
    set: (key: string, value: string) => ipcRenderer.invoke('settings:set', key, value),
    storeApiKey: (providerId: string, apiKey: string) =>
      ipcRenderer.invoke('settings:storeApiKey', providerId, apiKey),
    hasApiKey: (providerId: string) => ipcRenderer.invoke('settings:hasApiKey', providerId),
    deleteApiKey: (providerId: string) =>
      ipcRenderer.invoke('settings:deleteApiKey', providerId),
    testConnection: (providerType: string, config: any) =>
      ipcRenderer.invoke('settings:testConnection', providerType, config)
  },

  // History
  history: {
    list: (page?: number, limit?: number, filters?: any) =>
      ipcRenderer.invoke('history:list', page, limit, filters),
    get: (id: string) => ipcRenderer.invoke('history:get', id),
    delete: (id: string) => ipcRenderer.invoke('history:delete', id)
  },

  // Stream listeners
  onStreamToken: (
    channel: string,
    callback: (data: { token: string; done: boolean }) => void
  ) => {
    const handler = (_event: Electron.IpcRendererEvent, data: any): void => callback(data)
    ipcRenderer.on(channel, handler)
    return () => ipcRenderer.removeListener(channel, handler)
  },

  // Navigation listener (panel view changes from main process)
  onNavigate: (callback: (view: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, view: string): void => callback(view)
    ipcRenderer.on('navigate', handler)
    return () => ipcRenderer.removeListener('navigate', handler)
  },

  // Analysis status
  onAnalysisStatus: (callback: (data: { status: string; message: string }) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: any): void => callback(data)
    ipcRenderer.on('analysis:status', handler)
    return () => ipcRenderer.removeListener('analysis:status', handler)
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  ;(window as any).electron = electronAPI
  ;(window as any).api = api
}
