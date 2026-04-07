import { SkipLink } from '../components/common/SkipLink'
import { ProviderConfig } from '../components/settings/ProviderConfig'

export function SettingsView(): JSX.Element {
  return (
    <div className="flex flex-col h-full bg-[var(--bg-app)]">
      <SkipLink target="settings-content" />
      <header className="flex items-center px-4 py-3 border-b border-[var(--border-default)]">
        <h1 className="text-base font-semibold text-[var(--text-primary)]">Settings</h1>
      </header>
      <main id="settings-content" className="flex-1 overflow-y-auto p-4">
        <div className="max-w-md mx-auto flex flex-col gap-8">
          <ProviderConfig />

          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">About</h3>
            <div className="text-sm text-[var(--text-secondary)] space-y-1">
              <p>TIPPY - Accessibility Partner v1.0.0</p>
              <p>By Tech Inclusion Pro</p>
              <p className="text-xs text-[var(--text-tertiary)]">
                AI-powered accessibility analysis using WCAG 2.1 AA, UDL, DisCrit, and Plain Language frameworks.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
