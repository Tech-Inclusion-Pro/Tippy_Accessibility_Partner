import { useOnboardingStore, ONBOARDING_STEPS } from '../../stores/onboarding.store'
import { useSettingsStore } from '../../stores/settings.store'
import { Button } from '../common/Button'
import { WelcomeStep } from './steps/WelcomeStep'
import { AboutMeStep } from './steps/AboutMeStep'
import { ProviderStep } from './steps/ProviderStep'
import { DoneStep } from './steps/DoneStep'

const STEP_LABELS = ['Welcome', 'About Me', 'Provider', 'Done']

interface SetupWizardProps {
  onComplete: () => void
}

export function SetupWizard({ onComplete }: SetupWizardProps): JSX.Element {
  const { currentStep, next, back, userName, userContext, providerType } = useOnboardingStore()
  const { setSetting } = useSettingsStore()

  const stepIndex = ONBOARDING_STEPS.indexOf(currentStep)
  const isFirst = stepIndex === 0
  const isLast = stepIndex === ONBOARDING_STEPS.length - 1

  const handleFinish = async (): Promise<void> => {
    // Persist all collected data
    if (userName) await setSetting('user_name', userName)
    if (userContext) await setSetting('user_context', userContext)
    await setSetting('provider_type', providerType)
    await setSetting('onboarding_complete', 'true')
    onComplete()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--bg-app)]">
      {/* Progress bar */}
      <div className="flex items-center gap-2 px-6 pt-10 pb-2">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`h-1 w-full rounded-full transition-colors ${
                i <= stepIndex ? 'bg-[var(--tippy-purple)]' : 'bg-[var(--bg-muted)]'
              }`}
            />
            <span className={`text-[10px] ${
              i <= stepIndex ? 'text-[var(--tippy-purple)] font-medium' : 'text-[var(--text-tertiary)]'
            }`}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-sm mx-auto">
          {currentStep === 'welcome' && <WelcomeStep />}
          {currentStep === 'about-me' && <AboutMeStep />}
          {currentStep === 'provider' && <ProviderStep />}
          {currentStep === 'done' && <DoneStep />}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border-default)]">
        {!isFirst ? (
          <Button variant="ghost" onClick={back}>
            Back
          </Button>
        ) : (
          <div />
        )}
        {isLast ? (
          <Button onClick={handleFinish}>
            Start Using TIPPY
          </Button>
        ) : (
          <Button onClick={next}>
            {currentStep === 'welcome' ? 'Get Started' : 'Next'}
          </Button>
        )}
      </div>
    </div>
  )
}
