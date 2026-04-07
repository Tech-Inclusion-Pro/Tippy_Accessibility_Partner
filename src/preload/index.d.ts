import { ElectronAPI } from '@electron-toolkit/preload'

interface IpcResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

interface TippyAPI {
  window: {
    expandWidget: () => Promise<IpcResponse>
    collapseWidget: () => Promise<IpcResponse>
    expand: () => Promise<IpcResponse>
    collapse: () => Promise<IpcResponse>
    showPanel: (view: string) => Promise<IpcResponse>
    moveBy: (dx: number, dy: number) => Promise<IpcResponse>
  }
  analyze: {
    text: (text: string, frameworks: string[]) => Promise<IpcResponse>
    url: (url: string, frameworks: string[]) => Promise<IpcResponse>
  }
  chat: {
    message: (message: string, history: any[], frameworks: string[]) => Promise<IpcResponse>
  }
  settings: {
    get: (key: string) => Promise<IpcResponse<string | null>>
    getAll: () => Promise<IpcResponse<Record<string, string>>>
    set: (key: string, value: string) => Promise<IpcResponse>
    storeApiKey: (providerId: string, apiKey: string) => Promise<IpcResponse>
    hasApiKey: (providerId: string) => Promise<IpcResponse<boolean>>
    deleteApiKey: (providerId: string) => Promise<IpcResponse>
    testConnection: (
      providerType: string,
      config: any
    ) => Promise<IpcResponse<{ connected: boolean; error?: string }>>
  }
  history: {
    list: (
      page?: number,
      limit?: number,
      filters?: any
    ) => Promise<IpcResponse<{ items: any[]; total: number }>>
    get: (id: string) => Promise<IpcResponse>
    delete: (id: string) => Promise<IpcResponse>
  }
  onStreamToken: (
    channel: string,
    callback: (data: { token: string; done: boolean }) => void
  ) => () => void
  onNavigate: (callback: (view: string) => void) => () => void
  onAnalysisStatus: (callback: (data: { status: string; message: string }) => void) => () => void
  onWidgetState: (callback: (state: 'collapsed' | 'expanded') => void) => () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: TippyAPI
  }
}
