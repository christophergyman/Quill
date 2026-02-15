import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { Editor } from 'tldraw'
import { useTldraw } from '../../../../src/renderer/hooks/useTldraw'

function createMockEditor(shapes: string[] = []) {
  const shapeIds = new Set(shapes)
  return {
    store: {
      getStoreSnapshot: vi.fn().mockReturnValue({ data: 'snapshot' })
    },
    getCurrentPageShapeIds: vi.fn().mockReturnValue(shapeIds),
    getSvgString: vi.fn().mockResolvedValue({ svg: '<svg></svg>' }),
    selectAll: vi.fn().mockReturnThis(),
    deleteShapes: vi.fn(),
    getSelectedShapeIds: vi.fn().mockReturnValue(shapes)
  }
}

describe('useTldraw', () => {
  it('returns the correct shape', () => {
    const { result } = renderHook(() => useTldraw())
    expect(result.current).toHaveProperty('editorRef')
    expect(typeof result.current.setEditor).toBe('function')
    expect(typeof result.current.getSnapshot).toBe('function')
    expect(typeof result.current.exportAsSvg).toBe('function')
    expect(typeof result.current.clear).toBe('function')
  })

  it('setEditor stores editor ref', () => {
    const { result } = renderHook(() => useTldraw())
    const mockEditor = createMockEditor()

    act(() => {
      result.current.setEditor(mockEditor as unknown as Editor)
    })

    expect(result.current.editorRef.current).toBe(mockEditor)
  })

  it('getSnapshot returns null when no editor', () => {
    const { result } = renderHook(() => useTldraw())
    expect(result.current.getSnapshot()).toBeNull()
  })

  it('getSnapshot returns JSON when editor is set', () => {
    const { result } = renderHook(() => useTldraw())
    const mockEditor = createMockEditor()

    act(() => {
      result.current.setEditor(mockEditor as unknown as Editor)
    })

    const snapshot = result.current.getSnapshot()
    expect(snapshot).not.toBeNull()
    expect(JSON.parse(snapshot!)).toEqual({ data: 'snapshot' })
    expect(mockEditor.store.getStoreSnapshot).toHaveBeenCalled()
  })

  it('exportAsSvg returns null when no editor', async () => {
    const { result } = renderHook(() => useTldraw())

    let svg: string | null = null
    await act(async () => {
      svg = await result.current.exportAsSvg()
    })

    expect(svg).toBeNull()
  })

  it('exportAsSvg returns null when no shapes', async () => {
    const { result } = renderHook(() => useTldraw())
    const mockEditor = createMockEditor([]) // empty shapes

    act(() => {
      result.current.setEditor(mockEditor as unknown as Editor)
    })

    let svg: string | null = null
    await act(async () => {
      svg = await result.current.exportAsSvg()
    })

    expect(svg).toBeNull()
  })

  it('exportAsSvg returns SVG string when shapes exist', async () => {
    const { result } = renderHook(() => useTldraw())
    const mockEditor = createMockEditor(['shape-1', 'shape-2'])

    act(() => {
      result.current.setEditor(mockEditor as unknown as Editor)
    })

    let svg: string | null = null
    await act(async () => {
      svg = await result.current.exportAsSvg()
    })

    expect(svg).toBe('<svg></svg>')
    expect(mockEditor.getSvgString).toHaveBeenCalledWith(['shape-1', 'shape-2'])
  })

  it('clear is safe when no editor', () => {
    const { result } = renderHook(() => useTldraw())

    // Should not throw
    act(() => {
      result.current.clear()
    })
  })

  it('clear calls selectAll().deleteShapes()', () => {
    const { result } = renderHook(() => useTldraw())
    const mockEditor = createMockEditor(['shape-1'])

    act(() => {
      result.current.setEditor(mockEditor as unknown as Editor)
    })

    act(() => {
      result.current.clear()
    })

    expect(mockEditor.selectAll).toHaveBeenCalled()
    expect(mockEditor.deleteShapes).toHaveBeenCalled()
  })
})
