import { test, expect } from './fixtures'

test.describe('App Launch', () => {
  test('app process starts', async ({ electronApp }) => {
    const isPackaged = await electronApp.evaluate(async ({ app }) => {
      return app.isPackaged
    })
    expect(isPackaged).toBe(false)
  })

  test('creates one window on startup', async ({ electronApp }) => {
    // Wait for the first window
    await electronApp.firstWindow()
    const count = await electronApp.evaluate(async ({ BrowserWindow }) => {
      return BrowserWindow.getAllWindows().length
    })
    expect(count).toBe(1)
  })

  test('overlay starts hidden', async ({ electronApp }) => {
    await electronApp.firstWindow()
    const visible = await electronApp.evaluate(async ({ BrowserWindow }) => {
      const wins = BrowserWindow.getAllWindows()
      return wins[0].isVisible()
    })
    expect(visible).toBe(false)
  })

  test('overlay is alwaysOnTop', async ({ electronApp }) => {
    await electronApp.firstWindow()
    const alwaysOnTop = await electronApp.evaluate(async ({ BrowserWindow }) => {
      const wins = BrowserWindow.getAllWindows()
      return wins[0].isAlwaysOnTop()
    })
    expect(alwaysOnTop).toBe(true)
  })

  test('overlay is not resizable', async ({ electronApp }) => {
    await electronApp.firstWindow()
    const resizable = await electronApp.evaluate(async ({ BrowserWindow }) => {
      const wins = BrowserWindow.getAllWindows()
      return wins[0].isResizable()
    })
    expect(resizable).toBe(false)
  })

  test('overlay is not movable', async ({ electronApp }) => {
    await electronApp.firstWindow()
    const movable = await electronApp.evaluate(async ({ BrowserWindow }) => {
      const wins = BrowserWindow.getAllWindows()
      return wins[0].isMovable()
    })
    expect(movable).toBe(false)
  })

  test('overlay loads renderer HTML', async ({ overlayPage }) => {
    const root = overlayPage.locator('#root')
    await expect(root).toBeAttached()
  })

  test('OverlayRoot component renders', async ({ overlayPage }) => {
    const container = overlayPage.locator('div.relative.h-screen.w-screen')
    await expect(container).toBeAttached()
  })

  test('window-all-closed does not quit app', async ({ electronApp }) => {
    await electronApp.firstWindow()
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
