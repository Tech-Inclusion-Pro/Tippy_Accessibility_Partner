import { clsx } from 'clsx'

interface ScoreBadgeProps {
  label: string
  score: number
  maxScore?: number
  className?: string
}

export function ScoreBadge({ label, score, maxScore = 100, className }: ScoreBadgeProps): JSX.Element {
  const percentage = (score / maxScore) * 100
  const variant =
    percentage >= 70 ? 'good' : percentage >= 40 ? 'moderate' : 'poor'

  return (
    <div
      className={clsx(
        'flex items-center gap-2 px-3 py-2 rounded-lg border',
        {
          'border-green-200 bg-green-50': variant === 'good',
          'border-amber-200 bg-amber-50': variant === 'moderate',
          'border-red-200 bg-red-50': variant === 'poor'
        },
        className
      )}
    >
      <div
        className={clsx('text-lg font-bold', {
          'text-green-700': variant === 'good',
          'text-amber-700': variant === 'moderate',
          'text-red-700': variant === 'poor'
        })}
      >
        {Math.round(score)}
      </div>
      <div className="text-xs text-[var(--text-secondary)]">{label}</div>
    </div>
  )
}
