import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DEFAULT_SETTINGS } from '../../../../../src/shared/types/settings'

vi.mock('../../../../../src/renderer/hooks/useSettings', () => ({
  useSettings: vi.fn().mockReturnValue({
    settings: DEFAULT_SETTINGS,
    loading: false,
    updateSettings: vi.fn()
  })
}))

import { SettingsRoot } from '../../../../../src/renderer/components/settings/SettingsRoot'
import { useSettings } from '../../../../../src/renderer/hooks/useSettings'

describe('SettingsRoot', () => {
  it('renders tab navigation', () => {
    render(<SettingsRoot />)
    // Use getAllByText since "General" appears as both tab button and heading
    expect(screen.getAllByText('General').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Voice').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('LLM')).toBeInTheDocument()
    expect(screen.getByText('Shortcuts')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
  })

  it('default tab is General', () => {
    render(<SettingsRoot />)
    // General tab content should be visible — it shows "Launch at login"
    expect(screen.getByText('Launch at login')).toBeInTheDocument()
  })

  it('clicking tabs switches content', () => {
    render(<SettingsRoot />)

    // Click About tab
    fireEvent.click(screen.getByRole('button', { name: 'About' }))
    // About tab should now be visible — General content should be gone
    expect(screen.queryByText('Launch at login')).not.toBeInTheDocument()
  })

  it('shows loading state', () => {
    ;(useSettings as ReturnType<typeof vi.fn>).mockReturnValue({
      settings: DEFAULT_SETTINGS,
      loading: true,
      updateSettings: vi.fn()
    })

    render(<SettingsRoot />)
    expect(screen.getByText('Loading settings...')).toBeInTheDocument()
  })
})
