/**
 * @deprecated Scheduled for removal in v2.0.0
 * --------------------------------------------------------------------------
 * ⚠️ NOTICE: V2 DATA&UI REFACTORING (by 0xfullex)
 * --------------------------------------------------------------------------
 * STOP: Feature PRs affecting this file are currently BLOCKED.
 * Only critical bug fixes are accepted during this migration phase.
 *
 * This file is being refactored to v2 standards.
 * Any non-critical changes will conflict with the ongoing work.
 *
 * 🔗 Context & Status:
 * - Contribution Hold: https://github.com/CherryHQ/cherry-studio/issues/10954
 * - v2 Refactor PR   : https://github.com/CherryHQ/cherry-studio/pull/10162
 * --------------------------------------------------------------------------
 */
import { loggerService } from '@logger'
import { IpcChannel } from '@shared/IpcChannel'
import { ipcMain } from 'electron'

import { windowService } from './WindowService'

type StoreValue = any

const logger = loggerService.withContext('ReduxService')
const STORE_READY_TIMEOUT = 30000
const STORE_READY_POLL_INTERVAL = 500

export class ReduxService {
  private isReady = false
  private resolveReady!: () => void
  private readyPromise = new Promise<void>((r) => (this.resolveReady = r))

  constructor() {
    ipcMain.handle(IpcChannel.ReduxStoreReady, () => {
      this.markReady()
    })
  }

  private markReady(): void {
    if (this.isReady) return

    this.isReady = true
    this.resolveReady()
  }

  private async probeRendererStoreReady(): Promise<boolean> {
    const mainWindow = windowService.getMainWindow()
    if (!mainWindow || mainWindow.isDestroyed()) {
      return false
    }

    try {
      return await mainWindow.webContents.executeJavaScript(`window.__reduxPersistBootstrapped === true`)
    } catch {
      return false
    }
  }

  private async waitForRendererStoreProbe(timeoutMs: number): Promise<void> {
    const startedAt = Date.now()

    while (Date.now() - startedAt < timeoutMs) {
      if (this.isReady) {
        return
      }

      if (await this.probeRendererStoreReady()) {
        this.markReady()
        return
      }

      await new Promise((resolve) => setTimeout(resolve, STORE_READY_POLL_INTERVAL))
    }

    throw new Error('Timeout waiting for Redux store to be ready')
  }

  private async waitForStoreReady(): Promise<void> {
    if (this.isReady) return

    await Promise.race([this.readyPromise, this.waitForRendererStoreProbe(STORE_READY_TIMEOUT)])
  }

  private async getWebContents(): Promise<Electron.WebContents> {
    await this.waitForStoreReady()

    const mainWindow = windowService.getMainWindow()

    if (!mainWindow) {
      throw new Error('Main window is not available')
    }

    return mainWindow.webContents
  }

  // Select state from renderer process
  async select<T = StoreValue>(selector: string): Promise<T> {
    try {
      const webContents = await this.getWebContents()
      return await webContents.executeJavaScript(`
        (() => {
          const state = window.store.getState();
          return ${selector};
        })()
      `)
    } catch (error) {
      logger.error('Failed to select store value:', error as Error)
      throw error
    }
  }

  // Dispatch action
  async dispatch(action: any): Promise<void> {
    try {
      const webContents = await this.getWebContents()
      await webContents.executeJavaScript(`window.store.dispatch(${JSON.stringify(action)})`)
    } catch (error) {
      logger.error('Failed to dispatch action:', error as Error)
      throw error
    }
  }

  // Get entire state tree
  async getState(): Promise<any> {
    try {
      const webContents = await this.getWebContents()
      return await webContents.executeJavaScript(`window.store.getState()`)
    } catch (error) {
      logger.error('Failed to get state:', error as Error)
      throw error
    }
  }

  // Batch dispatch actions
  async batch(actions: any[]): Promise<void> {
    for (const action of actions) {
      await this.dispatch(action)
    }
  }
}

export const reduxService = new ReduxService()

/**
 * @example
 * async function example() {
 *   try {
 *     // Select state
 *     const settings = await reduxService.select('state.settings')
 *     logger.log('settings', settings)
 *
 *     // Dispatch action
 *     await reduxService.dispatch({
 *       type: 'settings/updateApiKey',
 *       payload: 'new-api-key'
 *     })
 *
 *     // Batch dispatch actions
 *     await reduxService.batch([
 *       { type: 'action1', payload: 'data1' },
 *       { type: 'action2', payload: 'data2' }
 *     ])
 *   } catch (error) {
 *     logger.error('Error:', error)
 *   }
 * }
 */
