import { clsx } from 'clsx'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md'
}

export function Button({ variant = 'secondary', size = 'md', className, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30',
        {
          'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
          'bg-neutral-100 text-neutral-700 hover:bg-neutral-200': variant === 'secondary',
          'bg-red-50 text-red-600 hover:bg-red-100': variant === 'danger',
          'text-xs px-3 py-1.5': size === 'sm',
          'text-sm px-4 py-2': size === 'md'
        },
        className
      )}
      {...props}
    />
  )
}
