import { create } from 'zustand'

interface SettingsState {
  settings: Record<string, string>
  loaded: boolean
  loadSettings: () => Promise<void>
  setSetting: (key: string, value: string) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: {},
  loaded: false,

  loadSettings: async () => {
    const result = await window.api.settings.getAll()
    if (result.success && result.data) {
      set({ settings: result.data, loaded: true })
    }
  },

  setSetting: async (key, value) => {
    await window.api.settings.set(key, value)
    set((state) => ({
      settings: { ...state.settings, [key]: value }
    }))
  }
}))
