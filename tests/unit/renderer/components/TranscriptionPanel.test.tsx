import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TranscriptionPanel } from '../../../../src/renderer/components/overlay/TranscriptionPanel'

describe('TranscriptionPanel', () => {
  it('renders transcription text', () => {
    render(<TranscriptionPanel text="Hello, world." />)
    expect(screen.getByText('Hello, world.')).toBeInTheDocument()
  })

  it('uses monospace font', () => {
    render(<TranscriptionPanel text="test" />)
    const el = screen.getByText('test')
    expect(el.style.fontFamily).toBe('var(--font-mono)')
  })
})
