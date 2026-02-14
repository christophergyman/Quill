import { useState, useEffect, useCallback } from 'react'
import type { AppSettings } from '@shared/types/settings'
import { DEFAULT_SETTINGS } from '@shared/types/settings'

export function useSettings() {
  const [settings, setSettingsState] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.api.getSettings().then((s) => {
      if (s) setSettingsState(s)
      setLoading(false)
    })
  }, [])

  const updateSettings = useCallback(
    async (partial: Partial<AppSettings>) => {
      const updated = { ...settings, ...partial }
      setSettingsState(updated)
      await window.api.setSettings(partial)
    },
    [settings]
  )

  return { settings, loading, updateSettings }
}
