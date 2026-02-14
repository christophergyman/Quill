/**
 * Typed wrapper over window.api for renderer usage.
 * Provides a clean import path and type safety.
 */
export function getApi() {
  if (!window.api) {
    throw new Error('window.api is not available — are you running outside of Electron?')
  }
  return window.api
}
