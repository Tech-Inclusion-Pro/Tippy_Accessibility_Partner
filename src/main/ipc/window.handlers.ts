import { ipcMain } from 'electron'
import { getWindowManager } from '../index'

export function registerWindowHandlers(): void {
  ipcMain.handle('window:expand', async () => {
    try {
      getWindowManager().expandFromWidget()
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

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
