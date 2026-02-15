import { useState, useEffect, useCallback, useRef } from 'react'
import type { AppSettings } from '@shared/types/settings'
import { DEFAULT_SETTINGS } from '@shared/types/settings'
import { createRendererLogger } from '../lib/logger'

const logger = createRendererLogger('useSettings')

export function useSettings() {
  const [settings, setSettingsState] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const settingsRef = useRef(settings)
  settingsRef.current = settings

  useEffect(() => {
    if (!window.api) {
      logger.debug('No window.api, using defaults')
      setLoading(false)
      return
    }
    logger.debug('Fetching settings')
    window.api.getSettings().then((s) => {
      if (s) setSettingsState(s)
      logger.debug('Settings loaded')
      setLoading(false)
    })
  }, [])

  const updateSettings = useCallback(async (partial: Partial<AppSettings>) => {
    logger.debug('Updating settings')
    const updated = { ...settingsRef.current, ...partial }
    setSettingsState(updated)
    await window.api?.setSettings(partial)
  }, [])

  return { settings, loading, updateSettings }
}
