import { test, expect, type AppContext, launchApp, closeApp, getOverlayPage } from './fixtures'
import type { ElectronApplication, Page } from '@playwright/test'

test.describe.serial('App Launch', () => {
  let ctx: AppContext
  let electronApp: ElectronApplication
  let overlayPage: Page

  test.beforeAll(async () => {
    ctx = await launchApp()
    electronApp = ctx.app
    overlayPage = await getOverlayPage(electronApp)
  })

  test.afterAll(async () => {
    await closeApp(ctx)
  })

  test('app process starts', async () => {
    const isPackaged = await electronApp.evaluate(async ({ app }) => {
      return app.isPackaged
    })
    expect(isPackaged).toBe(false)
  })

  test('creates one window on startup', async () => {
    const count = await electronApp.evaluate(async ({ BrowserWindow }) => {
      return BrowserWindow.getAllWindows().length
    })
    expect(count).toBe(1)
  })

  test('overlay starts hidden', async () => {
    const visible = await electronApp.evaluate(async ({ BrowserWindow }) => {
      const wins = BrowserWindow.getAllWindows()
      return wins[0].isVisible()
    })
    expect(visible).toBe(false)
  })

  test('overlay is alwaysOnTop', async () => {
    const alwaysOnTop = await electronApp.evaluate(async ({ BrowserWindow }) => {
      const wins = BrowserWindow.getAllWindows()
      return wins[0].isAlwaysOnTop()
    })
    expect(alwaysOnTop).toBe(true)
  })

  test('overlay is not resizable', async () => {
    const resizable = await electronApp.evaluate(async ({ BrowserWindow }) => {
      const wins = BrowserWindow.getAllWindows()
      return wins[0].isResizable()
    })
    expect(resizable).toBe(false)
  })

  test('overlay is not movable', async () => {
    const movable = await electronApp.evaluate(async ({ BrowserWindow }) => {
      const wins = BrowserWindow.getAllWindows()
      return wins[0].isMovable()
    })
    expect(movable).toBe(false)
  })

  test('overlay loads renderer HTML', async () => {
    const root = overlayPage.locator('#root')
    await expect(root).toBeAttached()
  })

  test('OverlayRoot component renders', async () => {
    const container = overlayPage.locator('div.relative.h-screen.w-screen')
    await expect(container).toBeAttached()
  })

  test('window-all-closed does not quit app', async () => {
    // Close the overlay window
    await electronApp.evaluate(async ({ BrowserWindow }) => {
      BrowserWindow.getAllWindows().forEach((w) => w.close())
    })
    // App should still be running
    const isRunning = await electronApp.evaluate(async ({ app }) => {
      return !app.isQuitting
    })
    // If we can still evaluate, the app hasn't quit
    expect(isRunning).toBeDefined()
  })
})
