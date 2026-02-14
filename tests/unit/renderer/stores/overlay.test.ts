import { describe, it, expect } from 'vitest'
import { useOverlayStore } from '../../../../src/renderer/stores/overlay'

describe('useOverlayStore', () => {
  it('defaults to passthrough mode', () => {
    expect(useOverlayStore.getState().mode).toBe('passthrough')
  })

  it('defaults to not visible', () => {
    expect(useOverlayStore.getState().visible).toBe(false)
  })

  it('updates mode', () => {
    useOverlayStore.getState().setMode('drawing')
    expect(useOverlayStore.getState().mode).toBe('drawing')
  })

  it('updates visibility', () => {
    useOverlayStore.getState().setVisible(true)
    expect(useOverlayStore.getState().visible).toBe(true)
  })
})
