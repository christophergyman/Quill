import { clsx } from 'clsx'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
}

export function Input({ label, hint, className, ...props }: InputProps) {
  return (
    <div>
      {label && <label className="block text-xs font-medium text-neutral-600 mb-1">{label}</label>}
      <input
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
