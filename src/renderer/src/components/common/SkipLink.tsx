interface SkipLinkProps {
  target: string
  children?: React.ReactNode
}

export function SkipLink({ target, children = 'Skip to main content' }: SkipLinkProps): JSX.Element {
  return (
    <a href={`#${target}`} className="skip-link">
      {children}
    </a>
  )
}
