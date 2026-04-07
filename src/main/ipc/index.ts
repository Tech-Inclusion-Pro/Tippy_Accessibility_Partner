import { registerAnalysisHandlers } from './analysis.handlers'
import { registerChatHandlers } from './chat.handlers'
import { registerHistoryHandlers } from './history.handlers'
import { registerSettingsHandlers } from './settings.handlers'
import { registerWindowHandlers } from './window.handlers'
import { registerScreenerHandlers } from './screener.handlers'

export function registerAllHandlers(): void {
  registerAnalysisHandlers()
  registerChatHandlers()
  registerHistoryHandlers()
  registerSettingsHandlers()
  registerWindowHandlers()
  registerScreenerHandlers()
}
