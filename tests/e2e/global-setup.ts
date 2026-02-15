import { execSync } from 'child_process'
import { existsSync, readFileSync, mkdirSync, copyFileSync } from 'fs'
import { resolve } from 'path'

const NATIVE_BINARY = 'node_modules/better-sqlite3/build/Release/better_sqlite3.node'
const CACHE_DIR = 'node_modules/.cache/e2e-rebuild'

function getVersionKey(root: string): string {
  const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf-8'))
  const electronVersion = pkg.devDependencies?.electron ?? ''
  const sqliteVersion =
    pkg.dependencies?.['better-sqlite3'] ?? pkg.devDependencies?.['better-sqlite3'] ?? ''
  return `${electronVersion}_${sqliteVersion}_${process.platform}_${process.arch}`
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

  // Rebuild better-sqlite3 for Electron (with binary caching)
  const binaryPath = resolve(root, NATIVE_BINARY)
  const cacheDir = resolve(root, CACHE_DIR)
  const versionKey = getVersionKey(root)
  const cachedElectronBinary = resolve(cacheDir, `electron_${versionKey}.node`)

  if (!forceRebuild && existsSync(cachedElectronBinary)) {
    console.log('[global-setup] Restoring cached Electron binary, skipping rebuild.')
    copyFileSync(cachedElectronBinary, binaryPath)
    return
  }

  console.log('[global-setup] Rebuilding better-sqlite3 for Electron...')
  execSync('npx electron-rebuild -f -w better-sqlite3', { cwd: root, stdio: 'inherit' })

  // Cache the built binary
  mkdirSync(cacheDir, { recursive: true })
  copyFileSync(binaryPath, cachedElectronBinary)
  console.log('[global-setup] Rebuild complete, binary cached.')
}
