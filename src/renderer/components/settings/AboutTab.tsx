export function AboutTab() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-neutral-900 mb-4">About</h2>

      <div className="space-y-3">
        <div>
          <span className="text-sm text-neutral-600">Quill</span>
          <span className="ml-2 text-xs text-neutral-400">v{__APP_VERSION__}</span>
        </div>

        <p className="text-sm text-neutral-500 leading-relaxed">
          Voice dictation + whiteboard overlay for macOS. Record, transcribe, sketch, and save — all
          from a transparent overlay on your screen.
        </p>

        <div className="pt-3 border-t border-neutral-200">
          <p className="text-xs text-neutral-400">
            Built with Electron, React, tldraw, and Whisper.
          </p>
        </div>
      </div>
    </div>
  )
}
