import { useEffect, useState } from 'react'
import { useWindowStore, AppView } from './stores/window.store'
import { useSettingsStore } from './stores/settings.store'
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation'
import { MiniWidget } from './components/widget/MiniWidget'
import { ChatPanel } from './components/panel/ChatPanel'
import { SettingsView } from './views/SettingsView'
import { HistoryView } from './views/HistoryView'
import { SkipLink } from './components/common/SkipLink'
import { SetupWizard } from './components/onboarding/SetupWizard'

function getInitialView(): AppView {
  const hash = window.location.hash.replace('#/', '').replace('/', '')
  if (['widget', 'chat', 'settings', 'history'].includes(hash)) {
    return hash as AppView
  }
  return 'widget'
}

function PanelNav({ currentView, onNavigate }: { currentView: AppView; onNavigate: (view: AppView) => void }): JSX.Element {
  const navItems: { id: AppView; label: string; icon: JSX.Element }[] = [
    {
      id: 'chat',
      label: 'Chat',
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M3 3H15V12H6L3 15V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      id: 'history',
      label: 'History',
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M9 5.5V9L11.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M9 2V4M9 14V16M2 9H4M14 9H16M4.2 4.2L5.6 5.6M12.4 12.4L13.8 13.8M4.2 13.8L5.6 12.4M12.4 5.6L13.8 4.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )
    }
  ]

  return (
    <nav
      className="flex items-center border-b border-[var(--border-default)] bg-[var(--bg-surface)]"
      role="tablist"
      aria-label="Main navigation"
    >
      {/* macOS traffic light padding */}
      <div className="w-[72px] flex-shrink-0 drag-region h-10" />
      {navItems.map((item) => (
        <button
          key={item.id}
          role="tab"
          aria-selected={currentView === item.id}
          onClick={() => onNavigate(item.id)}
          className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors min-h-[var(--min-tap-target)] focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)] ${
            currentView === item.id
              ? 'text-[var(--tippy-purple)] border-b-2 border-[var(--tippy-purple)]'
              : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
          }`}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </nav>
  )
}

export default function App(): JSX.Element {
  const { currentView, setView } = useWindowStore()
  const { settings, loadSettings } = useSettingsStore()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingChecked, setOnboardingChecked] = useState(false)
  useKeyboardNavigation()

  // Set initial view from URL hash
  useEffect(() => {
    setView(getInitialView())
  }, [setView])

  // Check onboarding status on mount
  useEffect(() => {
    loadSettings().then(() => {
      setOnboardingChecked(true)
    })
  }, [loadSettings])

  // Determine whether to show onboarding after settings are loaded
  useEffect(() => {
    if (onboardingChecked && currentView !== 'widget') {
      setShowOnboarding(settings.onboarding_complete !== 'true')
    }
  }, [onboardingChecked, settings.onboarding_complete, currentView])

  // Listen for navigation from main process
  useEffect(() => {
    const cleanup = window.api.onNavigate((view) => {
      setView(view as AppView)
    })
    return cleanup
  }, [setView])

  // Apply saved accessibility settings on startup
  useEffect(() => {
    if (currentView === 'widget') return
    try {
      const raw = localStorage.getItem('tippy-a11y-settings')
      if (raw) {
        const a11y = JSON.parse(raw)
        // Re-apply CSS classes — the AccessibilitySettings component's applyAllSettings
        // handles this when the settings view mounts, but we need it on initial load too
        const html = document.documentElement
        if (a11y.highContrast) html.classList.add('a11y-high-contrast')
        if (a11y.fontSize && a11y.fontSize !== 100) {
          html.classList.add('a11y-font-scaled')
          html.style.setProperty('--a11y-font-scale', String(a11y.fontSize / 100))
        }
        if (a11y.colorBlindMode && a11y.colorBlindMode !== 'none') {
          html.classList.add(`a11y-cb-${a11y.colorBlindMode}`)
        }
        if (a11y.reducedMotion) html.classList.add('a11y-reduced-motion')
        if (a11y.cursorStyle && a11y.cursorStyle !== 'default') {
          html.classList.add(`a11y-cursor-${a11y.cursorStyle}`)
        }
        if (a11y.dyslexicFont) html.classList.add('a11y-dyslexic')
        if (a11y.textSpacing) html.classList.add('a11y-text-spacing')
        if (a11y.enhancedFocus) html.classList.add('a11y-enhanced-focus')
        if (a11y.bionicReading) html.classList.add('a11y-bionic')
      }
    } catch {
      /* ignore */
    }
  }, [currentView])

  // Make body transparent in widget mode, opaque in panel mode
  useEffect(() => {
    if (currentView === 'widget') {
      document.body.style.background = 'transparent'
      document.documentElement.style.background = 'transparent'
    } else {
      document.body.style.background = ''
      document.documentElement.style.background = ''
    }
  }, [currentView])

  // Widget mode — no nav, no onboarding
  if (currentView === 'widget') {
    return <MiniWidget />
  }

  // Show onboarding wizard overlay
  if (showOnboarding) {
    return (
      <div className="flex flex-col h-screen bg-[var(--bg-app)]">
        <SetupWizard onComplete={() => setShowOnboarding(false)} />
      </div>
    )
  }

  // Panel mode
  return (
    <div className="flex flex-col h-screen bg-[var(--bg-app)]">
      <SkipLink target="main-content" />
      <PanelNav currentView={currentView} onNavigate={setView} />
      <main id="main-content" className="flex-1 overflow-hidden">
        {currentView === 'chat' && <ChatPanel />}
        {currentView === 'settings' && <SettingsView />}
        {currentView === 'history' && <HistoryView />}
      </main>
    </div>
  )
}
