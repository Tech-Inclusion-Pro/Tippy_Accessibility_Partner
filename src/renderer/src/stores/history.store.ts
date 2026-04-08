import { create } from 'zustand'

export interface HistoryItem {
  id: string
  type: 'text' | 'url' | 'chat' | 'file'
  input: string
  result: string
  scores: string | null
  frameworks: string | null
  provider: string | null
  folder_id: string | null
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
  searchQuery: string
  typeFilter: string | null
  folderFilter: string | null
  _searchTimeout: ReturnType<typeof setTimeout> | null
  loadHistory: (page?: number) => Promise<void>
  selectItem: (item: HistoryItem | null) => void
  deleteItem: (id: string) => Promise<void>
  setReporting: (reporting: boolean) => void
  appendReportContent: (token: string) => void
  setShowReport: (show: boolean) => void
  clearReport: () => void
  setSearchQuery: (query: string) => void
  setTypeFilter: (type: string | null) => void
  setFolderFilter: (folderId: string | null) => void
  moveToFolder: (ids: string | string[], folderId: string | null) => Promise<void>
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
  searchQuery: '',
  typeFilter: null,
  folderFilter: null,
  _searchTimeout: null,

  loadHistory: async (page = 1) => {
    const { searchQuery, typeFilter, folderFilter } = get()
    const filters: any = {}
    if (searchQuery) filters.search = searchQuery
    if (typeFilter) filters.type = typeFilter
    if (folderFilter !== null) filters.folderId = folderFilter

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
    get().loadHistory(get().page)
  },

  setReporting: (isReporting) => set({ isReporting }),

  appendReportContent: (token) =>
    set((state) => ({ reportContent: state.reportContent + token })),

  setShowReport: (showReport) => set({ showReport }),

  clearReport: () => set({ reportContent: '', isReporting: false, showReport: false }),

  setSearchQuery: (query: string) => {
    const { _searchTimeout } = get()
    if (_searchTimeout) clearTimeout(_searchTimeout)

    set({ searchQuery: query })

    const timeout = setTimeout(() => {
      get().loadHistory(1)
    }, 300)
    set({ _searchTimeout: timeout })
  },

  setTypeFilter: (type: string | null) => {
    set({ typeFilter: type })
    get().loadHistory(1)
  },

  setFolderFilter: (folderId: string | null) => {
    set({ folderFilter: folderId })
    get().loadHistory(1)
  },

  moveToFolder: async (ids: string | string[], folderId: string | null) => {
    await window.api.history.moveToFolder(ids, folderId)
    get().loadHistory(get().page)
  }
}))
