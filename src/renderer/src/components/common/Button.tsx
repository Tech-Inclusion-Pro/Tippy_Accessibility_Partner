import { ButtonHTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps): JSX.Element {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center font-medium rounded-lg transition-colors',
        'focus-visible:outline-3 focus-visible:outline-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-[var(--tippy-purple)] text-white hover:bg-[var(--tippy-purple-dark)] focus-visible:outline-[var(--tippy-purple)]':
            variant === 'primary',
          'bg-[var(--bg-muted)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border border-[var(--border-default)] focus-visible:outline-[var(--tippy-purple)]':
            variant === 'secondary',
          'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] focus-visible:outline-[var(--tippy-purple)]':
            variant === 'ghost',
          'bg-[var(--color-danger)] text-white hover:bg-red-700 focus-visible:outline-red-500':
            variant === 'danger'
        },
        {
          'text-sm px-3 min-h-[36px]': size === 'sm',
          'text-sm px-4 min-h-[var(--min-tap-target)]': size === 'md',
          'text-base px-6 min-h-[52px]': size === 'lg'
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
