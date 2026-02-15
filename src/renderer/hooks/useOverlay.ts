import { useEffect } from 'react'
import { useOverlayStore } from '../stores/overlay'
import type { OverlayMode } from '@shared/types/ipc'
import { createRendererLogger } from '../lib/logger'

const logger = createRendererLogger('useOverlay')

export function useOverlay() {
  const { mode, visible, setMode, setVisible } = useOverlayStore()

  useEffect(() => {
    if (!window.api) return

    const cleanupMode = window.api.onOverlayModeChanged((newMode) => {
      logger.debug('Mode changed: %s', newMode)
      setMode(newMode as OverlayMode)
    })

    const cleanupVisibility = window.api.onOverlayVisibilityChanged((isVisible) => {
      logger.debug('Visibility changed: %s', isVisible)
      setVisible(isVisible)
    })

    return () => {
      cleanupMode()
      cleanupVisibility()
    }
  }, [setMode, setVisible])

  const requestModeChange = (newMode: OverlayMode) => {
    logger.debug('Requesting mode change: %s', newMode)
    window.api?.setOverlayMode(newMode)
  }

  return { mode, visible, requestModeChange }
}
