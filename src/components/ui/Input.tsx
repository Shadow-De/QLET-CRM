'use client'

import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-on-surface-variant">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            'w-full px-4 py-2.5 rounded-lg text-sm text-on-surface',
            'bg-surface-container border border-outline-variant',
            'placeholder:text-outline transition-colors duration-200',
            'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30',
            error ? 'border-error/50 focus:border-error focus:ring-error/30' : 'hover:border-outline',
            className,
          ].join(' ')}
          {...props}
        />
        {error && <p className="text-xs text-error">{error}</p>}
        {hint && !error && <p className="text-xs text-on-surface-variant">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
