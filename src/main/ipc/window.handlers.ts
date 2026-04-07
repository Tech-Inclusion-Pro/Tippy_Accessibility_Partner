import { ipcMain, BrowserWindow } from 'electron'
import { getWindowManager } from '../index'

export function registerWindowHandlers(): void {
  // Move widget window by delta (for custom drag)
  ipcMain.handle('window:moveBy', async (event, dx: number, dy: number) => {
    try {
      const win = BrowserWindow.fromWebContents(event.sender)
      if (win) {
        const [x, y] = win.getPosition()
        win.setPosition(x + dx, y + dy)
      }
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Widget: icon → input bar
  ipcMain.handle('window:expandWidget', async () => {
    try {
      getWindowManager().expandWidget()
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Widget: input bar → icon
  ipcMain.handle('window:collapseWidget', async () => {
    try {
      getWindowManager().collapseWidget()
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Widget → full panel
  ipcMain.handle('window:expand', async () => {
    try {
      getWindowManager().expandFromWidget()
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Full panel → widget
  ipcMain.handle('window:collapse', async () => {
    try {
      getWindowManager().collapseToWidget()
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('window:showPanel', async (_event, view: string) => {
    try {
      getWindowManager().showPanel(view as any)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
