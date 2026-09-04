'use client'

import { SelectHTMLAttributes, forwardRef } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={[
            'w-full px-3 py-2 rounded text-sm text-text-primary',
            'bg-base-bg border border-base-border',
            'transition-colors duration-150 cursor-pointer',
            'focus:outline-none focus:border-purple focus:ring-1 focus:ring-purple/30',
            error ? 'border-red-500/50' : '',
            className,
          ].join(' ')}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-base-surface">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'
