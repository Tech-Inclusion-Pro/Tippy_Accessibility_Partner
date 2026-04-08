import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  // Window management
  window: {
    expandWidget: () => ipcRenderer.invoke('window:expandWidget'),
    collapseWidget: () => ipcRenderer.invoke('window:collapseWidget'),
    expand: () => ipcRenderer.invoke('window:expand'),
    collapse: () => ipcRenderer.invoke('window:collapse'),
    showPanel: (view: string) => ipcRenderer.invoke('window:showPanel', view),
    moveBy: (dx: number, dy: number) => ipcRenderer.invoke('window:moveBy', dx, dy)
  },

  // Analysis
  analyze: {
    text: (text: string, frameworks: string[]) =>
      ipcRenderer.invoke('analyze:text', text, frameworks),
    url: (url: string, frameworks: string[]) =>
      ipcRenderer.invoke('analyze:url', url, frameworks),
    file: (frameworks: string[]) => ipcRenderer.invoke('analyze:file', frameworks),
    pickFile: () => ipcRenderer.invoke('file:pick'),
    filePath: (path: string, frameworks: string[], conversationStarter?: string) =>
      ipcRenderer.invoke('analyze:file-path', path, frameworks, conversationStarter)
  },

  // Export
  export: {
    docx: (options: { content: string; title?: string; frameworks?: string[] }) =>
      ipcRenderer.invoke('export:docx', options)
  },

  // Chat
  chat: {
    message: (message: string, history: any[], frameworks: string[]) =>
      ipcRenderer.invoke('chat:message', message, history, frameworks),
    saveSession: (messages: any[], frameworks: string[]) =>
      ipcRenderer.invoke('chat:save-session', messages, frameworks)
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
    delete: (id: string) => ipcRenderer.invoke('history:delete', id),
    reportThemes: () => ipcRenderer.invoke('history:report-themes'),
    moveToFolder: (ids: string | string[], folderId: string | null) =>
      ipcRenderer.invoke('history:move-to-folder', ids, folderId),
    getDbPath: () => ipcRenderer.invoke('history:get-db-path'),
    setDbPath: () => ipcRenderer.invoke('history:set-db-path'),
    resetDbPath: () => ipcRenderer.invoke('history:reset-db-path')
  },

  // Folders
  folder: {
    list: () => ipcRenderer.invoke('folder:list'),
    create: (name: string) => ipcRenderer.invoke('folder:create', name),
    rename: (id: string, name: string) => ipcRenderer.invoke('folder:rename', id, name),
    delete: (id: string) => ipcRenderer.invoke('folder:delete', id)
  },

  // Screeners (reasoning knowledge base)
  screener: {
    list: () => ipcRenderer.invoke('screener:list'),
    getContent: (id: string) => ipcRenderer.invoke('screener:getContent', id),
    addCustom: (filename: string, content: string) =>
      ipcRenderer.invoke('screener:addCustom', filename, content),
    import: () => ipcRenderer.invoke('screener:import'),
    delete: (id: string) => ipcRenderer.invoke('screener:delete', id),
    export: (id: string) => ipcRenderer.invoke('screener:export', id)
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
  },

  // Widget state changes (collapsed/expanded)
  onWidgetState: (callback: (state: 'collapsed' | 'expanded') => void) => {
    const handler = (_event: Electron.IpcRendererEvent, state: any): void => callback(state)
    ipcRenderer.on('widget:state', handler)
    return () => ipcRenderer.removeListener('widget:state', handler)
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
