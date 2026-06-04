import { clsx } from 'clsx'

const colorMap = {
  lime:    { bg: 'rgba(200,255,0,0.12)',  text: 'var(--lime)',  border: 'rgba(200,255,0,0.25)' },
  violet:  { bg: 'rgba(123,47,255,0.12)', text: 'var(--violet)', border: 'rgba(123,47,255,0.3)' },
  cryo:    { bg: 'rgba(0,212,255,0.12)',  text: 'var(--cryo)',  border: 'rgba(0,212,255,0.25)' },
  red:     { bg: 'rgba(255,68,68,0.12)',  text: 'var(--red)',   border: 'rgba(255,68,68,0.25)' },
  orange:  { bg: 'rgba(255,140,0,0.12)',  text: 'var(--orange)', border: 'rgba(255,140,0,0.25)' },
  green:   { bg: 'rgba(0,255,136,0.12)', text: 'var(--green)',  border: 'rgba(0,255,136,0.25)' },
  dim:     { bg: 'rgba(255,255,255,0.06)', text: 'var(--text-secondary)', border: 'rgba(255,255,255,0.1)' },
}

export function StatusBadge({ children, status = 'dim', dot = false, className = '' }) {
  const statusColorMap = {
    success:    'green',
    error:      'red',
    warning:    'orange',
    processing: 'violet',
    info:       'cryo',
    active:     'lime',
    inactive:   'dim',
  }
  const color = colorMap[statusColorMap[status] || status] || colorMap.dim

  return (
    <span
      className={clsx('status-badge', className)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 10px',
        borderRadius: 'var(--radius-full)',
        fontSize: 'var(--text-xs)',
        fontWeight: 600,
        letterSpacing: '0.04em',
        background: color.bg,
        color: color.text,
        border: `1px solid ${color.border}`,
      }}
    >
      {dot && (
        <span style={{
          width: 5, height: 5,
          borderRadius: '50%',
          background: color.text,
          flexShrink: 0,
          animation: status === 'processing' ? 'pulse-glow 1.5s ease-in-out infinite' : 'none',
        }} />
      )}
      {children}
    </span>
  )
}

export function CategoryBadge({ children, icon, className = '' }) {
  return (
    <span
      className={clsx('category-badge', className)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '4px 12px',
        borderRadius: 'var(--radius-full)',
        fontSize: 'var(--text-xs)',
        fontWeight: 500,
        background: 'var(--glass)',
        color: 'var(--text-secondary)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {icon && <span>{icon}</span>}
      {children}
    </span>
  )
}

export function PillBadge({ children, color = 'lime', size = 'sm' }) {
  const c = colorMap[color] || colorMap.lime
  const sizes = { sm: '3px 8px', md: '5px 12px' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: sizes[size],
      borderRadius: 'var(--radius-full)',
      fontSize: 'var(--text-xs)',
      fontWeight: 700,
      background: c.bg,
      color: c.text,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    }}>
      {children}
    </span>
  )
}

export default StatusBadge
