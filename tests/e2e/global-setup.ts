import { execSync } from 'child_process'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const MARKER_PATH = resolve(__dirname, '../../node_modules/.e2e-rebuild-marker')

function getRebuildMarker(root: string): string {
  const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf-8'))
  const electronVersion = pkg.devDependencies?.electron ?? ''
  const sqliteVersion =
    pkg.dependencies?.['better-sqlite3'] ?? pkg.devDependencies?.['better-sqlite3'] ?? ''
  return JSON.stringify({
    electron: electronVersion,
    'better-sqlite3': sqliteVersion,
    platform: process.platform,
    arch: process.arch,
    target: 'electron'
  })
}

export default function globalSetup() {
  const root = resolve(__dirname, '../..')
  const outMain = resolve(root, 'out/main/index.js')
  const forceBuild = process.env.FORCE_BUILD === '1'
  const forceRebuild = process.env.FORCE_REBUILD === '1'

  if (!existsSync(outMain) || forceBuild) {
    console.log('[global-setup] Building app with electron-vite...')
    execSync('npx electron-vite build', { cwd: root, stdio: 'inherit' })
    console.log('[global-setup] Build complete.')
  } else {
    console.log('[global-setup] Build output found, skipping build.')
  }

  // Rebuild better-sqlite3 for Electron's Node version (with caching)
  const expectedMarker = getRebuildMarker(root)
  let needsRebuild = forceRebuild

  if (!needsRebuild) {
    if (existsSync(MARKER_PATH)) {
      const existingMarker = readFileSync(MARKER_PATH, 'utf-8')
      needsRebuild = existingMarker !== expectedMarker
      if (!needsRebuild) {
        console.log('[global-setup] electron-rebuild cached, skipping.')
      }
    } else {
      needsRebuild = true
    }
  }

  if (needsRebuild) {
    console.log('[global-setup] Rebuilding better-sqlite3 for Electron...')
    execSync('npx electron-rebuild -f -w better-sqlite3', { cwd: root, stdio: 'inherit' })
    writeFileSync(MARKER_PATH, expectedMarker, 'utf-8')
    console.log('[global-setup] Rebuild complete, marker written.')
  }
}
