import { test, expect } from './fixtures'

test.describe('Overlay Window', () => {
  test('renders root container', async ({ overlayPage }) => {
    const container = overlayPage.locator('div.relative.h-screen.w-screen')
    await expect(container).toBeAttached()
  })

  test('status indicator hidden when idle', async ({ overlayPage }) => {
    // StatusIndicator returns null when state is 'idle'
    await expect(overlayPage.locator('text=recording')).not.toBeVisible()
    await expect(overlayPage.locator('text=processing')).not.toBeVisible()
  })

  test('starts in passthrough mode', async ({ overlayPage }) => {
    await expect(overlayPage.locator('text=Drawing mode')).not.toBeVisible()
  })

  test('drawing canvas not mounted initially', async ({ overlayPage }) => {
    const tldraw = overlayPage.locator('.tl-container')
    await expect(tldraw).not.toBeAttached()
  })

  test('toolbar appears in drawing mode', async ({ electronApp, overlayPage }) => {
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

  test('switching back to passthrough hides toolbar', async ({ electronApp, overlayPage }) => {
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

  test('status indicator shows recording state', async ({ electronApp, overlayPage }) => {
    await electronApp.evaluate(async ({ BrowserWindow }) => {
      const wins = BrowserWindow.getAllWindows()
      wins[0].webContents.send('recording:state-changed', 'recording')
    })

    const indicator = overlayPage.locator('text=recording')
    await expect(indicator).toBeVisible()
  })

  test('status indicator shows processing state', async ({ electronApp, overlayPage }) => {
    await electronApp.evaluate(async ({ BrowserWindow }) => {
      const wins = BrowserWindow.getAllWindows()
      wins[0].webContents.send('recording:state-changed', 'processing')
    })

    const indicator = overlayPage.locator('text=processing')
    await expect(indicator).toBeVisible()
  })

  test('transcription panel appears', async ({ electronApp, overlayPage }) => {
    await electronApp.evaluate(async ({ BrowserWindow }) => {
      const wins = BrowserWindow.getAllWindows()
      wins[0].webContents.send('transcription:partial', 'Hello world test transcription')
    })

    await expect(overlayPage.locator('text=Hello world test transcription')).toBeVisible()
  })
})
