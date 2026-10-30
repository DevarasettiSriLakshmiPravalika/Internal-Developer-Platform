import type { ReactNode } from 'react'

type Tone = 'success' | 'warning' | 'danger' | 'neutral' | 'info'

const toneMap: Record<string, Tone> = {
  // Service statuses
  ACTIVE: 'success',
  PENDING: 'warning',
  PROVISIONING: 'warning',
  FAILED: 'danger',
  ARCHIVED: 'neutral',
  // Deployment statuses
  RUNNING: 'success',
  DEPLOYING: 'warning',
  ROLLED_BACK: 'neutral',
  // Pipeline statuses
  SUCCESS: 'success',
  CANCELLED: 'neutral',
  // SonarQube / Trivy
  PASSED: 'success',
  CLEAN: 'success',
  ERROR: 'danger',
}

const toneStyles: Record<Tone, { bg: string; color: string; border: string }> = {
  success: { bg: '#132421', color: '#65d6b4', border: '#2f4e4d' },
  warning: { bg: '#241e10', color: '#f59e0b', border: '#4a3a14' },
  danger:  { bg: '#2a1719', color: '#f87171', border: '#6a3838' },
  neutral: { bg: '#1a1f27', color: '#89939e', border: '#2f3740' },
  info:    { bg: '#111c2e', color: '#60a5fa', border: '#1e3254' },
}

interface StatusBadgeProps {
  status: string
  children?: ReactNode
}

export function StatusBadge({ status, children }: StatusBadgeProps) {
  const tone = toneMap[status?.toUpperCase?.()] ?? 'neutral'
  const { bg, color, border } = toneStyles[tone]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 8px',
        borderRadius: 3,
        border: `1px solid ${border}`,
        background: bg,
        color,
        fontSize: 10,
        fontWeight: 600,
        fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace',
        letterSpacing: '0.06em',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: color,
          flexShrink: 0,
        }}
      />
      {children ?? status}
    </span>
  )
}
