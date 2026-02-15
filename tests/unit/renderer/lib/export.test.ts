import { describe, it, expect, vi } from 'vitest'
import { svgToPng } from '../../../../src/renderer/lib/export'

// jsdom doesn't support Image/Canvas well, so we need to mock them
describe('svgToPng', () => {
  it('rejects on SVG load error', async () => {
    // In jsdom, Image won't load SVGs properly, so this should reject
    // We mock Image to trigger onerror
    const originalImage = globalThis.Image
    globalThis.Image = class MockImage {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      _src = ''
      set src(_url: string) {
        this._src = _url
        // Simulate error
        setTimeout(() => this.onerror?.(), 0)
      }
      get src() {
        return this._src
      }
    } as unknown as typeof Image

    const originalCreateObjectURL = URL.createObjectURL
    const originalRevokeObjectURL = URL.revokeObjectURL
    URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url')
    URL.revokeObjectURL = vi.fn()

    await expect(svgToPng('<svg></svg>')).rejects.toThrow('Failed to load SVG')

    globalThis.Image = originalImage
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
  })

  it('rejects on canvas context failure', async () => {
    const originalImage = globalThis.Image
    const originalCreateElement = document.createElement

    globalThis.Image = class MockImage {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      _src = ''
      set src(_url: string) {
        this._src = _url
        setTimeout(() => this.onload?.(), 0)
      }
      get src() {
        return this._src
      }
    } as unknown as typeof Image

    const originalCreateObjectURL = URL.createObjectURL
    const originalRevokeObjectURL = URL.revokeObjectURL
    URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url')
    URL.revokeObjectURL = vi.fn()

    // Mock canvas to return null context
    document.createElement = vi.fn().mockImplementation((tag: string) => {
      if (tag === 'canvas') {
        return {
          width: 0,
          height: 0,
          getContext: () => null
        }
      }
      return originalCreateElement.call(document, tag)
    })

    await expect(svgToPng('<svg></svg>')).rejects.toThrow('Could not get canvas context')

    globalThis.Image = originalImage
    document.createElement = originalCreateElement
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
  })
})
