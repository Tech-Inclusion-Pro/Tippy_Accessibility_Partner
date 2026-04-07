import { useEffect, useState } from 'react'
import { useWindowStore, AppView } from './stores/window.store'
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation'
import { MiniWidget } from './components/widget/MiniWidget'
import { ChatPanel } from './components/panel/ChatPanel'
import { SettingsView } from './views/SettingsView'
import { HistoryView } from './views/HistoryView'
import { SkipLink } from './components/common/SkipLink'

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
  useKeyboardNavigation()

  // Set initial view from URL hash
  useEffect(() => {
    setView(getInitialView())
  }, [setView])

  // Listen for navigation from main process
  useEffect(() => {
    const cleanup = window.api.onNavigate((view) => {
      setView(view as AppView)
    })
    return cleanup
  }, [setView])

  // Widget mode — no nav
  if (currentView === 'widget') {
    return <MiniWidget />
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
