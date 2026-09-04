import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
  id?: string
}

export function Card({ children, className = '', hover = false, glow = false, id }: CardProps) {
  return (
    <div
      id={id}
      className={[
        'surface p-5',
        hover ? 'surface-hover cursor-pointer' : '',
        glow ? 'shadow-purple-glow' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string | number
  delta?: number | null
  suffix?: string
  id?: string
}

export function StatCard({ label, value, delta, suffix, id }: StatCardProps) {
  return (
    <Card id={id}>
      <p className="text-xs font-medium uppercase tracking-widest text-text-muted mb-2">{label}</p>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-text-primary">
          {value}
          {suffix && <span className="text-lg ml-1 text-text-secondary">{suffix}</span>}
        </span>
        {delta != null && (
          <span
            className={[
              'text-sm font-medium mb-0.5',
              delta > 0 ? 'text-status-won' : delta < 0 ? 'text-status-lost' : 'text-text-muted',
            ].join(' ')}
          >
            {delta > 0 ? '↑' : delta < 0 ? '↓' : '→'} {Math.abs(delta)}%
          </span>
        )}
      </div>
    </Card>
  )
}
