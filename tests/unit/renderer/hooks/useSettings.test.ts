import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useSettings } from '../../../../src/renderer/hooks/useSettings'
import { DEFAULT_SETTINGS } from '../../../../src/shared/types/settings'

beforeEach(() => {
  vi.clearAllMocks()
  ;(window.api!.getSettings as ReturnType<typeof vi.fn>).mockResolvedValue(DEFAULT_SETTINGS)
})

describe('useSettings', () => {
  it('loads settings from window.api.getSettings on mount', async () => {
    const customSettings = {
      ...DEFAULT_SETTINGS,
      general: { ...DEFAULT_SETTINGS.general, language: 'fr' }
    }
    ;(window.api!.getSettings as ReturnType<typeof vi.fn>).mockResolvedValue(customSettings)

    const { result } = renderHook(() => useSettings())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(window.api!.getSettings).toHaveBeenCalled()
    expect(result.current.settings.general.language).toBe('fr')
  })

  it('falls back to DEFAULT_SETTINGS when window.api is missing', async () => {
    const originalApi = window.api
    Object.defineProperty(window, 'api', { value: undefined, writable: true })

    const { result } = renderHook(() => useSettings())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.settings).toEqual(DEFAULT_SETTINGS)

    Object.defineProperty(window, 'api', { value: originalApi, writable: true })
  })

  it('sets loading to false after fetch completes', async () => {
    const { result } = renderHook(() => useSettings())

    // Initially loading
    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })

  it('updateSettings merges partial and calls window.api.setSettings', async () => {
    const { result } = renderHook(() => useSettings())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const partialUpdate = { general: { ...DEFAULT_SETTINGS.general, language: 'ja' } }

    await act(async () => {
      await result.current.updateSettings(partialUpdate)
    })

    expect(window.api!.setSettings).toHaveBeenCalledWith(partialUpdate)
    expect(result.current.settings.general.language).toBe('ja')
  })

  it('preserves other settings when updating a single section', async () => {
    const { result } = renderHook(() => useSettings())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.updateSettings({
        general: { ...DEFAULT_SETTINGS.general, language: 'es' }
      })
    })

    // Voice and LLM settings should remain unchanged
    expect(result.current.settings.voice).toEqual(DEFAULT_SETTINGS.voice)
    expect(result.current.settings.llm).toEqual(DEFAULT_SETTINGS.llm)
  })
})
