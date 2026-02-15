import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SessionDetail } from '../../../../../src/renderer/components/library/SessionDetail'

vi.mock('../../../../../src/renderer/lib/clipboard', () => ({
  copyToClipboard: vi.fn()
}))

import { copyToClipboard } from '../../../../../src/renderer/lib/clipboard'

const baseSession = {
  id: 's-1',
  createdAt: '2025-06-15T10:30:00.000Z',
  updatedAt: '2025-06-15T10:31:00.000Z',
  title: 'Test Session',
  rawText: 'Hello world raw',
  cleanedText: 'Hello, world.',
  summary: null as string | null,
  durationMs: 5000,
  voiceBackend: 'whisper-cloud' as const,
  llmEnabled: false,
  language: 'en',
  metadata: null,
  diagrams: [] as string[]
}

describe('SessionDetail', () => {
  it('renders session title and text', () => {
    render(<SessionDetail session={baseSession} onDelete={vi.fn()} />)
    expect(screen.getByText('Test Session')).toBeInTheDocument()
    expect(screen.getByText('Hello world raw')).toBeInTheDocument()
  })

  it('renders date and duration', () => {
    render(<SessionDetail session={baseSession} onDelete={vi.fn()} />)
    expect(screen.getByText('5s')).toBeInTheDocument()
    expect(screen.getByText('whisper-cloud')).toBeInTheDocument()
  })

  it('shows summary when present', () => {
    const sessionWithSummary = { ...baseSession, summary: 'This is a summary' }
    render(<SessionDetail session={sessionWithSummary} onDelete={vi.fn()} />)
    expect(screen.getByText('Summary')).toBeInTheDocument()
    expect(screen.getByText('This is a summary')).toBeInTheDocument()
  })

  it('does not show summary when absent', () => {
    render(<SessionDetail session={baseSession} onDelete={vi.fn()} />)
    expect(screen.queryByText('Summary')).not.toBeInTheDocument()
  })

  it('copy button calls clipboard write', () => {
    render(<SessionDetail session={baseSession} onDelete={vi.fn()} />)
    fireEvent.click(screen.getByText('Copy'))
    expect(copyToClipboard).toHaveBeenCalledWith('Hello, world.')
  })

  it('copy button uses rawText when cleanedText is absent', () => {
    const sessionNoClean = { ...baseSession, cleanedText: null as string | null }
    render(<SessionDetail session={sessionNoClean} onDelete={vi.fn()} />)
    fireEvent.click(screen.getByText('Copy'))
    expect(copyToClipboard).toHaveBeenCalledWith('Hello world raw')
  })

  it('delete button calls delete handler', () => {
    const onDelete = vi.fn()
    render(<SessionDetail session={baseSession} onDelete={onDelete} />)
    fireEvent.click(screen.getByText('Delete'))
    expect(onDelete).toHaveBeenCalledWith('s-1')
  })

  it('renders diagrams when present', () => {
    const sessionWithDiagrams = {
      ...baseSession,
      diagrams: [
        {
          id: 'd-1',
          sessionId: 's-1',
          tldrawSnapshot: '{}',
          pngData: null,
          createdAt: '2025-06-15'
        }
      ]
    }
    render(<SessionDetail session={sessionWithDiagrams} onDelete={vi.fn()} />)
    expect(screen.getByText('Diagrams')).toBeInTheDocument()
    expect(screen.getByText('Diagram snapshot saved')).toBeInTheDocument()
  })
})
