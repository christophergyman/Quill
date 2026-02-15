import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Toolbar } from '../../../../../src/renderer/components/overlay/Toolbar'

describe('Toolbar', () => {
  it('renders all toolbar buttons', () => {
    render(<Toolbar />)
    expect(screen.getByText('Export SVG')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
    expect(screen.getByText('Clear')).toBeInTheDocument()
  })

  it('renders drawing mode label', () => {
    render(<Toolbar />)
    expect(screen.getByText('Drawing mode')).toBeInTheDocument()
  })

  it('export button calls onExportSvg handler', async () => {
    const onExportSvg = vi.fn().mockResolvedValue('<svg></svg>')
    render(<Toolbar onExportSvg={onExportSvg} />)

    fireEvent.click(screen.getByText('Export SVG'))

    // Wait for async handler
    await vi.waitFor(() => {
      expect(onExportSvg).toHaveBeenCalled()
    })
  })

  it('save button calls onGetSnapshot handler', () => {
    const onGetSnapshot = vi.fn().mockReturnValue('{"data":"snapshot"}')
    render(<Toolbar onGetSnapshot={onGetSnapshot} />)

    fireEvent.click(screen.getByText('Save'))
    expect(onGetSnapshot).toHaveBeenCalled()
  })

  it('clear button calls onClear handler', () => {
    const onClear = vi.fn()
    render(<Toolbar onClear={onClear} />)

    fireEvent.click(screen.getByText('Clear'))
    expect(onClear).toHaveBeenCalled()
  })

  it('renders keyboard shortcut hint', () => {
    render(<Toolbar />)
    expect(screen.getByText(/⌘⇧D/)).toBeInTheDocument()
  })
})
