import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SessionList } from '../../../../../src/renderer/components/library/SessionList'
import type { SessionListItem } from '../../../../../src/shared/types/session'

const mockSessions: SessionListItem[] = [
  {
    id: 's-1',
    createdAt: '2025-06-15T10:30:00.000Z',
    title: 'First Session',
    rawText: 'Hello world',
    durationMs: 5000,
    hasDiagram: false
  },
  {
    id: 's-2',
    createdAt: '2025-06-16T14:00:00.000Z',
    title: 'Second Session',
    rawText: 'Another recording with more text for preview testing',
    durationMs: 12000,
    hasDiagram: true
  }
]

describe('SessionList', () => {
  it('renders list of session cards', () => {
    render(<SessionList sessions={mockSessions} loading={false} onSelect={vi.fn()} />)
    expect(screen.getByText('First Session')).toBeInTheDocument()
    expect(screen.getByText('Second Session')).toBeInTheDocument()
  })

  it('shows empty state when no sessions', () => {
    render(<SessionList sessions={[]} loading={false} onSelect={vi.fn()} />)
    expect(screen.getByText(/No sessions yet/)).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<SessionList sessions={[]} loading={true} onSelect={vi.fn()} />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('clicking a session card calls onSelect', () => {
    const onSelect = vi.fn()
    render(<SessionList sessions={mockSessions} loading={false} onSelect={onSelect} />)
    fireEvent.click(screen.getByText('First Session'))
    expect(onSelect).toHaveBeenCalledWith('s-1')
  })

  it('highlights selected session', () => {
    render(
      <SessionList sessions={mockSessions} loading={false} selectedId="s-1" onSelect={vi.fn()} />
    )
    // The selected card should have bg-blue-50 class
    const button = screen.getByText('First Session').closest('button')
    expect(button?.className).toContain('bg-blue-50')
  })

  it('shows diagram badge when session has diagram', () => {
    render(<SessionList sessions={mockSessions} loading={false} onSelect={vi.fn()} />)
    expect(screen.getByText('diagram')).toBeInTheDocument()
  })
})
