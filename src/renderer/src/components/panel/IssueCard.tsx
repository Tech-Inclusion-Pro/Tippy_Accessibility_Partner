import { useState } from 'react'
import { Badge } from '../common/Badge'
import { clsx } from 'clsx'

interface IssueCardProps {
  id: string
  impact: 'critical' | 'serious' | 'moderate' | 'minor'
  description: string
  help: string
  helpUrl: string
  nodeCount: number
  tags: string[]
  onExplain?: (id: string) => void
  onFix?: (id: string) => void
}

const impactVariant = {
  critical: 'danger' as const,
  serious: 'warning' as const,
  moderate: 'info' as const,
  minor: 'default' as const
}

export function IssueCard({
  id,
  impact,
  description,
  help,
  helpUrl,
  nodeCount,
  tags,
  onExplain,
  onFix
}: IssueCardProps): JSX.Element {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border border-[var(--border-default)] rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 p-3 text-left hover:bg-[var(--bg-hover)] transition-colors focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)]"
        aria-expanded={expanded}
      >
        <Badge variant={impactVariant[impact]}>{impact}</Badge>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)] truncate">{help}</p>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            {nodeCount} element{nodeCount !== 1 ? 's' : ''} affected
          </p>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={clsx('flex-shrink-0 mt-1 transition-transform', expanded && 'rotate-180')}
          aria-hidden="true"
        >
          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {expanded && (
        <div className="px-3 pb-3 border-t border-[var(--border-default)]">
          <p className="text-sm text-[var(--text-secondary)] mt-2">{description}</p>
          <div className="flex gap-1 mt-2 flex-wrap">
            {tags
              .filter((t) => t.startsWith('wcag'))
              .map((t) => (
                <Badge key={t} variant="purple">
                  {t}
                </Badge>
              ))}
          </div>
          <div className="flex gap-2 mt-3">
            {onExplain && (
              <button
                onClick={() => onExplain(id)}
                className="text-xs px-3 py-1.5 rounded-lg bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors min-h-[var(--min-tap-target)] focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)]"
              >
                Explain this
              </button>
            )}
            {onFix && (
              <button
                onClick={() => onFix(id)}
                className="text-xs px-3 py-1.5 rounded-lg bg-[var(--tippy-purple)] text-white hover:bg-[var(--tippy-purple-dark)] transition-colors min-h-[var(--min-tap-target)] focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)]"
              >
                How do I fix this?
              </button>
            )}
            <a
              href={helpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-lg text-[var(--tippy-blue)] hover:underline min-h-[var(--min-tap-target)] inline-flex items-center focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)]"
            >
              Learn more
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
