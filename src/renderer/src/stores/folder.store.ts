import { create } from 'zustand'

export interface Folder {
  id: string
  name: string
  created_at: string
  itemCount: number
}

interface FolderState {
  folders: Folder[]
  loading: boolean
  loadFolders: () => Promise<void>
  createFolder: (name: string) => Promise<string | null>
  renameFolder: (id: string, name: string) => Promise<void>
  deleteFolder: (id: string) => Promise<void>
}

export const useFolderStore = create<FolderState>((set) => ({
  folders: [],
  loading: false,

  loadFolders: async () => {
    set({ loading: true })
    const result = await window.api.folder.list()
    if (result.success && result.data) {
      set({ folders: result.data, loading: false })
    } else {
      set({ loading: false })
    }
  },

  createFolder: async (name: string) => {
    const result = await window.api.folder.create(name)
    if (result.success && result.data) {
      // Reload to get updated list with item counts
      const listResult = await window.api.folder.list()
      if (listResult.success && listResult.data) {
        set({ folders: listResult.data })
      }
      return result.data.id
    }
    return null
  },

  renameFolder: async (id: string, name: string) => {
    await window.api.folder.rename(id, name)
    const listResult = await window.api.folder.list()
    if (listResult.success && listResult.data) {
      set({ folders: listResult.data })
    }
  },

  deleteFolder: async (id: string) => {
    await window.api.folder.delete(id)
    const listResult = await window.api.folder.list()
    if (listResult.success && listResult.data) {
      set({ folders: listResult.data })
    }
  }
}))
