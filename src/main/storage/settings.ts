import Store from 'electron-store'
import { safeStorage } from 'electron'
import type { AppSettings } from '../../shared/types/settings'
import { DEFAULT_SETTINGS } from '../../shared/types/settings'
import { createLogger } from '../../shared/logger'

const logger = createLogger('settings-store')

let store: Store<{ settings: AppSettings }> | null = null

function getStore(): Store<{ settings: AppSettings }> {
  if (!store) {
    store = new Store<{ settings: AppSettings }>({
      name: 'quill-settings',
      defaults: { settings: DEFAULT_SETTINGS }
    })
  }
  return store
}

export function getSettings(): AppSettings {
  return getStore().get('settings')
}

export function setSettings(partial: Partial<AppSettings>): AppSettings {
  const current = getSettings()
  const updated = mergeSettings(current, partial)
  getStore().set('settings', updated)
  logger.debug('Settings updated')
  return updated
}

export function encryptApiKey(key: string): string {
  if (!key) return ''
  logger.debug('Encrypting API key')
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error(
      'Cannot securely store API key — safeStorage encryption is not available on this system'
    )
  }
  return safeStorage.encryptString(key).toString('base64')
}

export function decryptApiKey(encrypted: string): string {
  if (!encrypted) return ''
  logger.debug('Decrypting API key')
  if (!safeStorage.isEncryptionAvailable()) {
    logger.warn('safeStorage not available, returning key as-is (may be unencrypted)')
    return encrypted
  }
  try {
    return safeStorage.decryptString(Buffer.from(encrypted, 'base64'))
  } catch {
    // Key may have been stored before encryption was available
    logger.warn('Failed to decrypt API key, returning as-is')
    return encrypted
  }
}

function mergeSettings(current: AppSettings, partial: Partial<AppSettings>): AppSettings {
  return {
    general: { ...current.general, ...partial.general },
    voice: { ...current.voice, ...partial.voice },
    llm: { ...current.llm, ...partial.llm },
    shortcuts: { ...current.shortcuts, ...partial.shortcuts }
  }
}
