import { useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useHistoryStore } from '../../stores/history.store'
import { Spinner } from '../common/Spinner'
import { Button } from '../common/Button'

export function HistoryReport(): JSX.Element {
  const { reportContent, isReporting, clearReport } = useHistoryStore()

  const handleDownloadDocx = useCallback(async () => {
    if (!reportContent) return
    await window.api.export.docx({
      content: reportContent,
      title: 'TIPPY Themes Report'
    })
  }, [reportContent])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border-default)]">
        <button
          onClick={clearReport}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)]"
          aria-label="Back to history"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <h2 className="text-base font-semibold text-[var(--text-primary)]">Themes Report</h2>
        {!isReporting && reportContent && (
          <div className="ml-auto">
            <Button variant="secondary" size="sm" onClick={handleDownloadDocx}>
              Download DOCX
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4" role="region" aria-label="Themes report" aria-live="polite">
        {isReporting && !reportContent && (
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <Spinner size="sm" label="Generating themes report" />
            <span>Analyzing your history and generating themes report...</span>
          </div>
        )}

        {reportContent && (
          <div className="prose prose-sm max-w-none dark:prose-invert text-sm leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{reportContent}</ReactMarkdown>
            {isReporting && (
              <span
                className="inline-block w-2 h-4 bg-[var(--tippy-purple)] animate-pulse"
                aria-hidden="true"
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
