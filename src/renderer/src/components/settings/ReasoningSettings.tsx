import { useState, useEffect, useCallback } from 'react'
import { Button } from '../common/Button'
import { Spinner } from '../common/Spinner'

interface ScreenerInfo {
  id: string
  name: string
  filename: string
  builtIn: boolean
  framework: string
}

const FRAMEWORK_LABELS: Record<string, string> = {
  wcag: 'WCAG',
  udl: 'UDL',
  discrit: 'DisCrit',
  custom: 'Custom'
}

const FRAMEWORK_COLORS: Record<string, string> = {
  wcag: 'bg-blue-100 text-blue-800 border-blue-200',
  udl: 'bg-green-100 text-green-800 border-green-200',
  discrit: 'bg-purple-100 text-purple-800 border-purple-200',
  custom: 'bg-gray-100 text-gray-800 border-gray-200'
}

export function ReasoningSettings(): JSX.Element {
  const [screeners, setScreeners] = useState<ScreenerInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [previewContent, setPreviewContent] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)

  const loadScreeners = useCallback(async () => {
    const result = await window.api.screener.list()
    if (result.success && result.data) {
      setScreeners(result.data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadScreeners()
  }, [loadScreeners])

  const handlePreview = async (id: string): Promise<void> => {
    if (expandedId === id) {
      setExpandedId(null)
      setPreviewContent(null)
      return
    }
    setExpandedId(id)
    setPreviewContent(null)
    const result = await window.api.screener.getContent(id)
    if (result.success && result.data) {
      setPreviewContent(result.data)
    }
  }

  const handleExport = async (id: string): Promise<void> => {
    await window.api.screener.export(id)
  }

  const handleImport = async (): Promise<void> => {
    setImporting(true)
    const result = await window.api.screener.import()
    if (result.success) {
      await loadScreeners()
    }
    setImporting(false)
  }

  const handleDelete = async (id: string): Promise<void> => {
    const result = await window.api.screener.delete(id)
    if (result.success) {
      setScreeners((prev) => prev.filter((s) => s.id !== id))
      if (expandedId === id) {
        setExpandedId(null)
        setPreviewContent(null)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4">
        <Spinner size="sm" label="Loading screeners" />
        <span className="text-sm text-[var(--text-secondary)]">Loading reasoning files...</span>
      </div>
    )
  }

  const builtIn = screeners.filter((s) => s.builtIn)
  const custom = screeners.filter((s) => !s.builtIn)

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Reasoning</h3>
        <p className="text-xs text-[var(--text-tertiary)] mb-4">
          TIPPY uses these screener files as structured thinking guides when analyzing content.
          Each screener defines the diagnostic questions, criteria, and checks the AI runs through
          before producing a response. You can download any screener, or add your own.
        </p>
      </div>

      {/* How it works */}
      <div className="rounded-lg bg-[var(--bg-muted)] border border-[var(--border-default)] p-3">
        <h4 className="text-xs font-semibold text-[var(--text-primary)] mb-2">How TIPPY Reasons</h4>
        <ol className="text-xs text-[var(--text-secondary)] space-y-1.5 list-decimal list-inside">
          <li>When you send a message or analyze content, TIPPY loads the screener files matching your active frameworks (WCAG, UDL, DisCrit)</li>
          <li>The screener content is injected into the AI system prompt as a structured pre-flight checklist</li>
          <li>The AI runs through every section of each screener, flagging issues and asking diagnostic questions</li>
          <li>Custom screeners you add are always included alongside the built-in ones</li>
        </ol>
      </div>

      {/* Built-in screeners */}
      <div>
        <h4 className="text-xs font-semibold text-[var(--text-primary)] mb-2">
          Built-in Screeners
          <span className="ml-1 font-normal text-[var(--text-tertiary)]">({builtIn.length})</span>
        </h4>
        <div className="flex flex-col gap-2">
          {builtIn.map((screener) => (
            <ScreenerCard
              key={screener.id}
              screener={screener}
              expanded={expandedId === screener.id}
              previewContent={expandedId === screener.id ? previewContent : null}
              onPreview={() => handlePreview(screener.id)}
              onExport={() => handleExport(screener.id)}
            />
          ))}
        </div>
      </div>

      {/* Custom screeners */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold text-[var(--text-primary)]">
            Custom Screeners
            <span className="ml-1 font-normal text-[var(--text-tertiary)]">({custom.length})</span>
          </h4>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleImport}
            disabled={importing}
          >
            {importing ? <Spinner size="sm" label="Importing" /> : '+ Import .md File'}
          </Button>
        </div>

        {custom.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[var(--border-default)] p-4 text-center">
            <p className="text-xs text-[var(--text-tertiary)]">
              No custom screeners yet. Import a Markdown file to add your own reasoning framework.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {custom.map((screener) => (
              <ScreenerCard
                key={screener.id}
                screener={screener}
                expanded={expandedId === screener.id}
                previewContent={expandedId === screener.id ? previewContent : null}
                onPreview={() => handlePreview(screener.id)}
                onExport={() => handleExport(screener.id)}
                onDelete={() => handleDelete(screener.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ScreenerCard({
  screener,
  expanded,
  previewContent,
  onPreview,
  onExport,
  onDelete
}: {
  screener: ScreenerInfo
  expanded: boolean
  previewContent: string | null
  onPreview: () => void
  onExport: () => void
  onDelete?: () => void
}): JSX.Element {
  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2.5">
        {/* Framework badge */}
        <span
          className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${FRAMEWORK_COLORS[screener.framework] || FRAMEWORK_COLORS.custom}`}
        >
          {FRAMEWORK_LABELS[screener.framework] || screener.framework}
        </span>

        {/* Name */}
        <span className="flex-1 text-sm text-[var(--text-primary)] font-medium truncate">
          {screener.name}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={onPreview}
            className="text-xs px-2 py-1 rounded text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)]"
            aria-expanded={expanded}
            aria-label={`${expanded ? 'Hide' : 'View'} ${screener.name}`}
          >
            {expanded ? 'Hide' : 'View'}
          </button>
          <button
            onClick={onExport}
            className="text-xs px-2 py-1 rounded text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)]"
            aria-label={`Download ${screener.name}`}
            title="Download"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 2V9M7 9L4.5 6.5M7 9L9.5 6.5M3 11H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {onDelete && (
            <button
              onClick={onDelete}
              className="text-xs px-2 py-1 rounded text-red-500 hover:bg-red-50 transition-colors focus-visible:outline-3 focus-visible:outline-red-500"
              aria-label={`Delete ${screener.name}`}
              title="Delete"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M3.5 4.5V11.5H10.5V4.5M2 3H12M5.5 3V2H8.5V3M5.5 6.5V9.5M8.5 6.5V9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Expanded preview */}
      {expanded && (
        <div className="border-t border-[var(--border-default)] px-3 py-3 max-h-64 overflow-y-auto">
          {previewContent ? (
            <pre className="text-xs text-[var(--text-secondary)] whitespace-pre-wrap font-mono leading-relaxed">
              {previewContent}
            </pre>
          ) : (
            <div className="flex items-center gap-2">
              <Spinner size="sm" label="Loading content" />
              <span className="text-xs text-[var(--text-tertiary)]">Loading...</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
