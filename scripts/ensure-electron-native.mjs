/**
 * Ensures better-sqlite3 is compiled for Electron before dev/build/package.
 *
 * Fast path: restores cached Electron binary (~1ms)
 * Slow path: runs electron-rebuild and caches the result (~10s)
 * Silent when binary is already correct.
 *
 * Uses the same cache dir and version key as E2E setup/teardown.
 */

import { existsSync, readFileSync, mkdirSync, copyFileSync, statSync } from 'fs'
import { resolve, dirname } from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const ROOT = resolve(__dirname, '..')
const NATIVE_BINARY = 'node_modules/better-sqlite3/build/Release/better_sqlite3.node'
const CACHE_DIR = 'node_modules/.cache/e2e-rebuild'

function getVersionKey() {
  const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf-8'))
  const electronVersion = pkg.devDependencies?.electron ?? ''
  const sqliteVersion =
    pkg.dependencies?.['better-sqlite3'] ?? pkg.devDependencies?.['better-sqlite3'] ?? ''
  return `${electronVersion}_${sqliteVersion}_${process.platform}_${process.arch}`
}

function filesMatch(a, b) {
  if (!existsSync(a) || !existsSync(b)) return false
  const statA = statSync(a)
  const statB = statSync(b)
  if (statA.size !== statB.size) return false
  const bufA = readFileSync(a)
  const bufB = readFileSync(b)
  return bufA.equals(bufB)
}

const binaryPath = resolve(ROOT, NATIVE_BINARY)
const cacheDir = resolve(ROOT, CACHE_DIR)
const versionKey = getVersionKey()
const cachedElectronBinary = resolve(cacheDir, `electron_${versionKey}.node`)

// Already the correct Electron binary — nothing to do
if (existsSync(cachedElectronBinary) && filesMatch(binaryPath, cachedElectronBinary)) {
  process.exit(0)
}

// Cached Electron binary exists but isn't in place — restore it
if (existsSync(cachedElectronBinary)) {
  console.log('[ensure-electron-native] Restoring cached Electron binary...')
  copyFileSync(cachedElectronBinary, binaryPath)
  process.exit(0)
}

// No cache — full rebuild
console.log('[ensure-electron-native] Rebuilding better-sqlite3 for Electron...')
execSync('npx electron-rebuild -f -w better-sqlite3', { cwd: ROOT, stdio: 'inherit' })

mkdirSync(cacheDir, { recursive: true })
copyFileSync(binaryPath, cachedElectronBinary)
console.log('[ensure-electron-native] Rebuild complete, binary cached.')
