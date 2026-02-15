import { test as base, _electron, type ElectronApplication, type Page } from '@playwright/test'
import { resolve } from 'path'
import { mkdtempSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

const PRELOAD_PATH = resolve(__dirname, '../../out/preload/index.js')
const RENDERER_PATH = resolve(__dirname, '../../out/renderer/index.html')

async function waitForWindow(
  app: ElectronApplication,
  urlPattern: RegExp,
  timeout = 10_000
): Promise<Page> {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    const windows = app.windows()
    for (const win of windows) {
      if (urlPattern.test(win.url())) return win
    }
    await new Promise((r) => setTimeout(r, 200))
  }
  throw new Error(`Timed out waiting for window matching ${urlPattern}`)
}

type Fixtures = {
  electronApp: ElectronApplication
  overlayPage: Page
  settingsPage: Page
  libraryPage: Page
}

export const test = base.extend<Fixtures>({
  electronApp: async ({}, use) => {
    const userData = mkdtempSync(join(tmpdir(), 'quill-test-'))

    const app = await _electron.launch({
      args: [resolve(__dirname, '../../out/main/index.js')],
      env: {
        ...process.env,
        NODE_ENV: 'test',
        QUILL_TEST_USER_DATA: userData
      }
    })

    await use(app)

    await app.close()
    rmSync(userData, { recursive: true, force: true })
  },

  overlayPage: async ({ electronApp }, use) => {
    const page = await electronApp.firstWindow()
    await page.waitForSelector('#root', { timeout: 10_000 })
    await use(page)
  },

  settingsPage: async ({ electronApp }, use) => {
    const preload = PRELOAD_PATH
    const renderer = RENDERER_PATH
    await electronApp.evaluate(
      async ({ BrowserWindow }, { preload, renderer }) => {
        const win = new BrowserWindow({
          width: 600,
          height: 500,
          title: 'Quill Settings',
          show: true,
          resizable: false,
          webPreferences: {
            preload,
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false
          }
        })
        win.loadFile(renderer, { hash: '/settings' })
      },
      { preload, renderer }
    )

    const page = await waitForWindow(electronApp, /settings/)
    await page.waitForSelector('#root', { timeout: 10_000 })
    await use(page)
  },

  libraryPage: async ({ electronApp }, use) => {
    const preload = PRELOAD_PATH
    const renderer = RENDERER_PATH
    await electronApp.evaluate(
      async ({ BrowserWindow }, { preload, renderer }) => {
        const win = new BrowserWindow({
          width: 900,
          height: 650,
          title: 'Quill Library',
          show: true,
          webPreferences: {
            preload,
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false
          }
        })
        win.loadFile(renderer, { hash: '/library' })
      },
      { preload, renderer }
    )

    const page = await waitForWindow(electronApp, /library/)
    await page.waitForSelector('#root', { timeout: 10_000 })
    await use(page)
  }
})

export { expect } from '@playwright/test'
