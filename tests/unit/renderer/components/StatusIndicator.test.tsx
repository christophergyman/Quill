import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusIndicator } from '../../../../src/renderer/components/overlay/StatusIndicator'

describe('StatusIndicator', () => {
  it('renders nothing when idle', () => {
    const { container } = render(<StatusIndicator state="idle" />)
    expect(container.firstChild).toBeNull()
  })

  it('shows recording state', () => {
    render(<StatusIndicator state="recording" />)
    expect(screen.getByText('recording')).toBeInTheDocument()
  })

  it('shows processing state', () => {
    render(<StatusIndicator state="processing" />)
    expect(screen.getByText('processing')).toBeInTheDocument()
  })

  it('shows complete state', () => {
    render(<StatusIndicator state="complete" />)
    expect(screen.getByText('complete')).toBeInTheDocument()
  })

  it('shows error state', () => {
    render(<StatusIndicator state="error" />)
    expect(screen.getByText('error')).toBeInTheDocument()
  })
})
