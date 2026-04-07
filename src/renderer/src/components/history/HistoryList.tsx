import { useState } from 'react'
import { useHistoryStore, HistoryItem } from '../../stores/history.store'
import { Badge } from '../common/Badge'

const typeVariant = {
  text: 'teal' as const,
  url: 'purple' as const,
  chat: 'info' as const,
  file: 'warning' as const
}

export function HistoryList(): JSX.Element {
  const { items, total, page, loading, selectItem, deleteItem, loadHistory } = useHistoryStore()
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const totalPages = Math.ceil(total / 20)

  const handleDelete = (e: React.MouseEvent, id: string): void => {
    e.stopPropagation()
    if (confirmDeleteId === id) {
      deleteItem(id)
      setConfirmDeleteId(null)
    } else {
      setConfirmDeleteId(id)
    }
  }

  const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr)
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const truncate = (text: string, max: number): string =>
    text.length > max ? text.slice(0, max) + '...' : text

  return (
    <div className="flex flex-col gap-2" role="list" aria-label="Audit history">
      {loading && items.length === 0 && (
        <p className="text-sm text-[var(--text-tertiary)] text-center py-8">Loading...</p>
      )}
      {!loading && items.length === 0 && (
        <p className="text-sm text-[var(--text-tertiary)] text-center py-8">
          No analysis history yet. Try analyzing some text or a URL!
        </p>
      )}
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-2 rounded-lg border border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-colors"
          role="listitem"
        >
          <button
            onClick={() => selectItem(item)}
            className="flex-1 text-left p-3 min-w-0 focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)] rounded-l-lg"
          >
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={typeVariant[item.type]}>{item.type}</Badge>
              <span className="text-xs text-[var(--text-tertiary)]">{formatDate(item.created_at)}</span>
              {item.provider && (
                <span className="text-xs text-[var(--text-tertiary)] ml-auto">{item.provider}</span>
              )}
            </div>
            <p className="text-sm text-[var(--text-primary)] truncate">{truncate(item.input, 80)}</p>
          </button>
          <button
            onClick={(e) => handleDelete(e, item.id)}
            onBlur={() => setConfirmDeleteId(null)}
            className={`flex-shrink-0 mr-2 w-8 h-8 flex items-center justify-center rounded-lg transition-colors focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)] ${
              confirmDeleteId === item.id
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'text-[var(--text-tertiary)] hover:text-red-500 hover:bg-[var(--bg-hover)]'
            }`}
            aria-label={confirmDeleteId === item.id ? 'Confirm delete' : `Delete ${item.type} analysis`}
            title={confirmDeleteId === item.id ? 'Click again to confirm' : 'Delete'}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 4H13M6 4V3C6 2.45 6.45 2 7 2H9C9.55 2 10 2.45 10 3V4M12 4V13C12 13.55 11.55 14 11 14H5C4.45 14 4 13.55 4 13V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      ))}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-2" role="navigation" aria-label="History pagination">
          <button
            onClick={() => loadHistory(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1 text-sm rounded-lg bg-[var(--bg-muted)] text-[var(--text-secondary)] disabled:opacity-50 hover:bg-[var(--bg-hover)] min-h-[var(--min-tap-target)] focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)]"
            aria-label="Previous page"
          >
            Prev
          </button>
          <span className="flex items-center text-sm text-[var(--text-tertiary)]">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => loadHistory(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1 text-sm rounded-lg bg-[var(--bg-muted)] text-[var(--text-secondary)] disabled:opacity-50 hover:bg-[var(--bg-hover)] min-h-[var(--min-tap-target)] focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)]"
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
