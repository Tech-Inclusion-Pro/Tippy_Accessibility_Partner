import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useAnalysisStore } from '../../stores/analysis.store'
import { ScoreBadge } from './ScoreBadge'
import { IssueCard } from './IssueCard'
import { Spinner } from '../common/Spinner'

interface AnalysisResultsProps {
  onExplainIssue?: (issueId: string) => void
  onFixIssue?: (issueId: string) => void
}

export function AnalysisResults({ onExplainIssue, onFixIssue }: AnalysisResultsProps): JSX.Element {
  const { isAnalyzing, analysisType, streamedContent, statusMessage, axeResults } =
    useAnalysisStore()

  if (!isAnalyzing && !streamedContent && !axeResults) {
    return <div />
  }

  return (
    <div className="flex flex-col gap-4 p-4" role="region" aria-label="Analysis results">
      {isAnalyzing && statusMessage && (
        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
          <Spinner size="sm" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* axe-core results for URL analysis */}
      {axeResults && (
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
            Automated Scan Results
          </h3>
          <div className="flex gap-2 mb-4 flex-wrap">
            <ScoreBadge label="Violations" score={axeResults.violations?.length || 0} maxScore={50} />
            <ScoreBadge label="Passes" score={axeResults.passes?.length || 0} />
            <ScoreBadge label="Needs Review" score={axeResults.incomplete?.length || 0} maxScore={50} />
          </div>

          {axeResults.violations?.length > 0 && (
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Violations ({axeResults.violations.length})
              </h4>
              {axeResults.violations.map((v: any) => (
                <IssueCard
                  key={v.id}
                  id={v.id}
                  impact={v.impact}
                  description={v.description}
                  help={v.help}
                  helpUrl={v.helpUrl}
                  nodeCount={v.nodes?.length || 0}
                  tags={v.tags || []}
                  onExplain={onExplainIssue}
                  onFix={onFixIssue}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Streamed AI analysis */}
      {streamedContent && (
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
            TIPPY&apos;s Analysis
          </h3>
          <div className="prose prose-sm max-w-none dark:prose-invert text-sm leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamedContent}</ReactMarkdown>
            {isAnalyzing && (
              <span className="inline-block w-2 h-4 bg-[var(--tippy-purple)] animate-pulse" aria-hidden="true" />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
