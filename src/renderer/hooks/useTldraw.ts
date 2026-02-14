import { useCallback, useRef } from 'react'
import type { Editor } from 'tldraw'

export function useTldraw() {
  const editorRef = useRef<Editor | null>(null)

  const setEditor = useCallback((editor: Editor) => {
    editorRef.current = editor
  }, [])

  const getSnapshot = useCallback((): string | null => {
    if (!editorRef.current) return null
    const snapshot = editorRef.current.store.getStoreSnapshot()
    return JSON.stringify(snapshot)
  }, [])

  const exportAsSvg = useCallback(async (): Promise<string | null> => {
    const editor = editorRef.current
    if (!editor) return null

    const shapeIds = editor.getCurrentPageShapeIds()
    if (shapeIds.size === 0) return null

    const result = await editor.getSvgString([...shapeIds])
    return result?.svg || null
  }, [])

  const clear = useCallback(() => {
    const editor = editorRef.current
    if (!editor) return
    editor.selectAll().deleteShapes(editor.getSelectedShapeIds())
  }, [])

  return {
    editorRef,
    setEditor,
    getSnapshot,
    exportAsSvg,
    clear
  }
}
