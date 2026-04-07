import { useEffect } from 'react'
import { useHistoryStore } from '../stores/history.store'
import { SkipLink } from '../components/common/SkipLink'
import { HistoryList } from '../components/history/HistoryList'
import { HistoryDetail } from '../components/history/HistoryDetail'

export function HistoryView(): JSX.Element {
  const { selectedItem, loadHistory } = useHistoryStore()

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  if (selectedItem) {
    return <HistoryDetail />
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-app)]">
      <SkipLink target="history-content" />
      <header className="flex items-center px-4 py-3 border-b border-[var(--border-default)]">
        <h1 className="text-base font-semibold text-[var(--text-primary)]">Audit History</h1>
      </header>
      <main id="history-content" className="flex-1 overflow-y-auto p-4">
        <HistoryList />
      </main>
    </div>
  )
}
