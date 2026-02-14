import { clsx } from 'clsx'

interface StatusIndicatorProps {
  state: string
}

export function StatusIndicator({ state }: StatusIndicatorProps) {
  if (state === 'idle') return null

  return (
    <div className="flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-md px-3 py-1.5">
      <div
        className={clsx('h-2.5 w-2.5 rounded-full', {
          'bg-red-500 animate-pulse': state === 'recording',
          'bg-yellow-500 animate-pulse': state === 'processing',
          'bg-green-500': state === 'complete',
          'bg-red-400': state === 'error'
        })}
      />
      <span className="text-white/80 text-xs font-medium capitalize">{state}</span>
    </div>
  )
}
