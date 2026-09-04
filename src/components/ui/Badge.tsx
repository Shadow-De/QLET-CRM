type Status = 'New' | 'Contacted' | 'Viewing' | 'Negotiating' | 'Won' | 'Lost'

interface BadgeProps {
  status: Status
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, size = 'sm' }: BadgeProps) {
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1'
  return (
    <span className={`inline-flex items-center rounded-full font-medium status-${status} ${sizeClass}`}>
      {status}
    </span>
  )
}
