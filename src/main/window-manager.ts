import { BrowserWindow, screen, shell } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

export type PanelView = 'chat' | 'settings' | 'history'

export class WindowManager {
  private widget: BrowserWindow | null = null
  private panel: BrowserWindow | null = null

  createWidget(): void {
    if (this.widget && !this.widget.isDestroyed()) {
      this.widget.show()
      return
    }

    const { width: screenWidth } = screen.getPrimaryDisplay().workAreaSize

    this.widget = new BrowserWindow({
      width: 320,
      height: 72,
      x: screenWidth - 340,
      y: 20,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      resizable: false,
      skipTaskbar: true,
      hasShadow: true,
      accessibleTitle: 'TIPPY Accessibility Partner Widget',
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false
      }
    })

    this.widget.setVisibleOnAllWorkspaces(true)

    this.loadRenderer(this.widget, '#/widget')

    this.widget.on('closed', () => {
      this.widget = null
    })
  }

  showPanel(view: PanelView = 'chat'): void {
    if (this.panel && !this.panel.isDestroyed()) {
      this.panel.show()
      this.panel.focus()
      this.panel.webContents.send('navigate', view)
      return
    }

    const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize

    this.panel = new BrowserWindow({
      width: 420,
      height: 600,
      x: screenWidth - 440,
      y: 100,
      minWidth: 380,
      minHeight: 520,
      frame: true,
      titleBarStyle: 'hiddenInset',
      accessibleTitle: 'TIPPY Accessibility Partner',
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false
      }
    })

    this.loadRenderer(this.panel, `#/${view}`)

    this.panel.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })

    this.panel.on('closed', () => {
      this.panel = null
    })
  }

  toggleWidget(): void {
    if (!this.widget || this.widget.isDestroyed()) {
      this.createWidget()
      return
    }
    if (this.widget.isVisible()) {
      this.widget.hide()
    } else {
      this.widget.show()
    }
  }

  hideWidget(): void {
    if (this.widget && !this.widget.isDestroyed()) {
      this.widget.hide()
    }
  }

  closePanel(): void {
    if (this.panel && !this.panel.isDestroyed()) {
      this.panel.close()
    }
  }

  expandFromWidget(): void {
    this.showPanel('chat')
  }

  collapseToWidget(): void {
    this.closePanel()
    if (!this.widget || this.widget.isDestroyed()) {
      this.createWidget()
    } else {
      this.widget.show()
    }
  }

  getPanel(): BrowserWindow | null {
    return this.panel && !this.panel.isDestroyed() ? this.panel : null
  }

  getWidget(): BrowserWindow | null {
    return this.widget && !this.widget.isDestroyed() ? this.widget : null
  }

  private loadRenderer(window: BrowserWindow, hash: string): void {
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      window.loadURL(`${process.env['ELECTRON_RENDERER_URL']}${hash}`)
    } else {
      window.loadFile(join(__dirname, '../renderer/index.html'), {
        hash: hash.replace('#', '')
      })
    }
  }
}
