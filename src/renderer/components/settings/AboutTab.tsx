import { Separator } from '../ui/separator'

export function AboutTab() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-4">About</h2>

      <div className="space-y-3">
        <div>
          <span className="text-sm text-muted-foreground">Quill</span>
          <span className="ml-2 text-xs text-muted-foreground">v{__APP_VERSION__}</span>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          Voice dictation + whiteboard overlay for macOS. Record, transcribe, sketch, and save — all
          from a transparent overlay on your screen.
        </p>

        <Separator />

        <p className="text-xs text-muted-foreground">
          Built with Electron, React, tldraw, and Whisper.
        </p>
      </div>
    </div>
  )
}
