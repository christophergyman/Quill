import { describe, it, expect, vi, beforeEach } from 'vitest'

// Use vi.hoisted so the variable is available inside hoisted vi.mock factories
const { storeRef, mockIsEncryptionAvailable, mockEncryptString, mockDecryptString } = vi.hoisted(
  () => ({
    storeRef: { data: {} as Record<string, unknown> },
    mockIsEncryptionAvailable: vi.fn().mockReturnValue(true),
    mockEncryptString: vi.fn().mockReturnValue(Buffer.from('encrypted-data')),
    mockDecryptString: vi.fn().mockReturnValue('decrypted-key')
  })
)

vi.mock('electron-store', () => {
  return {
    default: class MockStore {
      private defaults: Record<string, unknown>
      constructor(opts: { defaults?: Record<string, unknown> } = {}) {
        this.defaults = opts.defaults || {}
        for (const [key, value] of Object.entries(this.defaults)) {
          if (!(key in storeRef.data)) {
            storeRef.data[key] = JSON.parse(JSON.stringify(value))
          }
        }
      }
      get(key: string) {
        return storeRef.data[key] ?? this.defaults[key]
      }
      set(key: string, value: unknown) {
        storeRef.data[key] = value
      }
    }
  }
})

vi.mock('electron', () => ({
  safeStorage: {
    isEncryptionAvailable: () => mockIsEncryptionAvailable(),
    encryptString: (s: string) => mockEncryptString(s),
    decryptString: (b: Buffer) => mockDecryptString(b)
  }
}))

import {
  getSettings,
  setSettings,
  encryptApiKey,
  decryptApiKey
} from '../../../../src/main/storage/settings'
import { DEFAULT_SETTINGS } from '../../../../src/shared/types/settings'

beforeEach(() => {
  vi.clearAllMocks()
  storeRef.data = {}
  mockIsEncryptionAvailable.mockReturnValue(true)
  mockEncryptString.mockReturnValue(Buffer.from('encrypted-data'))
  mockDecryptString.mockReturnValue('decrypted-key')
})

describe('getSettings', () => {
  it('returns DEFAULT_SETTINGS initially', () => {
    const settings = getSettings()
    expect(settings).toEqual(DEFAULT_SETTINGS)
  })
})

describe('setSettings', () => {
  it('merges nested objects correctly', () => {
    const updated = setSettings({
      general: { ...DEFAULT_SETTINGS.general, language: 'fr' }
    })
    expect(updated.general.language).toBe('fr')
    expect(updated.voice).toEqual(DEFAULT_SETTINGS.voice)
    expect(updated.llm).toEqual(DEFAULT_SETTINGS.llm)
    expect(updated.shortcuts).toEqual(DEFAULT_SETTINGS.shortcuts)
  })

  it('preserves keys not in partial', () => {
    const updated = setSettings({
      voice: { ...DEFAULT_SETTINGS.voice, model: 'whisper-2' }
    })
    expect(updated.voice.model).toBe('whisper-2')
    expect(updated.voice.backend).toBe('whisper-cloud')
    expect(updated.general).toEqual(DEFAULT_SETTINGS.general)
  })
})

describe('encryptApiKey', () => {
  it('returns empty string for empty key', () => {
    expect(encryptApiKey('')).toBe('')
  })

  it('throws when safeStorage unavailable', () => {
    mockIsEncryptionAvailable.mockReturnValue(false)
    expect(() => encryptApiKey('my-key')).toThrow('safeStorage encryption is not available')
  })

  it('returns base64 string when encryption available', () => {
    const result = encryptApiKey('my-api-key')
    expect(mockEncryptString).toHaveBeenCalledWith('my-api-key')
    expect(typeof result).toBe('string')
    expect(result).toBe(Buffer.from('encrypted-data').toString('base64'))
  })
})

describe('decryptApiKey', () => {
  it('returns empty string for empty encrypted', () => {
    expect(decryptApiKey('')).toBe('')
  })

  it('decrypts successfully', () => {
    const result = decryptApiKey(Buffer.from('encrypted-data').toString('base64'))
    expect(mockDecryptString).toHaveBeenCalled()
    expect(result).toBe('decrypted-key')
  })

  it('returns input on failure (graceful fallback)', () => {
    mockDecryptString.mockImplementation(() => {
      throw new Error('decrypt failed')
    })
    const input = 'some-bad-data'
    const result = decryptApiKey(input)
    expect(result).toBe(input)
  })

  it('returns key as-is when safeStorage not available', () => {
    mockIsEncryptionAvailable.mockReturnValue(false)
    const result = decryptApiKey('some-key')
    expect(result).toBe('some-key')
  })
})
