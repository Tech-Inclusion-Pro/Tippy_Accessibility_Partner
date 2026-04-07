import { useOnboardingStore } from '../../../stores/onboarding.store'
import { Input } from '../../common/Input'

export function AboutMeStep(): JSX.Element {
  const { userName, userContext, setUserName, setUserContext } = useOnboardingStore()

  return (
    <div className="flex flex-col gap-5 py-2">
      <div className="text-center">
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">About You</h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Help TIPPY personalize its responses. Both fields are optional.
        </p>
      </div>

      <Input
        label="Your Name"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        placeholder="e.g. Jordan"
      />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-[var(--text-secondary)]">
          Work Context
        </label>
        <textarea
          value={userContext}
          onChange={(e) => setUserContext(e.target.value)}
          placeholder="e.g. I'm a UX designer at a university, working on making our student portal more accessible."
          rows={3}
          className="px-3 py-2 rounded-lg border bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-default)] text-sm resize-y focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)]"
          aria-label="Work Context"
        />
        <p className="text-xs text-[var(--text-tertiary)]">
          TIPPY uses this to tailor advice to your role and domain.
        </p>
      </div>
    </div>
  )
}
