'use client'

import { ReactNode, useEffect, useRef } from 'react'
import { Button } from './Button'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [open])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const handleClose = () => onClose()
    dialog.addEventListener('close', handleClose)
    return () => dialog.removeEventListener('close', handleClose)
  }, [onClose])

  return (
    <dialog
      ref={dialogRef}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose()
      }}
      className={[
        'w-full m-auto rounded-xl p-0 shadow-purple-glow',
        'glass-card overflow-hidden',
        'backdrop:bg-black/80 backdrop:backdrop-blur-md',
        sizes[size],
      ].join(' ')}
    >
      <div className="flex items-center justify-between p-6 border-b border-outline-variant/30 bg-gradient-to-b from-surface to-transparent">
        <h2 className="text-lg font-display font-medium text-on-surface tracking-tight">{title}</h2>
        <button
          onClick={onClose}
          className="text-outline hover:text-on-surface transition-colors p-1 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          aria-label="Close"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="p-6">{children}</div>
    </dialog>
  )
}
