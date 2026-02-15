import { test, expect, type AppContext, launchApp, closeApp, getOverlayPage } from './fixtures'
import type { ElectronApplication, Page } from '@playwright/test'

test.describe.serial('Overlay Window', () => {
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

  test.afterEach(async () => {
    // Reset overlay to passthrough mode and recording to idle
    await electronApp.evaluate(async ({ BrowserWindow }) => {
      const wins = BrowserWindow.getAllWindows()
      if (wins.length > 0) {
        wins[0].webContents.send('overlay:mode-changed', 'passthrough')
        wins[0].webContents.send('recording:state-changed', 'idle')
      }
    })
    await overlayPage.waitForTimeout(100)
  })

  test('renders root container', async () => {
    const container = overlayPage.locator('div.relative.h-screen.w-screen')
    await expect(container).toBeAttached()
  })

  test('status indicator hidden when idle', async () => {
    // StatusIndicator returns null when state is 'idle'
    await expect(overlayPage.locator('text=recording')).not.toBeVisible()
    await expect(overlayPage.locator('text=processing')).not.toBeVisible()
  })

  test('starts in passthrough mode', async () => {
    await expect(overlayPage.locator('text=Drawing mode')).not.toBeVisible()
  })

  test('drawing canvas not mounted initially', async () => {
    const tldraw = overlayPage.locator('.tl-container')
    await expect(tldraw).not.toBeAttached()
  })

  test('toolbar appears in drawing mode', async () => {
    // Send overlay:mode-changed IPC to simulate drawing mode toggle
    await electronApp.evaluate(async ({ BrowserWindow }) => {
      const wins = BrowserWindow.getAllWindows()
      wins[0].webContents.send('overlay:mode-changed', 'drawing')
    })

    await expect(overlayPage.locator('text=Drawing mode')).toBeVisible()
    await expect(overlayPage.locator('button', { hasText: 'Export SVG' })).toBeVisible()
    await expect(overlayPage.locator('button', { hasText: 'Save' })).toBeVisible()
    await expect(overlayPage.locator('button', { hasText: 'Clear' })).toBeVisible()
    await expect(overlayPage.locator('text=⌘⇧D to exit')).toBeVisible()
  })

  test('switching back to passthrough hides toolbar', async () => {
    // Enter drawing mode
    await electronApp.evaluate(async ({ BrowserWindow }) => {
      const wins = BrowserWindow.getAllWindows()
      wins[0].webContents.send('overlay:mode-changed', 'drawing')
    })
    await expect(overlayPage.locator('text=Drawing mode')).toBeVisible()

    // Switch back to passthrough
    await electronApp.evaluate(async ({ BrowserWindow }) => {
      const wins = BrowserWindow.getAllWindows()
      wins[0].webContents.send('overlay:mode-changed', 'passthrough')
    })
    await expect(overlayPage.locator('text=Drawing mode')).not.toBeVisible()
  })

  test('status indicator shows recording state', async () => {
    await electronApp.evaluate(async ({ BrowserWindow }) => {
      const wins = BrowserWindow.getAllWindows()
      wins[0].webContents.send('recording:state-changed', 'recording')
    })

    const indicator = overlayPage.locator('text=recording')
    await expect(indicator).toBeVisible()
  })

  test('status indicator shows processing state', async () => {
    await electronApp.evaluate(async ({ BrowserWindow }) => {
      const wins = BrowserWindow.getAllWindows()
      wins[0].webContents.send('recording:state-changed', 'processing')
    })

    const indicator = overlayPage.locator('text=processing')
    await expect(indicator).toBeVisible()
  })

  test('transcription panel appears', async () => {
    await electronApp.evaluate(async ({ BrowserWindow }) => {
      const wins = BrowserWindow.getAllWindows()
      wins[0].webContents.send('transcription:partial', 'Hello world test transcription')
    })

    await expect(overlayPage.locator('text=Hello world test transcription')).toBeVisible()
  })
})
