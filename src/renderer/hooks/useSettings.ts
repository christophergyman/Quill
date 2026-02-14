import { useState, useEffect, useCallback, useRef } from 'react'
import type { AppSettings } from '@shared/types/settings'
import { DEFAULT_SETTINGS } from '@shared/types/settings'

export function useSettings() {
  const [settings, setSettingsState] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const settingsRef = useRef(settings)
  settingsRef.current = settings

  useEffect(() => {
    if (!window.api) {
      setLoading(false)
      return
    }
    window.api.getSettings().then((s) => {
      if (s) setSettingsState(s)
      setLoading(false)
    })
  }, [])

  const updateSettings = useCallback(async (partial: Partial<AppSettings>) => {
    const updated = { ...settingsRef.current, ...partial }
    setSettingsState(updated)
    await window.api?.setSettings(partial)
  }, [])

  return { settings, loading, updateSettings }
}
