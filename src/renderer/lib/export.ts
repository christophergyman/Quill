import { createRendererLogger } from './logger'

const logger = createRendererLogger('export')

/**
 * Convert an SVG string to a PNG data URL via Canvas.
 */
export async function svgToPng(svgString: string, width = 1920, height = 1080): Promise<string> {
  logger.debug('Converting SVG to PNG (%dx%d)', width, height)
  return new Promise((resolve, reject) => {
    const img = new Image()
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        logger.error('Could not get canvas context')
        reject(new Error('Could not get canvas context'))
        return
      }
      ctx.drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/png'))
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      logger.error('Failed to load SVG for PNG export')
      reject(new Error('Failed to load SVG for PNG export'))
    }

    img.src = url
  })
}
