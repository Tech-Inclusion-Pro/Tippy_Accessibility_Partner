import { create } from 'zustand'

export interface HistoryItem {
  id: string
  type: 'text' | 'url' | 'chat' | 'file'
  input: string
  result: string
  scores: string | null
  frameworks: string | null
  provider: string | null
  created_at: string
}

interface HistoryState {
  items: HistoryItem[]
  total: number
  page: number
  loading: boolean
  selectedItem: HistoryItem | null
  reportContent: string
  isReporting: boolean
  showReport: boolean
  loadHistory: (page?: number, filters?: any) => Promise<void>
  selectItem: (item: HistoryItem | null) => void
  deleteItem: (id: string) => Promise<void>
  setReporting: (reporting: boolean) => void
  appendReportContent: (token: string) => void
  setShowReport: (show: boolean) => void
  clearReport: () => void
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  items: [],
  total: 0,
  page: 1,
  loading: false,
  selectedItem: null,
  reportContent: '',
  isReporting: false,
  showReport: false,

  loadHistory: async (page = 1, filters?) => {
    set({ loading: true })
    const result = await window.api.history.list(page, 20, filters)
    if (result.success && result.data) {
      set({ items: result.data.items, total: result.data.total, page, loading: false })
    } else {
      set({ loading: false })
    }
  },

  selectItem: (selectedItem) => set({ selectedItem }),

  deleteItem: async (id) => {
    await window.api.history.delete(id)
    const { page } = get()
    get().loadHistory(page)
  },

  setReporting: (isReporting) => set({ isReporting }),

  appendReportContent: (token) =>
    set((state) => ({ reportContent: state.reportContent + token })),

  setShowReport: (showReport) => set({ showReport }),

  clearReport: () => set({ reportContent: '', isReporting: false, showReport: false })
}))
