export function WelcomeStep(): JSX.Element {
  return (
    <div className="flex flex-col items-center text-center gap-6 py-4">
      <div className="w-20 h-20 rounded-full bg-[var(--tippy-purple)] flex items-center justify-center text-white text-3xl font-bold shadow-lg">
        T
      </div>
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          Welcome to TIPPY
        </h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-xs leading-relaxed">
          Your AI accessibility and inclusion partner. Let&apos;s get you set up in just a few quick steps.
        </p>
      </div>
      <div className="flex flex-col gap-2 text-xs text-[var(--text-tertiary)] max-w-xs">
        <p>TIPPY helps you analyze content for:</p>
        <ul className="text-left space-y-1">
          <li>WCAG 2.1 AA accessibility compliance</li>
          <li>Universal Design for Learning (UDL)</li>
          <li>Disability Critical Race Theory (DisCrit)</li>
          <li>Plain Language readability</li>
        </ul>
      </div>
    </div>
  )
}
