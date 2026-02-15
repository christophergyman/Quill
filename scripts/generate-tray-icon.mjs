#!/usr/bin/env node

/**
 * Generates macOS template tray icons for Quill.
 *
 * Template icons (suffixed "Template") let macOS automatically
 * adapt the icon colour to the menu-bar appearance (light / dark).
 * Only the alpha channel matters — we draw in solid black.
 *
 * Outputs:
 *   resources/tray-iconTemplate.png    (18×18)
 *   resources/tray-iconTemplate@2x.png (36×36)
 *
 * Requires: @napi-rs/canvas  (pure-JS canvas, no native deps)
 *   bun add -d @napi-rs/canvas
 */

import { createCanvas } from '@napi-rs/canvas'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '..', 'resources')
mkdirSync(outDir, { recursive: true })

/**
 * Draw a microphone silhouette onto the given canvas context.
 * All coordinates are normalised to `size`.
 */
function drawMicrophone(ctx, size) {
  const cx = size / 2
  const scale = size / 18 // design grid is 18×18

  ctx.fillStyle = '#000000'
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 1.5 * scale
  ctx.lineCap = 'round'

  // --- Mic head (rounded rect / capsule) ---
  const micW = 6 * scale
  const micH = 9 * scale
  const micX = cx - micW / 2
  const micY = 2 * scale
  const r = micW / 2

  ctx.beginPath()
  ctx.moveTo(micX + r, micY)
  ctx.lineTo(micX + micW - r, micY)
  ctx.arc(micX + micW - r, micY + r, r, -Math.PI / 2, Math.PI / 2)
  ctx.lineTo(micX + r, micY + micH)
  ctx.arc(micX + r, micY + micH - r, r, Math.PI / 2, (3 * Math.PI) / 2)
  ctx.closePath()
  ctx.fill()

  // --- Cradle arc ---
  const cradleR = 5 * scale
  const cradleCY = 7 * scale
  ctx.beginPath()
  ctx.arc(cx, cradleCY, cradleR, 0.15 * Math.PI, 0.85 * Math.PI)
  ctx.stroke()

  // --- Stem ---
  const stemTop = cradleCY + cradleR * Math.sin(0.85 * Math.PI) + 0.5 * scale
  const stemBottom = 16 * scale
  ctx.beginPath()
  ctx.moveTo(cx, stemTop)
  ctx.lineTo(cx, stemBottom)
  ctx.stroke()

  // --- Base ---
  const baseHalf = 2.5 * scale
  ctx.beginPath()
  ctx.moveTo(cx - baseHalf, stemBottom)
  ctx.lineTo(cx + baseHalf, stemBottom)
  ctx.stroke()
}

for (const size of [18, 36]) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Transparent background (only alpha channel matters for template icons)
  ctx.clearRect(0, 0, size, size)
  drawMicrophone(ctx, size)

  const suffix = size === 36 ? '@2x' : ''
  const filename = `tray-iconTemplate${suffix}.png`
  const buf = canvas.toBuffer('image/png')
  writeFileSync(join(outDir, filename), buf)
  console.log(`✓ ${filename}  (${size}×${size}, ${buf.length} bytes)`)
}
