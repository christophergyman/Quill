import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { resolve } from 'path'

export default function globalSetup() {
  const root = resolve(__dirname, '../..')
  const outMain = resolve(root, 'out/main/index.js')
  const forceBuild = process.env.FORCE_BUILD === '1'

  if (!existsSync(outMain) || forceBuild) {
    console.log('[global-setup] Building app with electron-vite...')
    execSync('npx electron-vite build', { cwd: root, stdio: 'inherit' })
    console.log('[global-setup] Build complete.')
  } else {
    console.log('[global-setup] Build output found, skipping build.')
  }

  // Rebuild better-sqlite3 for Electron's Node version
  console.log('[global-setup] Rebuilding better-sqlite3 for Electron...')
  execSync('npx electron-rebuild -f -w better-sqlite3', { cwd: root, stdio: 'inherit' })
}
