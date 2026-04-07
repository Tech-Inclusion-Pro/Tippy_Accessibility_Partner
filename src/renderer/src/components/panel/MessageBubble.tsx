import { clsx } from 'clsx'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import tippyAvatar from '../../assets/tippy-avatar.png'

interface MessageBubbleProps {
  role: 'user' | 'assistant'
  content: string
  frameworks?: string[]
  isStreaming?: boolean
}

export function MessageBubble({ role, content, frameworks, isStreaming }: MessageBubbleProps): JSX.Element {
  const isUser = role === 'user'

  return (
    <div
      className={clsx('flex gap-3 px-4 py-3', isUser ? 'justify-end' : 'justify-start')}
      role="listitem"
    >
      {!isUser && (
        <img
          src={tippyAvatar}
          alt=""
          aria-hidden="true"
          className="w-8 h-8 rounded-full flex-shrink-0 mt-1"
        />
      )}
      <div
        className={clsx(
          'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'bg-[var(--tippy-purple)] text-white rounded-br-md'
            : 'bg-[var(--bg-muted)] text-[var(--text-primary)] rounded-bl-md'
        )}
      >
        {isUser ? (
          <p>{content}</p>
        ) : (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-[var(--tippy-purple)] animate-pulse ml-0.5" aria-hidden="true" />
            )}
          </div>
        )}
        {frameworks && frameworks.length > 0 && !isUser && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {frameworks.map((f) => (
              <span
                key={f}
                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-[var(--bg-surface)] text-[var(--text-tertiary)]"
              >
                {f.toUpperCase()}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
