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
        'glass-card p-6 rounded-lg relative overflow-hidden',
        hover ? 'group-hover:border-primary group-hover:shadow-[0_0_20px_rgba(183,109,255,0.1)] cursor-pointer' : '',
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
    <Card id={id} className="group">
      <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500"></div>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <h3 className="text-sm font-medium text-on-surface-variant uppercase tracking-wider">{label}</h3>
        <span className="material-symbols-outlined text-outline-variant text-xl">monitoring</span>
      </div>
      <div className="flex items-end gap-3 relative z-10">
        <span className="text-4xl font-display font-bold text-on-surface neon-text-primary">
          {value}
          {suffix && <span className="text-2xl ml-1 text-on-surface-variant">{suffix}</span>}
        </span>
        {delta != null && (
          <div className={[
            'flex items-center text-xs font-bold px-2 py-1 rounded bg-surface-container mb-1',
            delta > 0 ? 'text-green-400 border border-green-500/20' : delta < 0 ? 'text-error border border-error/20' : 'text-on-surface-variant border border-outline-variant/30'
          ].join(' ')}>
            <span className="material-symbols-outlined text-[14px] mr-1">
              {delta > 0 ? 'trending_up' : delta < 0 ? 'trending_down' : 'trending_flat'}
            </span>
            {delta > 0 ? '+' : ''}{delta}%
          </div>
        )}
      </div>
    </Card>
  )
}
