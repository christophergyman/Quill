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

export default function globalTeardown() {
  const root = resolve(__dirname, '../..')
  const binaryPath = resolve(root, NATIVE_BINARY)
  const cacheDir = resolve(root, CACHE_DIR)
  const versionKey = getVersionKey(root)
  const cachedNodeBinary = resolve(cacheDir, `node_${versionKey}.node`)

  if (existsSync(cachedNodeBinary)) {
    console.log('[global-teardown] Restoring cached Node binary, skipping rebuild.')
    copyFileSync(cachedNodeBinary, binaryPath)
    return
  }

  // Rebuild better-sqlite3 for Node.js (restore unit test compatibility)
  console.log('[global-teardown] Rebuilding better-sqlite3 for Node.js...')
  execSync('npm rebuild better-sqlite3', { cwd: root, stdio: 'inherit' })

  // Cache the built binary
  mkdirSync(cacheDir, { recursive: true })
  copyFileSync(binaryPath, cachedNodeBinary)
  console.log('[global-teardown] Rebuild complete, binary cached.')
}
