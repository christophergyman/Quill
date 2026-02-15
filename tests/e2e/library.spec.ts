import { test, expect } from './fixtures'
import type { ElectronApplication } from '@playwright/test'

async function seedSession(electronApp: ElectronApplication) {
  return electronApp.evaluate(async () => {
    const db = (globalThis as any).__quillTestDb
    const sessionId = 'test-session-001'
    const now = new Date().toISOString()

    db.prepare(
      `
      INSERT OR REPLACE INTO sessions (id, created_at, updated_at, title, raw_text, cleaned_text, summary, duration_ms, voice_backend, llm_enabled, language, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    ).run(
      sessionId,
      now,
      now,
      'Test Recording',
      'This is the raw transcription text from the test recording session.',
      'This is the cleaned transcription text.',
      'A test recording summary.',
      45000,
      'whisper-cloud',
      1,
      'en',
      null
    )

    return sessionId
  })
}

async function seedSessionWithDiagram(electronApp: ElectronApplication) {
  return electronApp.evaluate(async () => {
    const db = (globalThis as any).__quillTestDb
    const sessionId = 'test-session-diagram'
    const diagramId = 'test-diagram-001'
    const now = new Date().toISOString()

    db.prepare(
      `
      INSERT OR REPLACE INTO sessions (id, created_at, updated_at, title, raw_text, cleaned_text, summary, duration_ms, voice_backend, llm_enabled, language, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    ).run(
      sessionId,
      now,
      now,
      'Diagram Session',
      'Session with a diagram attached.',
      null,
      null,
      30000,
      'whisper-cloud',
      0,
      'en',
      null
    )

    db.prepare(
      `
      INSERT OR REPLACE INTO diagrams (id, session_id, tldraw_snapshot, png_data, created_at)
      VALUES (?, ?, ?, ?, ?)
    `
    ).run(diagramId, sessionId, '{}', null, now)

    return sessionId
  })
}

test.describe('Library Window', () => {
  test('shows empty state', async ({ libraryPage }) => {
    const heading = libraryPage.locator('h1', { hasText: 'Library' })
    await expect(heading).toBeVisible()

    const searchInput = libraryPage.locator('input[placeholder="Search sessions..."]')
    await expect(searchInput).toBeVisible()

    await expect(libraryPage.locator('text=No sessions yet')).toBeVisible()
  })

  test('shows select-a-session placeholder', async ({ libraryPage }) => {
    await expect(libraryPage.locator('text=Select a session to view details')).toBeVisible()
  })

  test('shows session list after seeding', async ({ electronApp, libraryPage }) => {
    await seedSession(electronApp)
    await libraryPage.reload()
    await libraryPage.waitForSelector('#root', { timeout: 10_000 })

    await expect(libraryPage.locator('span', { hasText: 'Test Recording' }).first()).toBeVisible()
  })

  test('click session shows detail', async ({ electronApp, libraryPage }) => {
    await seedSession(electronApp)
    await libraryPage.reload()
    await libraryPage.waitForSelector('#root', { timeout: 10_000 })

    await libraryPage.locator('button', { hasText: 'Test Recording' }).click()

    const title = libraryPage.locator('h2', { hasText: 'Test Recording' })
    await expect(title).toBeVisible()

    await expect(libraryPage.locator('h3', { hasText: 'Summary' })).toBeVisible()
    await expect(libraryPage.locator('h3', { hasText: 'Cleaned' })).toBeVisible()
    await expect(libraryPage.locator('h3', { hasText: 'Raw Transcription' })).toBeVisible()

    // Duration appears in the detail pane metadata
    await expect(libraryPage.locator('.flex-1 >> text=45s').first()).toBeVisible()
  })

  test('session detail has Copy and Delete buttons', async ({ electronApp, libraryPage }) => {
    await seedSession(electronApp)
    await libraryPage.reload()
    await libraryPage.waitForSelector('#root', { timeout: 10_000 })

    await libraryPage.locator('button', { hasText: 'Test Recording' }).click()

    await expect(libraryPage.locator('button', { hasText: 'Copy' })).toBeVisible()
    await expect(libraryPage.locator('button', { hasText: 'Delete' })).toBeVisible()
  })

  test('delete removes session', async ({ electronApp, libraryPage }) => {
    await seedSession(electronApp)
    await libraryPage.reload()
    await libraryPage.waitForSelector('#root', { timeout: 10_000 })

    await libraryPage.locator('button', { hasText: 'Test Recording' }).click()
    await libraryPage.locator('button', { hasText: 'Delete' }).click()

    await expect(libraryPage.locator('button', { hasText: 'Test Recording' })).toHaveCount(0)
    await expect(libraryPage.locator('text=No sessions yet')).toBeVisible()
  })

  test('diagram badge appears when session has diagrams', async ({ electronApp, libraryPage }) => {
    await seedSessionWithDiagram(electronApp)
    await libraryPage.reload()
    await libraryPage.waitForSelector('#root', { timeout: 10_000 })

    const badge = libraryPage.locator('span.text-blue-600', { hasText: 'diagram' })
    await expect(badge).toBeVisible()
  })
})
