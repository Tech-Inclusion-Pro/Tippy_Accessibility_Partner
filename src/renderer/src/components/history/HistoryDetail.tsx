import { useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useHistoryStore } from '../../stores/history.store'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { MoveToFolderMenu } from './MoveToFolderMenu'

const typeBadgeVariant = {
  text: 'teal' as const,
  url: 'purple' as const,
  chat: 'info' as const,
  file: 'warning' as const
}

export function HistoryDetail(): JSX.Element | null {
  const { selectedItem, selectItem, deleteItem } = useHistoryStore()

  const handleDownloadDocx = useCallback(async () => {
    if (!selectedItem) return
    const frameworks = selectedItem.frameworks ? JSON.parse(selectedItem.frameworks) : []
    await window.api.export.docx({
      content: selectedItem.result,
      title: `TIPPY Analysis — ${selectedItem.input}`,
      frameworks
    })
  }, [selectedItem])

  if (!selectedItem) return null

  const scores = selectedItem.scores ? JSON.parse(selectedItem.scores) : null
  const frameworks = selectedItem.frameworks ? JSON.parse(selectedItem.frameworks) : []

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border-default)]">
        <button
          onClick={() => selectItem(null)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)]"
          aria-label="Back to list"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <Badge variant={typeBadgeVariant[selectedItem.type] || 'default'}>
          {selectedItem.type}
        </Badge>
        <span className="text-xs text-[var(--text-tertiary)]">
          {new Date(selectedItem.created_at).toLocaleString()}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <MoveToFolderMenu itemId={selectedItem.id} currentFolderId={selectedItem.folder_id} />
          <Button variant="secondary" size="sm" onClick={handleDownloadDocx}>
            Download DOCX
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              deleteItem(selectedItem.id)
              selectItem(null)
            }}
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
            Input
          </h4>
          <p className="text-sm text-[var(--text-primary)] bg-[var(--bg-muted)] rounded-lg p-3 whitespace-pre-wrap">
            {selectedItem.input}
          </p>
        </div>

        {scores && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
              Scores
            </h4>
            <pre className="text-xs text-[var(--text-secondary)] bg-[var(--bg-muted)] rounded-lg p-3 overflow-x-auto">
              {JSON.stringify(scores, null, 2)}
            </pre>
          </div>
        )}

        {frameworks.length > 0 && (
          <div className="flex gap-1 mb-4">
            {frameworks.map((f: string) => (
              <Badge key={f} variant="purple">{f}</Badge>
            ))}
          </div>
        )}

        <div>
          <h4 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
            Result
          </h4>
          <div className="prose prose-sm max-w-none dark:prose-invert text-sm bg-[var(--bg-muted)] rounded-lg p-3">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{selectedItem.result}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  )
}
