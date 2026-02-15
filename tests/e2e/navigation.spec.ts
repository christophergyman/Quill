import {
  test,
  expect,
  type AppContext,
  launchApp,
  closeApp,
  openAppPage,
  navigateToSettings
} from './fixtures'
import type { ElectronApplication, Page } from '@playwright/test'

test.describe.serial('App Navigation', () => {
  let ctx: AppContext
  let electronApp: ElectronApplication
  let appPage: Page

  test.beforeAll(async () => {
    ctx = await launchApp()
    electronApp = ctx.app
    appPage = await openAppPage(electronApp)
  })

  test.afterAll(async () => {
    await closeApp(ctx)
  })

  test('gear icon navigates to settings', async () => {
    await navigateToSettings(appPage)

    const heading = appPage.locator('h2', { hasText: 'General' })
    await expect(heading).toBeVisible()
  })

  test('back arrow navigates to library', async () => {
    // Navigate to settings first
    await appPage.reload()
    await appPage.waitForSelector('#root', { timeout: 5_000 })
    await navigateToSettings(appPage)

    // Click back button
    await appPage.locator('nav button', { hasText: 'Library' }).click()

    const heading = appPage.locator('h1', { hasText: 'Library' })
    await expect(heading).toBeVisible()
  })

  test('round-trip navigation resets settings tab', async () => {
    // Start at library, go to settings
    await appPage.reload()
    await appPage.waitForSelector('#root', { timeout: 5_000 })
    await navigateToSettings(appPage)

    // Switch to Voice tab
    await appPage.locator('nav button', { hasText: 'Voice' }).click()
    await expect(appPage.locator('h2', { hasText: 'Voice' })).toBeVisible()

    // Go back to library
    await appPage.locator('nav button', { hasText: 'Library' }).click()
    await expect(appPage.locator('h1', { hasText: 'Library' })).toBeVisible()

    // Return to settings — should be back on General tab (AppShell recreates SettingsRoot)
    await navigateToSettings(appPage)
    await expect(appPage.locator('h2', { hasText: 'General' })).toBeVisible()
  })
})
