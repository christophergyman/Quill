import { useMemo, useState } from 'react'
import type { SessionWithDiagrams } from '@shared/types/session'
import { copyToClipboard } from '../../lib/clipboard'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '../ui/alert-dialog'

interface SessionDetailProps {
  session: SessionWithDiagrams
  onDelete: (id: string) => void
}

function toBase64(data: ArrayBufferLike): string {
  const bytes = new Uint8Array(data)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

export function SessionDetail({ session, onDelete }: SessionDetailProps) {
  const date = new Date(session.createdAt)
  const durationSec = Math.round(session.durationMs / 1000)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const handleCopy = () => {
    copyToClipboard(session.cleanedText || session.rawText)
  }

  const diagramUrls = useMemo(
    () =>
      session.diagrams.map((d) => {
        if (!d.pngData) return null
        const b64 =
          typeof d.pngData === 'string' ? d.pngData : toBase64(d.pngData as ArrayBufferLike)
        return `data:image/png;base64,${b64}`
      }),
    [session.diagrams]
  )

  return (
    <div className="p-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            {session.title || date.toLocaleString()}
          </h2>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span>{date.toLocaleString()}</span>
            <span>{durationSec}s</span>
            <span>{session.voiceBackend}</span>
            {session.llmEnabled && <span>LLM cleaned</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            Copy
          </Button>
          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete session?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this session and all
                  associated diagrams.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={() => onDelete(session.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Summary */}
      {session.summary && (
        <div className="mb-6">
          <h3 className="text-xs font-medium text-muted-foreground uppercase mb-2">Summary</h3>
          <p className="text-sm text-foreground leading-relaxed">{session.summary}</p>
        </div>
      )}

      {/* Cleaned text */}
      {session.cleanedText && (
        <div className="mb-6">
          <h3 className="text-xs font-medium text-muted-foreground uppercase mb-2">Cleaned</h3>
          <Card className="py-0">
            <CardContent className="p-4">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {session.cleanedText}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Raw text */}
      <div className="mb-6">
        <h3 className="text-xs font-medium text-muted-foreground uppercase mb-2">
          Raw Transcription
        </h3>
        <Card className="bg-muted py-0">
          <CardContent className="p-4">
            <p
              className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {session.rawText}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Diagrams */}
      {session.diagrams.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-muted-foreground uppercase mb-2">Diagrams</h3>
          <div className="grid grid-cols-2 gap-3">
            {session.diagrams.map((diagram, index) => (
              <Card key={diagram.id} className="py-0">
                <CardContent className="p-3 text-xs text-muted-foreground">
                  {diagramUrls[index] ? (
                    <img src={diagramUrls[index]} alt="Diagram" className="w-full rounded" />
                  ) : (
                    <span>Diagram snapshot saved</span>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
