import { clsx } from 'clsx'

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'teal'
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'default', children, className }: BadgeProps): JSX.Element {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        {
          'bg-[var(--bg-muted)] text-[var(--text-secondary)]': variant === 'default',
          'bg-green-100 text-green-800': variant === 'success',
          'bg-amber-100 text-amber-800': variant === 'warning',
          'bg-red-100 text-red-800': variant === 'danger',
          'bg-cyan-100 text-cyan-800': variant === 'info',
          'bg-purple-100 text-purple-800': variant === 'purple',
          'bg-teal-100 text-teal-800': variant === 'teal'
        },
        className
      )}
    >
      {children}
    </span>
  )
}
