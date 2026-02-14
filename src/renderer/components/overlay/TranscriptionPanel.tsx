interface TranscriptionPanelProps {
  text: string
}

export function TranscriptionPanel({ text }: TranscriptionPanelProps) {
  return (
    <div className="rounded-xl bg-black/60 backdrop-blur-md px-5 py-3.5 shadow-sm">
      <p className="text-white text-sm leading-relaxed" style={{ fontFamily: 'var(--font-mono)' }}>
        {text}
      </p>
    </div>
  )
}
