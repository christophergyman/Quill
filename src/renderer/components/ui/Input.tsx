import { clsx } from 'clsx'
import { useId, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
}

export function Input({ label, hint, className, id, ...props }: InputProps) {
  const generatedId = useId()
  const inputId = id || generatedId

  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-neutral-600 mb-1">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={clsx(
          'w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 bg-white',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500',
          'placeholder:text-neutral-400',
          className
        )}
        {...props}
      />
      {hint && <p className="mt-1 text-xs text-neutral-400">{hint}</p>}
    </div>
  )
}
