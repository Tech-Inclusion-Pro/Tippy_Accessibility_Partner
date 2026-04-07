import { app, BrowserWindow, globalShortcut, Tray, Menu, nativeImage } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { WindowManager } from './window-manager'
import { registerAllHandlers } from './ipc'
import { initializeDatabase, closeDatabase } from './db/connection'
import { loadWCAGData } from './services/wcag-data.service'
import { screenerService } from './services/screener.service'
import { settingsService } from './services/settings.service'

let tray: Tray | null = null
let windowManager: WindowManager | null = null

export function getWindowManager(): WindowManager {
  if (!windowManager) throw new Error('WindowManager not initialized')
  return windowManager
}

function createTray(): void {
  const trayIcon = nativeImage.createFromPath(icon).resize({ width: 18, height: 18 })
  tray = new Tray(trayIcon)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show/Hide TIPPY',
      click: () => windowManager?.toggleWidget()
    },
    {
      label: 'Open Panel',
      click: () => windowManager?.showPanel()
    },
    { type: 'separator' },
    {
      label: 'Settings',
      click: () => windowManager?.showPanel('settings')
    },
    {
      label: 'History',
      click: () => windowManager?.showPanel('history')
    },
    { type: 'separator' },
    {
      label: 'Quit TIPPY',
      click: () => app.quit()
    }
  ])

  tray.setToolTip('TIPPY - Accessibility Partner')
  tray.setContextMenu(contextMenu)

  tray.on('click', () => {
    windowManager?.toggleWidget()
  })
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.techinclusion.tippy')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Initialize database, WCAG data, screeners, and IPC handlers
  initializeDatabase()
  loadWCAGData()
  screenerService.load()
  registerAllHandlers()

  // Create window manager and show widget
  windowManager = new WindowManager()
  windowManager.createWidget()

  // Auto-open panel on first launch so onboarding wizard is visible
  const onboardingComplete = settingsService.get('onboarding_complete')
  if (onboardingComplete !== 'true') {
    windowManager.showPanel('chat')
  }

  // System tray
  createTray()

  // Global shortcut: Cmd/Ctrl+Shift+T to toggle
  globalShortcut.register('CommandOrControl+Shift+T', () => {
    windowManager?.toggleWidget()
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      windowManager?.createWidget()
    }
  })
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
  closeDatabase()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
