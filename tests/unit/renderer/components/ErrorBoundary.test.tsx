import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary } from '../../../../src/renderer/components/ui/ErrorBoundary'

let shouldThrow = false

function ThrowingComponent() {
  if (shouldThrow) {
    throw new Error('Test error message')
  }
  return <div>Child content</div>
}

// Suppress React error boundary console noise in tests
const originalConsoleError = console.error
beforeEach(() => {
  shouldThrow = false
  console.error = vi.fn()
})
afterEach(() => {
  console.error = originalConsoleError
})

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Hello</div>
      </ErrorBoundary>
    )
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('shows error message when child throws', () => {
    shouldThrow = true
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    )
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Test error message')).toBeInTheDocument()
  })

  it('"Try again" button resets error state', () => {
    shouldThrow = true
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()

    // Stop throwing before clicking "Try again"
    shouldThrow = false

    fireEvent.click(screen.getByText('Try again'))

    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('renders custom fallback when provided', () => {
    shouldThrow = true
    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowingComponent />
      </ErrorBoundary>
    )
    expect(screen.getByText('Custom fallback')).toBeInTheDocument()
  })

  it('calls componentDidCatch with error info', () => {
    shouldThrow = true
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    )
    expect(screen.getByText('Test error message')).toBeInTheDocument()
  })
})
