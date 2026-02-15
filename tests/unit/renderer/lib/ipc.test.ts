import { describe, it, expect } from 'vitest'
import { getApi } from '../../../../src/renderer/lib/ipc'

describe('getApi', () => {
  it('returns window.api when available', () => {
    const api = getApi()
    expect(api).toBeDefined()
    expect(api).toBe(window.api)
  })

  it('throws when window.api is undefined', () => {
    const originalApi = window.api
    Object.defineProperty(window, 'api', { value: undefined, writable: true })

    expect(() => getApi()).toThrow('window.api is not available')

    Object.defineProperty(window, 'api', { value: originalApi, writable: true })
  })
})
