import { useEffect, useCallback } from 'react'
import { useHistoryStore } from '../stores/history.store'
import { useStreamingResponse } from '../hooks/useStreamingResponse'
import { SkipLink } from '../components/common/SkipLink'
import { HistoryToolbar } from '../components/history/HistoryToolbar'
import { HistoryList } from '../components/history/HistoryList'
import { HistoryDetail } from '../components/history/HistoryDetail'
import { HistoryReport } from '../components/history/HistoryReport'

export function HistoryView(): JSX.Element {
  const {
    selectedItem,
    showReport,
    isReporting,
    loadHistory,
    setShowReport,
    setReporting,
    appendReportContent,
    clearReport
  } = useHistoryStore()

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  useStreamingResponse({
    channel: 'history:report-stream-token',
    onToken: (token) => {
      appendReportContent(token)
    },
    onDone: () => {
      setReporting(false)
      loadHistory()
    }
  })

  const handleReportThemes = useCallback(async () => {
    clearReport()
    setShowReport(true)
    setReporting(true)
    const result = await window.api.history.reportThemes()
    if (!result.success) {
      setReporting(false)
      appendReportContent(`\n\n**Error:** ${result.error}`)
    }
  }, [clearReport, setShowReport, setReporting, appendReportContent])

  if (showReport) {
    return <HistoryReport />
  }

  if (selectedItem) {
    return <HistoryDetail />
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-app)]">
      <SkipLink target="history-content" />
      <HistoryToolbar onReportThemes={handleReportThemes} isReporting={isReporting} />
      <main id="history-content" className="flex-1 overflow-y-auto p-4">
        <HistoryList />
      </main>
    </div>
  )
}
