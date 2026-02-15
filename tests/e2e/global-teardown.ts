import { execSync } from 'child_process'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const MARKER_PATH = resolve(__dirname, '../../node_modules/.e2e-rebuild-marker')

function getNodeMarker(root: string): string {
  const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf-8'))
  const electronVersion = pkg.devDependencies?.electron ?? ''
  const sqliteVersion =
    pkg.dependencies?.['better-sqlite3'] ?? pkg.devDependencies?.['better-sqlite3'] ?? ''
  return JSON.stringify({
    electron: electronVersion,
    'better-sqlite3': sqliteVersion,
    platform: process.platform,
    arch: process.arch,
    target: 'node'
  })
}

export default function globalTeardown() {
  const root = resolve(__dirname, '../..')
  const expectedMarker = getNodeMarker(root)

  // Check if already rebuilt for Node
  if (existsSync(MARKER_PATH)) {
    const existingMarker = readFileSync(MARKER_PATH, 'utf-8')
    if (existingMarker === expectedMarker) {
      console.log('[global-teardown] better-sqlite3 already built for Node, skipping.')
      return
    }
  }

  // Rebuild better-sqlite3 for Node.js (restore unit test compatibility)
  console.log('[global-teardown] Rebuilding better-sqlite3 for Node.js...')
  execSync('npm rebuild better-sqlite3', { cwd: root, stdio: 'inherit' })
  writeFileSync(MARKER_PATH, expectedMarker, 'utf-8')
  console.log('[global-teardown] Rebuild complete, marker written.')
}
