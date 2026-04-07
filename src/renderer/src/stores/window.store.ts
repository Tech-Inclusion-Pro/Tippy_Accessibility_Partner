import { create } from 'zustand'

export type AppView = 'widget' | 'chat' | 'settings' | 'history'

interface WindowState {
  currentView: AppView
  setView: (view: AppView) => void
}

export const useWindowStore = create<WindowState>((set) => ({
  currentView: 'widget',
  setView: (view) => set({ currentView: view })
}))
