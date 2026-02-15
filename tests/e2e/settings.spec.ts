import { test, expect } from './fixtures'

test.describe('Settings Window', () => {
  test('shows General tab by default', async ({ settingsPage }) => {
    const heading = settingsPage.locator('h2', { hasText: 'General' })
    await expect(heading).toBeVisible()

    const navButtons = settingsPage.locator('nav button')
    await expect(navButtons).toHaveCount(5)
  })

  test('General tab has toggles and language select', async ({ settingsPage }) => {
    const switches = settingsPage.locator('button[role="switch"]')
    await expect(switches).toHaveCount(2)

    const languageSelect = settingsPage.locator('select').last()
    await expect(languageSelect).toHaveValue('en')
  })

  test('can toggle launch-at-login', async ({ settingsPage }) => {
    const switches = settingsPage.locator('button[role="switch"]')
    const launchToggle = switches.first()

    await expect(launchToggle).toHaveAttribute('aria-checked', 'false')
    await launchToggle.click()
    await expect(launchToggle).toHaveAttribute('aria-checked', 'true')
    await launchToggle.click()
    await expect(launchToggle).toHaveAttribute('aria-checked', 'false')
  })

  test('can change language select', async ({ settingsPage }) => {
    const languageSelect = settingsPage.locator('select').last()
    await languageSelect.selectOption('es')
    await expect(languageSelect).toHaveValue('es')
  })

  test('navigate to Voice tab', async ({ settingsPage }) => {
    await settingsPage.locator('nav button', { hasText: 'Voice' }).click()

    const heading = settingsPage.locator('h2', { hasText: 'Voice' })
    await expect(heading).toBeVisible()

    const backendLabel = settingsPage.locator('label', { hasText: 'Backend' })
    await expect(backendLabel).toBeVisible()
  })

  test('Voice tab shows API key for whisper-cloud', async ({ settingsPage }) => {
    await settingsPage.locator('nav button', { hasText: 'Voice' }).click()

    const apiKeyInput = settingsPage.locator('input[type="password"]')
    await expect(apiKeyInput).toBeVisible()
    await expect(apiKeyInput).toHaveAttribute('placeholder', 'sk-...')
  })

  test('Voice tab conditional UI for whisper-local', async ({ settingsPage }) => {
    await settingsPage.locator('nav button', { hasText: 'Voice' }).click()

    // Select whisper-local backend
    const backendSelect = settingsPage.locator('select').first()
    await backendSelect.selectOption('whisper-local')

    // API key should be hidden
    const apiKeyInput = settingsPage.locator('input[type="password"]')
    await expect(apiKeyInput).toHaveCount(0)

    // Model select should appear (there are now 2 selects: backend + model, plus language)
    const selects = settingsPage.locator('select')
    await expect(selects).toHaveCount(3)
  })

  test('navigate to LLM tab', async ({ settingsPage }) => {
    await settingsPage.locator('nav button', { hasText: 'LLM' }).click()

    const heading = settingsPage.locator('h2', { hasText: 'LLM Post-Processing' })
    await expect(heading).toBeVisible()

    const toggle = settingsPage.locator('button[role="switch"]')
    await expect(toggle).toHaveAttribute('aria-checked', 'false')
  })

  test('LLM tab shows options when enabled', async ({ settingsPage }) => {
    await settingsPage.locator('nav button', { hasText: 'LLM' }).click()

    const toggle = settingsPage.locator('button[role="switch"]')
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-checked', 'true')

    const backendSelect = settingsPage.locator('select').first()
    await expect(backendSelect).toBeVisible()

    const apiKeyInput = settingsPage.locator('input[type="password"]')
    await expect(apiKeyInput).toBeVisible()
  })

  test('navigate to Shortcuts tab', async ({ settingsPage }) => {
    await settingsPage.locator('nav button', { hasText: 'Shortcuts' }).click()

    const heading = settingsPage.locator('h2', { hasText: 'Shortcuts' })
    await expect(heading).toBeVisible()

    const inputs = settingsPage.locator('input:not([type="password"]):not([type="hidden"])')
    await expect(inputs).toHaveCount(3)
  })

  test('navigate to About tab', async ({ settingsPage }) => {
    await settingsPage.locator('nav button', { hasText: 'About' }).click()

    const heading = settingsPage.locator('h2', { hasText: 'About' })
    await expect(heading).toBeVisible()

    await expect(settingsPage.locator('text=v0.1.0')).toBeVisible()
    await expect(
      settingsPage.locator('text=Voice dictation + whiteboard overlay for macOS')
    ).toBeVisible()
  })

  test('settings persist across tab switches', async ({ settingsPage }) => {
    // Change language to French
    const languageSelect = settingsPage.locator('select').last()
    await languageSelect.selectOption('fr')
    await expect(languageSelect).toHaveValue('fr')

    // Switch to Voice tab and back
    await settingsPage.locator('nav button', { hasText: 'Voice' }).click()
    await settingsPage.locator('nav button', { hasText: 'General' }).click()

    // Language should still be French
    const languageSelectAfter = settingsPage.locator('select').last()
    await expect(languageSelectAfter).toHaveValue('fr')
  })
})
