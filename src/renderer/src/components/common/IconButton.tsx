import { ButtonHTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  size?: 'sm' | 'md' | 'lg'
}

export function IconButton({
  label,
  size = 'md',
  className,
  children,
  ...props
}: IconButtonProps): JSX.Element {
  return (
    <button
      aria-label={label}
      title={label}
      className={clsx(
        'inline-flex items-center justify-center rounded-lg transition-colors',
        'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]',
        'focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'w-8 h-8': size === 'sm',
          'w-[var(--min-tap-target)] h-[var(--min-tap-target)]': size === 'md',
          'w-12 h-12': size === 'lg'
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
