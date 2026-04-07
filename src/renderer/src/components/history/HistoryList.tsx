import { useHistoryStore, HistoryItem } from '../../stores/history.store'
import { Badge } from '../common/Badge'

const typeVariant = {
  text: 'teal' as const,
  url: 'purple' as const,
  chat: 'info' as const,
  file: 'warning' as const
}

export function HistoryList(): JSX.Element {
  const { items, total, page, loading, selectItem, loadHistory } = useHistoryStore()
  const totalPages = Math.ceil(total / 20)

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
        <button
          key={item.id}
          onClick={() => selectItem(item)}
          className="w-full text-left p-3 rounded-lg border border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-colors focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)]"
          role="listitem"
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
