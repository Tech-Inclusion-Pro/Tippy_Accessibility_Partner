import { useState, useRef, useEffect } from 'react'
import { useFolderStore, Folder } from '../../stores/folder.store'

export function FolderManager(): JSX.Element {
  const { folders, loading, loadFolders, createFolder, renameFolder, deleteFolder } =
    useFolderStore()
  const [newName, setNewName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const newInputRef = useRef<HTMLInputElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadFolders()
  }, [loadFolders])

  useEffect(() => {
    if (isCreating && newInputRef.current) {
      newInputRef.current.focus()
    }
  }, [isCreating])

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus()
    }
  }, [editingId])

  const handleCreate = async (): Promise<void> => {
    const trimmed = newName.trim()
    if (!trimmed) return
    await createFolder(trimmed)
    setNewName('')
    setIsCreating(false)
  }

  const handleRename = async (id: string): Promise<void> => {
    const trimmed = editName.trim()
    if (!trimmed) return
    await renameFolder(id, trimmed)
    setEditingId(null)
    setEditName('')
  }

  const handleDelete = async (id: string): Promise<void> => {
    if (confirmDeleteId === id) {
      await deleteFolder(id)
      setConfirmDeleteId(null)
    } else {
      setConfirmDeleteId(id)
    }
  }

  const startEdit = (folder: Folder): void => {
    setEditingId(folder.id)
    setEditName(folder.name)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Manage Folders</h3>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="text-xs text-[var(--tippy-purple)] hover:underline focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)] rounded"
          >
            + New Folder
          </button>
        )}
      </div>

      {isCreating && (
        <div className="flex items-center gap-1">
          <input
            ref={newInputRef}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate()
              if (e.key === 'Escape') {
                setIsCreating(false)
                setNewName('')
              }
            }}
            placeholder="Folder name"
            className="flex-1 text-sm px-2 py-1 rounded-lg border bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-default)] focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)]"
            aria-label="New folder name"
          />
          <button
            onClick={handleCreate}
            className="text-xs px-2 py-1 rounded-lg bg-[var(--tippy-purple)] text-white hover:bg-[var(--tippy-purple-dark)] focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)]"
          >
            Add
          </button>
          <button
            onClick={() => {
              setIsCreating(false)
              setNewName('')
            }}
            className="text-xs px-2 py-1 rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)]"
          >
            Cancel
          </button>
        </div>
      )}

      {loading && folders.length === 0 && (
        <p className="text-xs text-[var(--text-tertiary)]">Loading...</p>
      )}

      {!loading && folders.length === 0 && !isCreating && (
        <p className="text-xs text-[var(--text-tertiary)]">No folders yet.</p>
      )}

      {folders.map((folder) => (
        <div
          key={folder.id}
          className="flex items-center gap-2 text-sm px-2 py-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)]"
        >
          {editingId === folder.id ? (
            <input
              ref={editInputRef}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename(folder.id)
                if (e.key === 'Escape') {
                  setEditingId(null)
                  setEditName('')
                }
              }}
              onBlur={() => handleRename(folder.id)}
              className="flex-1 text-sm px-1 py-0 rounded border bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-default)] focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)]"
              aria-label="Rename folder"
            />
          ) : (
            <button
              onClick={() => startEdit(folder)}
              className="flex-1 text-left text-[var(--text-primary)] hover:text-[var(--tippy-purple)] focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)] rounded truncate"
              title="Click to rename"
            >
              {folder.name}
            </button>
          )}
          <span className="text-xs text-[var(--text-tertiary)] flex-shrink-0">
            {folder.itemCount}
          </span>
          <button
            onClick={() => handleDelete(folder.id)}
            onBlur={() => setConfirmDeleteId(null)}
            className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded transition-colors focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)] ${
              confirmDeleteId === folder.id
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'text-[var(--text-tertiary)] hover:text-red-500 hover:bg-[var(--bg-hover)]'
            }`}
            aria-label={
              confirmDeleteId === folder.id ? 'Confirm delete folder' : `Delete folder ${folder.name}`
            }
            title={confirmDeleteId === folder.id ? 'Click again to confirm' : 'Delete folder'}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M3 4H13M6 4V3C6 2.45 6.45 2 7 2H9C9.55 2 10 2.45 10 3V4M12 4V13C12 13.55 11.55 14 11 14H5C4.45 14 4 13.55 4 13V4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
