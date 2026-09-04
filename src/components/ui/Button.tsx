'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const variants: Record<Variant, string> = {
  primary:
    'bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container border border-primary/50 shadow-[0_0_15px_rgba(183,109,255,0.3)] hover:shadow-[0_0_20px_rgba(183,109,255,0.5)]',
  secondary:
    'bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/30 hover:border-secondary/50',
  ghost:
    'bg-transparent hover:bg-surface-variant text-on-surface-variant hover:text-on-surface border border-transparent',
  danger:
    'bg-error/10 hover:bg-error/20 text-error border border-error/30 hover:border-error/50',
}

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className = '', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={[
          'inline-flex items-center justify-center gap-2 font-medium rounded transition-all duration-150',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-500 focus-visible:outline-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className,
        ].join(' ')}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
