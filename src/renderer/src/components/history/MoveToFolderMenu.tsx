import { useState, useEffect, useRef } from 'react'
import { useFolderStore } from '../../stores/folder.store'
import { useHistoryStore } from '../../stores/history.store'

interface MoveToFolderMenuProps {
  itemId: string
  currentFolderId: string | null
}

export function MoveToFolderMenu({ itemId, currentFolderId }: MoveToFolderMenuProps): JSX.Element {
  const [open, setOpen] = useState(false)
  const { folders, loadFolders } = useFolderStore()
  const { moveToFolder } = useHistoryStore()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) loadFolders()
  }, [open, loadFolders])

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleSelect = async (folderId: string | null): Promise<void> => {
    await moveToFolder(itemId, folderId)
    setOpen(false)
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation()
          setOpen(!open)
        }}
        className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-colors text-[var(--text-tertiary)] hover:text-[var(--tippy-purple)] hover:bg-[var(--bg-hover)] focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)]"
        aria-label="Move to folder"
        title="Move to folder"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M2 4C2 3.45 2.45 3 3 3H6L8 5H13C13.55 5 14 5.45 14 6V12C14 12.55 13.55 13 13 13H3C2.45 13 2 12.55 2 12V4Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-50 min-w-[160px] rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-lg py-1"
          role="menu"
          aria-label="Choose folder"
        >
          {currentFolderId && (
            <button
              onClick={() => handleSelect(null)}
              className="w-full text-left px-3 py-1.5 text-xs text-red-500 hover:bg-[var(--bg-hover)] focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)]"
              role="menuitem"
            >
              Remove from folder
            </button>
          )}
          {folders.length === 0 && (
            <p className="px-3 py-1.5 text-xs text-[var(--text-tertiary)]">No folders yet</p>
          )}
          {folders.map((f) => (
            <button
              key={f.id}
              onClick={() => handleSelect(f.id)}
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[var(--bg-hover)] focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)] ${
                currentFolderId === f.id
                  ? 'text-[var(--tippy-purple)] font-medium'
                  : 'text-[var(--text-primary)]'
              }`}
              role="menuitem"
            >
              {f.name}
              {currentFolderId === f.id && ' (current)'}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
