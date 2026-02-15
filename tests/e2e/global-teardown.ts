import { execSync } from 'child_process'
import { resolve } from 'path'

export default function globalTeardown() {
  const root = resolve(__dirname, '../..')

  // Rebuild better-sqlite3 for Node.js (restore unit test compatibility)
  console.log('[global-teardown] Rebuilding better-sqlite3 for Node.js...')
  execSync('npm rebuild better-sqlite3', { cwd: root, stdio: 'inherit' })
}
