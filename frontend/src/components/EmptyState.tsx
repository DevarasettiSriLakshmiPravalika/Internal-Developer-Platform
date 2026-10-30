import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  detail: string
  action?: ReactNode
}

export function EmptyState({ icon, title, detail, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <span className="empty-icon">{icon}</span>
      <h3>{title}</h3>
      <p>{detail}</p>
      {action}
    </div>
  )
}
