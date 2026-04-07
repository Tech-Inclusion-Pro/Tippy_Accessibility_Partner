import { create } from 'zustand'

interface AnalysisState {
  isAnalyzing: boolean
  analysisType: 'text' | 'url' | 'file' | null
  streamedContent: string
  statusMessage: string
  axeResults: any | null
  uploadedFilename: string | null
  analysisId: string | null
  setAnalyzing: (analyzing: boolean, type?: 'text' | 'url' | 'file') => void
  appendContent: (token: string) => void
  setStatusMessage: (message: string) => void
  setAxeResults: (results: any) => void
  setUploadedFilename: (filename: string | null) => void
  setAnalysisId: (id: string | null) => void
  reset: () => void
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  isAnalyzing: false,
  analysisType: null,
  streamedContent: '',
  statusMessage: '',
  axeResults: null,
  uploadedFilename: null,
  analysisId: null,

  setAnalyzing: (isAnalyzing, analysisType = null) =>
    set({ isAnalyzing, analysisType }),

  appendContent: (token) =>
    set((state) => ({ streamedContent: state.streamedContent + token })),

  setStatusMessage: (statusMessage) => set({ statusMessage }),

  setAxeResults: (axeResults) => set({ axeResults }),

  setUploadedFilename: (uploadedFilename) => set({ uploadedFilename }),

  setAnalysisId: (analysisId) => set({ analysisId }),

  reset: () =>
    set({
      isAnalyzing: false,
      analysisType: null,
      streamedContent: '',
      statusMessage: '',
      axeResults: null,
      uploadedFilename: null,
      analysisId: null
    })
}))
