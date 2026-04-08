import { useState, useEffect } from 'react'
import { Button } from '../common/Button'

export function HistoryLocationSettings(): JSX.Element {
  const [dbPath, setDbPath] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    window.api.history.getDbPath().then((result) => {
      if (result.success && result.data) {
        setDbPath(result.data)
      }
    })
  }, [])

  const handleChangeLocation = async (): Promise<void> => {
    setLoading(true)
    const result = await window.api.history.setDbPath()
    if (result.success && result.data && !result.data.canceled) {
      setDbPath(result.data.path)
    }
    setLoading(false)
  }

  const handleResetLocation = async (): Promise<void> => {
    setLoading(true)
    const result = await window.api.history.resetDbPath()
    if (result.success && result.data) {
      setDbPath(result.data)
    }
    setLoading(false)
  }

  const truncatePath = (path: string, max: number): string => {
    if (path.length <= max) return path
    const start = path.slice(0, 20)
    const end = path.slice(-(max - 23))
    return `${start}...${end}`
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
        History Database Location
      </h3>
      <div className="flex flex-col gap-3">
        <div className="text-sm text-[var(--text-secondary)] bg-[var(--bg-muted)] rounded-lg p-3">
          <span title={dbPath} className="break-all">
            {truncatePath(dbPath, 60)}
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleChangeLocation} disabled={loading}>
            Change Location
          </Button>
          <Button variant="ghost" size="sm" onClick={handleResetLocation} disabled={loading}>
            Reset to Default
          </Button>
        </div>
        <p className="text-xs text-[var(--text-tertiary)]">
          Restart the app after changing the database location for full effect.
        </p>
      </div>
    </div>
  )
}
