/**
 * Kills orphaned Vitest workers and Playwright-spawned Electron instances
 * scoped to this project. Safe to run anytime — only targets processes
 * whose command lines contain this project's absolute path.
 *
 * Usage:
 *   node scripts/clean-test-processes.mjs           # verbose
 *   node scripts/clean-test-processes.mjs --silent   # suppress output when nothing found
 */

import { execSync } from 'child_process'
import { readdirSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const ROOT = resolve(__dirname, '..')
const SILENT = process.argv.includes('--silent')

function log(...args) {
  if (!SILENT) console.log('[clean-test-processes]', ...args)
}

function findPids(pattern) {
  try {
    const out = execSync(`pgrep -f "${pattern}"`, { encoding: 'utf-8' }).trim()
    return out
      .split('\n')
      .map((s) => parseInt(s, 10))
      .filter((pid) => pid !== process.pid && !isNaN(pid))
  } catch {
    // pgrep exits 1 when no matches — not an error
    return []
  }
}

function killPids(pids, label) {
  if (pids.length === 0) return

  log(`Found ${pids.length} orphaned ${label} process(es): ${pids.join(', ')}`)

  // SIGTERM first — give processes a chance to clean up
  for (const pid of pids) {
    try {
      process.kill(pid, 'SIGTERM')
    } catch {
      // already dead
    }
  }

  // Wait 2s then SIGKILL survivors
  const deadline = Date.now() + 2000
  const remaining = [...pids]

  while (remaining.length > 0 && Date.now() < deadline) {
    for (let i = remaining.length - 1; i >= 0; i--) {
      try {
        process.kill(remaining[i], 0) // check if alive
      } catch {
        remaining.splice(i, 1) // already dead
      }
    }
    if (remaining.length > 0) {
      execSync('sleep 0.2')
    }
  }

  for (const pid of remaining) {
    try {
      process.kill(pid, 'SIGKILL')
      log(`Force-killed PID ${pid}`)
    } catch {
      // already dead
    }
  }
}

// Escape special regex chars in project path for pgrep
const escapedRoot = ROOT.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// 1. Kill orphaned Vitest workers for this project
const vitestPids = findPids(`vitest.*${escapedRoot}`)
killPids(vitestPids, 'Vitest')

// 2. Kill orphaned Electron instances from E2E tests
const electronPids = findPids(`${escapedRoot}/out/main/index\\.js`)
killPids(electronPids, 'Electron (E2E)')

// 3. Clean stale quill-test-* temp directories
let tempCleaned = 0
try {
  const tmp = tmpdir()
  for (const entry of readdirSync(tmp)) {
    if (entry.startsWith('quill-test-')) {
      rmSync(join(tmp, entry), { recursive: true, force: true })
      tempCleaned++
    }
  }
} catch {
  // tmpdir read failure is non-fatal
}

if (tempCleaned > 0) {
  log(`Cleaned ${tempCleaned} stale quill-test-* temp dir(s)`)
}

const totalKilled = vitestPids.length + electronPids.length
if (totalKilled === 0 && tempCleaned === 0) {
  if (!SILENT) log('No orphaned processes or stale temp dirs found.')
} else if (!SILENT) {
  log('Cleanup complete.')
}
