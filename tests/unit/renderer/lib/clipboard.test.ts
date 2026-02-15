import { describe, it, expect, vi, beforeEach } from 'vitest'
import { copyToClipboard } from '../../../../src/renderer/lib/clipboard'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('copyToClipboard', () => {
  it('uses window.api.writeClipboard when available', async () => {
    await copyToClipboard('test text')
    expect(window.api!.writeClipboard).toHaveBeenCalledWith('test text')
  })

  it('falls back to navigator.clipboard.writeText', async () => {
    const originalApi = window.api
    Object.defineProperty(window, 'api', { value: undefined, writable: true })

    const mockWriteText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      writable: true,
      configurable: true
    })

    await copyToClipboard('fallback text')
    expect(mockWriteText).toHaveBeenCalledWith('fallback text')

    Object.defineProperty(window, 'api', { value: originalApi, writable: true })
  })
})
