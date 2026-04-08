import { useEffect, useState } from 'react'
import { useHistoryStore } from '../../stores/history.store'
import { useFolderStore } from '../../stores/folder.store'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { FolderManager } from './FolderManager'

const types = [
  { value: null, label: 'All' },
  { value: 'text', label: 'Text', variant: 'teal' as const },
  { value: 'url', label: 'URL', variant: 'purple' as const },
  { value: 'chat', label: 'Chat', variant: 'info' as const },
  { value: 'file', label: 'File', variant: 'warning' as const }
]

interface HistoryToolbarProps {
  onReportThemes: () => void
  isReporting: boolean
}

export function HistoryToolbar({ onReportThemes, isReporting }: HistoryToolbarProps): JSX.Element {
  const { searchQuery, typeFilter, folderFilter, setSearchQuery, setTypeFilter, setFolderFilter } =
    useHistoryStore()
  const { folders, loadFolders } = useFolderStore()
  const [showFolderManager, setShowFolderManager] = useState(false)

  useEffect(() => {
    loadFolders()
  }, [loadFolders])

  return (
    <div className="flex flex-col gap-2 px-4 py-3 border-b border-[var(--border-default)]">
      <div className="flex items-center gap-2">
        <h1 className="text-base font-semibold text-[var(--text-primary)]">Audit History</h1>
        <div className="ml-auto">
          <Button variant="secondary" size="sm" onClick={onReportThemes} disabled={isReporting}>
            Report on Themes
          </Button>
        </div>
      </div>

      <div className="relative">
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
          aria-hidden="true"
        >
          <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search history..."
          className="w-full pl-9 pr-3 min-h-[36px] rounded-lg border bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-default)] focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)] focus-visible:outline-offset-0 placeholder:text-[var(--text-tertiary)] text-sm"
          aria-label="Search history"
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1" role="group" aria-label="Filter by type">
          {types.map((t) => (
            <button
              key={t.label}
              onClick={() => setTypeFilter(t.value)}
              className="focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)] rounded-full"
              aria-pressed={typeFilter === t.value}
            >
              <Badge
                variant={t.variant || 'default'}
                className={
                  typeFilter === t.value
                    ? 'ring-2 ring-[var(--tippy-purple)] ring-offset-1'
                    : 'opacity-60 hover:opacity-100'
                }
              >
                {t.label}
              </Badge>
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1">
          <select
            value={folderFilter ?? ''}
            onChange={(e) => {
              const val = e.target.value
              setFolderFilter(val === '' ? null : val)
            }}
            className="text-xs px-2 py-1 rounded-lg border bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-default)] focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)]"
            aria-label="Filter by folder"
          >
            <option value="">All Items</option>
            <option value="__unfiled__">Unfiled</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.itemCount})
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowFolderManager(!showFolderManager)}
            className="text-xs px-2 py-1 rounded-lg text-[var(--tippy-purple)] hover:bg-[var(--bg-hover)] focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)]"
            aria-expanded={showFolderManager}
            aria-label="Manage folders"
          >
            Folders
          </button>
        </div>
      </div>

      {showFolderManager && (
        <div className="border-t border-[var(--border-default)] pt-2">
          <FolderManager />
        </div>
      )}
    </div>
  )
}
