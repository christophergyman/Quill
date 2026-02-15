import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useOverlay } from '../../../../src/renderer/hooks/useOverlay'
import { useOverlayStore } from '../../../../src/renderer/stores/overlay'

let modeCallback: (mode: string) => void
let visibilityCallback: (visible: boolean) => void

const cleanupMode = vi.fn()
const cleanupVisibility = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  useOverlayStore.setState({ mode: 'passthrough', visible: false })
  ;(window.api!.onOverlayModeChanged as ReturnType<typeof vi.fn>).mockImplementation(
    (cb: typeof modeCallback) => {
      modeCallback = cb
      return cleanupMode
    }
  )
  ;(window.api!.onOverlayVisibilityChanged as ReturnType<typeof vi.fn>).mockImplementation(
    (cb: typeof visibilityCallback) => {
      visibilityCallback = cb
      return cleanupVisibility
    }
  )
})

describe('useOverlay', () => {
  it('returns the correct shape', () => {
    const { result } = renderHook(() => useOverlay())
    expect(result.current).toHaveProperty('mode')
    expect(result.current).toHaveProperty('visible')
    expect(typeof result.current.requestModeChange).toBe('function')
  })

  it('subscribes to onOverlayModeChanged and onOverlayVisibilityChanged on mount', () => {
    renderHook(() => useOverlay())
    expect(window.api!.onOverlayModeChanged).toHaveBeenCalled()
    expect(window.api!.onOverlayVisibilityChanged).toHaveBeenCalled()
  })

  it('cleans up listeners on unmount', () => {
    const { unmount } = renderHook(() => useOverlay())
    unmount()
    expect(cleanupMode).toHaveBeenCalled()
    expect(cleanupVisibility).toHaveBeenCalled()
  })

  it('updates mode on IPC event', () => {
    const { result } = renderHook(() => useOverlay())

    act(() => {
      modeCallback('drawing')
    })

    expect(result.current.mode).toBe('drawing')
  })

  it('updates visibility on IPC event', () => {
    const { result } = renderHook(() => useOverlay())

    act(() => {
      visibilityCallback(true)
    })

    expect(result.current.visible).toBe(true)
  })

  it('requestModeChange calls window.api.setOverlayMode', () => {
    const { result } = renderHook(() => useOverlay())

    act(() => {
      result.current.requestModeChange('drawing')
    })

    expect(window.api!.setOverlayMode).toHaveBeenCalledWith('drawing')
  })

  it('defaults to passthrough mode and not visible', () => {
    const { result } = renderHook(() => useOverlay())
    expect(result.current.mode).toBe('passthrough')
    expect(result.current.visible).toBe(false)
  })
})
