import { clsx } from 'clsx'
import type { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
}

export function Select({ label, options, className, ...props }: SelectProps) {
  return (
    <div>
      {label && <label className="block text-xs font-medium text-neutral-600 mb-1">{label}</label>}
      <select
        className={clsx(
          'w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 bg-white',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
