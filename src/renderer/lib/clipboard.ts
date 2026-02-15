import { createRendererLogger } from './logger'

const logger = createRendererLogger('clipboard')

export async function copyToClipboard(text: string): Promise<void> {
  if (window.api) {
    await window.api.writeClipboard(text)
    logger.debug('Copied to clipboard via Electron')
  } else {
    await navigator.clipboard.writeText(text)
    logger.debug('Copied to clipboard via navigator')
  }
}
