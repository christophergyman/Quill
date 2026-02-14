import { useEffect } from 'react'
import { useOverlayStore } from '../stores/overlay'
import type { OverlayMode } from '@shared/types/ipc'

export function useOverlay() {
  const { mode, visible, setMode, setVisible } = useOverlayStore()

  useEffect(() => {
    if (!window.api) return

    const cleanupMode = window.api.onOverlayModeChanged((newMode) => {
      setMode(newMode as OverlayMode)
    })

    const cleanupVisibility = window.api.onOverlayVisibilityChanged((isVisible) => {
      setVisible(isVisible)
    })

    return () => {
      cleanupMode()
      cleanupVisibility()
    }
  }, [setMode, setVisible])

  const requestModeChange = (newMode: OverlayMode) => {
    window.api?.setOverlayMode(newMode)
  }

  return { mode, visible, requestModeChange }
}
