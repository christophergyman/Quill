import { test, expect, _electron, type ElectronApplication, type Page } from '@playwright/test'
import { resolve } from 'path'
import { mkdtempSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

const PRELOAD_PATH = resolve(__dirname, '../../out/preload/index.js')
const RENDERER_PATH = resolve(__dirname, '../../out/renderer/index.html')

export type AppContext = {
  app: ElectronApplication
  userData: string
}

export async function launchApp(): Promise<AppContext> {
  const userData = mkdtempSync(join(tmpdir(), 'quill-test-'))

  const app = await _electron.launch({
    args: [resolve(__dirname, '../../out/main/index.js')],
    env: {
      ...process.env,
      NODE_ENV: 'test',
      QUILL_TEST_USER_DATA: userData
    }
  })

  return { app, userData }
}

export async function closeApp(ctx: AppContext) {
  const CLOSE_TIMEOUT = 5_000

  const pid = ctx.app.process().pid

  try {
    await Promise.race([
      ctx.app.close(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('app.close() timed out')), CLOSE_TIMEOUT)
      )
    ])
  } catch {
    // close() timed out or failed — force-kill the process
    if (pid) {
      try {
        process.kill(pid, 'SIGKILL')
      } catch {
        // already dead
      }
    }
  }

  rmSync(ctx.userData, { recursive: true, force: true })
}

export async function getOverlayPage(app: ElectronApplication): Promise<Page> {
  const page = await app.firstWindow()
  await page.waitForSelector('#root', { timeout: 5_000 })
  return page
}

export async function openSettingsPage(app: ElectronApplication): Promise<Page> {
  const preload = PRELOAD_PATH
  const renderer = RENDERER_PATH
  await app.evaluate(
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

  const page = await waitForWindow(app, /settings/)
  await page.waitForSelector('#root', { timeout: 5_000 })
  return page
}

export async function openLibraryPage(app: ElectronApplication): Promise<Page> {
  const preload = PRELOAD_PATH
  const renderer = RENDERER_PATH
  await app.evaluate(
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

  const page = await waitForWindow(app, /library/)
  await page.waitForSelector('#root', { timeout: 5_000 })
  return page
}

async function waitForWindow(
  app: ElectronApplication,
  urlPattern: RegExp,
  timeout = 5_000
): Promise<Page> {
  // Check existing windows first
  for (const win of app.windows()) {
    if (urlPattern.test(win.url())) return win
  }

  // Wait for new window via event
  return new Promise<Page>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timed out waiting for window matching ${urlPattern}`))
    }, timeout)

    const onWindow = (page: Page) => {
      if (urlPattern.test(page.url())) {
        clearTimeout(timer)
        app.off('window', onWindow)
        resolve(page)
      }
    }

    app.on('window', onWindow)
  })
}

export { test, expect }
