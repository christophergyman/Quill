import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('../../../../src/renderer/hooks/useSession', () => ({
  useSession: vi.fn().mockReturnValue({
    sessions: [],
    currentSession: null,
    searchQuery: '',
    loading: false,
    setSearchQuery: vi.fn(),
    loadSessions: vi.fn(),
    loadSession: vi.fn(),
    deleteSession: vi.fn()
  })
}))

vi.mock('../../../../src/renderer/hooks/useSettings', () => ({
  useSettings: vi.fn().mockReturnValue({
    settings: {
      general: { launchAtLogin: false, theme: 'system' },
      voice: { backend: 'openai-cloud', language: 'en' },
      llm: { enabled: false, provider: 'openai', model: 'gpt-4o-mini' },
      shortcuts: {
        toggleOverlay: 'CommandOrControl+Shift+O',
        toggleDrawing: 'CommandOrControl+Shift+D'
      }
    },
    loading: false,
    updateSettings: vi.fn()
  })
}))

import { AppShell } from '../../../../src/renderer/components/AppShell'

describe('AppShell', () => {
  it('renders LibraryRoot by default', () => {
    render(<AppShell />)
    expect(screen.getByText('Library')).toBeInTheDocument()
  })

  it('switches to SettingsRoot when gear icon is clicked', () => {
    render(<AppShell />)

    // Find and click the settings gear button
    const settingsButton = screen.getByRole('button', { name: '' })
    fireEvent.click(settingsButton)

    // Settings tabs should now be visible
    expect(screen.getAllByText('General').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('About')).toBeInTheDocument()
  })

  it('returns to LibraryRoot when back arrow is clicked', () => {
    render(<AppShell />)

    // Switch to settings
    const settingsButton = screen.getByRole('button', { name: '' })
    fireEvent.click(settingsButton)

    // Click back to library
    const backButton = screen.getByRole('button', { name: /library/i })
    fireEvent.click(backButton)

    // Library heading should be visible again
    expect(screen.getByText('Library')).toBeInTheDocument()
  })
})
