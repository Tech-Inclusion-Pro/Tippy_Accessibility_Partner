import { BrowserWindow, screen, shell } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

export type PanelView = 'chat' | 'settings' | 'history'

// Widget starts as icon-only (80x100), expands to bar (320x72) on click
const ICON_WIDTH = 80
const ICON_HEIGHT = 100
const BAR_WIDTH = 320
const BAR_HEIGHT = 72

export class WindowManager {
  private widget: BrowserWindow | null = null
  private panel: BrowserWindow | null = null
  private widgetExpanded = false

  createWidget(): void {
    if (this.widget && !this.widget.isDestroyed()) {
      this.widget.show()
      return
    }

    const { width: screenWidth } = screen.getPrimaryDisplay().workAreaSize

    // Start as a small icon
    this.widgetExpanded = false
    this.widget = new BrowserWindow({
      width: ICON_WIDTH,
      height: ICON_HEIGHT,
      x: screenWidth - ICON_WIDTH - 20,
      y: 20,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      resizable: false,
      skipTaskbar: true,
      hasShadow: false,
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
      this.widgetExpanded = false
    })
  }

  /** Animate widget from icon → input bar */
  expandWidget(): void {
    if (!this.widget || this.widget.isDestroyed() || this.widgetExpanded) return

    const [currentX, currentY] = this.widget.getPosition()
    this.widgetExpanded = true

    // Expand leftward from the icon's right edge so it stays visually anchored
    const rightEdge = currentX + ICON_WIDTH
    this.widget.setBounds({
      width: BAR_WIDTH,
      height: BAR_HEIGHT,
      x: rightEdge - BAR_WIDTH,
      y: currentY
    })
    this.widget.webContents.send('widget:state', 'expanded')
  }

  /** Collapse widget from input bar → icon */
  collapseWidget(): void {
    if (!this.widget || this.widget.isDestroyed() || !this.widgetExpanded) return

    const [currentX, currentY] = this.widget.getPosition()
    this.widgetExpanded = false

    // Collapse back to icon, keeping the right edge in place
    const rightEdge = currentX + BAR_WIDTH
    this.widget.setBounds({
      width: ICON_WIDTH,
      height: ICON_HEIGHT,
      x: rightEdge - ICON_WIDTH,
      y: currentY
    })
    this.widget.webContents.send('widget:state', 'collapsed')
  }

  isWidgetExpanded(): boolean {
    return this.widgetExpanded
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
