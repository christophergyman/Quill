import '@testing-library/jest-dom/vitest'
import { DEFAULT_SETTINGS } from '../src/shared/types/settings'

// Mock ResizeObserver for Radix UI portals (not available in jsdom)
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock window.api for renderer tests
const mockApi = {
  startRecording: vi.fn(),
  stopRecording: vi.fn(),
  sendAudioChunk: vi.fn(),
  getSettings: vi.fn().mockResolvedValue(DEFAULT_SETTINGS),
  setSettings: vi.fn(),
  listSessions: vi.fn().mockResolvedValue([]),
  getSession: vi.fn().mockResolvedValue(null),
  deleteSession: vi.fn(),
  exportSession: vi.fn(),
  setOverlayMode: vi.fn(),
  writeClipboard: vi.fn(),
  exportDiagram: vi.fn(),
  onRecordingStateChanged: vi.fn().mockReturnValue(() => {}),
  onTranscriptionPartial: vi.fn().mockReturnValue(() => {}),
  onTranscriptionComplete: vi.fn().mockReturnValue(() => {}),
  onTranscriptionError: vi.fn().mockReturnValue(() => {}),
  onOverlayModeChanged: vi.fn().mockReturnValue(() => {}),
  onOverlayVisibilityChanged: vi.fn().mockReturnValue(() => {})
}

Object.defineProperty(window, 'api', {
  value: mockApi,
  writable: true
})
