import { create } from 'zustand'

export type OnboardingStep = 'welcome' | 'about-me' | 'provider' | 'done'

const STEPS: OnboardingStep[] = ['welcome', 'about-me', 'provider', 'done']

interface OnboardingState {
  currentStep: OnboardingStep
  userName: string
  userContext: string
  providerType: string
  setStep: (step: OnboardingStep) => void
  next: () => void
  back: () => void
  setUserName: (name: string) => void
  setUserContext: (context: string) => void
  setProviderType: (type: string) => void
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  currentStep: 'welcome',
  userName: '',
  userContext: '',
  providerType: 'ollama',

  setStep: (step) => set({ currentStep: step }),

  next: () => {
    const idx = STEPS.indexOf(get().currentStep)
    if (idx < STEPS.length - 1) set({ currentStep: STEPS[idx + 1] })
  },

  back: () => {
    const idx = STEPS.indexOf(get().currentStep)
    if (idx > 0) set({ currentStep: STEPS[idx - 1] })
  },

  setUserName: (userName) => set({ userName }),
  setUserContext: (userContext) => set({ userContext }),
  setProviderType: (providerType) => set({ providerType })
}))

export const ONBOARDING_STEPS = STEPS
