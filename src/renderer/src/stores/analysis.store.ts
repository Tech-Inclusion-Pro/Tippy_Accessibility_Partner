import { create } from 'zustand'

interface AnalysisState {
  isAnalyzing: boolean
  analysisType: 'text' | 'url' | null
  streamedContent: string
  statusMessage: string
  axeResults: any | null
  setAnalyzing: (analyzing: boolean, type?: 'text' | 'url') => void
  appendContent: (token: string) => void
  setStatusMessage: (message: string) => void
  setAxeResults: (results: any) => void
  reset: () => void
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  isAnalyzing: false,
  analysisType: null,
  streamedContent: '',
  statusMessage: '',
  axeResults: null,

  setAnalyzing: (isAnalyzing, analysisType = null) =>
    set({ isAnalyzing, analysisType }),

  appendContent: (token) =>
    set((state) => ({ streamedContent: state.streamedContent + token })),

  setStatusMessage: (statusMessage) => set({ statusMessage }),

  setAxeResults: (axeResults) => set({ axeResults }),

  reset: () =>
    set({
      isAnalyzing: false,
      analysisType: null,
      streamedContent: '',
      statusMessage: '',
      axeResults: null
    })
}))
