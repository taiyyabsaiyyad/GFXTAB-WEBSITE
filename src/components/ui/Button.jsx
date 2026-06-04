import { motion } from 'framer-motion'
import { clsx } from 'clsx'

const buttonVariants = {
  tap: { scale: 0.95 },
  hover: { scale: 1.02 },
}

/* ---- GlowButton (primary CTA) ---- */
export function GlowButton({ children, onClick, disabled, size = 'md', className = '', icon, id, type = 'button', style = {}, ...props }) {
  const sizes = {
    sm: { padding: '8px 16px', fontSize: 'var(--text-sm)' },
    md: { padding: '12px 24px', fontSize: 'var(--text-base)' },
    lg: { padding: '16px 36px', fontSize: 'var(--text-md)' },
    xl: { padding: '20px 48px', fontSize: 'var(--text-lg)' },
  }

  return (
    <motion.button
      id={id}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx('glow-button', className)}
      whileHover="hover"
      whileTap="tap"
      variants={buttonVariants}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      style={{
        ...sizes[size],
        background: disabled ? 'rgba(200, 255, 0, 0.15)' : 'var(--lime)',
        color: disabled ? 'rgba(255, 255, 255, 0.3)' : '#020208',
        fontFamily: 'var(--font-body)',
        fontWeight: 600,
        borderRadius: 'var(--radius-full)',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : 'var(--glow-lime)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        letterSpacing: '0.01em',
        transition: 'background 0.2s, box-shadow 0.2s, opacity 0.2s',
        opacity: disabled ? 0.5 : 1,
        ...style
      }}
      {...props}
    >
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </motion.button>
  )
}

/* ---- GhostButton (secondary) ---- */
export function GhostButton({ children, onClick, disabled, size = 'md', className = '', icon, id, type = 'button', color = 'lime', style = {}, ...props }) {
  const colorMap = {
    lime: { border: 'rgba(200, 255, 0, 0.35)', text: 'var(--lime)', hover: 'rgba(200, 255, 0, 0.08)' },
    violet: { border: 'rgba(123, 47, 255, 0.3)', text: 'var(--violet)', hover: 'rgba(123, 47, 255, 0.08)' },
    cryo: { border: 'rgba(0, 212, 255, 0.3)', text: 'var(--cryo)', hover: 'rgba(0, 212, 255, 0.08)' },
    white: { border: 'rgba(255, 255, 255, 0.15)', text: 'var(--text-primary)', hover: 'rgba(255, 255, 255, 0.06)' },
  }
  const c = colorMap[color] || colorMap.lime

  const sizes = {
    sm: { padding: '7px 14px', fontSize: 'var(--text-sm)' },
    md: { padding: '11px 22px', fontSize: 'var(--text-base)' },
    lg: { padding: '14px 32px', fontSize: 'var(--text-md)' },
  }

  return (
    <motion.button
      id={id}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx('ghost-button', className)}
      whileHover={{ scale: 1.02, backgroundColor: c.hover }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      style={{
        ...sizes[size],
        background: 'transparent',
        color: c.text,
        fontFamily: 'var(--font-body)',
        fontWeight: 500,
        borderRadius: 'var(--radius-full)',
        border: `1px solid ${c.border}`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        letterSpacing: '0.01em',
        opacity: disabled ? 0.4 : 1,
        transition: 'border-color 0.2s',
        ...style
      }}
      {...props}
    >
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </motion.button>
  )
}

/* ---- IconButton (circle icon button) ---- */
export function IconButton({ children, onClick, size = 40, color = 'lime', active = false, id, tooltip, style = {}, ...props }) {
  const colorMap = {
    lime: { border: active ? 'rgba(200, 255, 0, 0.5)' : 'rgba(200, 255, 0, 0.15)', bg: active ? 'rgba(200, 255, 0, 0.12)' : 'rgba(200, 255, 0, 0.04)' },
    white: { border: active ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.1)', bg: active ? 'rgba(255, 255, 255, 0.1)' : 'transparent' },
    ghost: { border: 'transparent', bg: 'transparent' },
  }
  const c = colorMap[color] || colorMap.white

  return (
    <motion.button
      id={id}
      onClick={onClick}
      title={tooltip}
      whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `1px solid ${c.border}`,
        background: c.bg,
        color: 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'border-color 0.2s, background 0.2s',
        ...style
      }}
      {...props}
    >
      {children}
    </motion.button>
  )
}

/* ---- TextButton ---- */
export function TextButton({ children, onClick, className = '', color = 'lime', style = {}, ...props }) {
  return (
    <motion.button
      onClick={onClick}
      className={className}
      whileHover={{ opacity: 0.7 }}
      whileTap={{ scale: 0.97 }}
      style={{
        background: 'none',
        border: 'none',
        color: color === 'lime' ? 'var(--lime)' : color === 'dim' ? 'var(--text-dim)' : 'var(--text-secondary)',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-sm)',
        fontWeight: 500,
        cursor: 'pointer',
        padding: '4px 8px',
        ...style
      }}
      {...props}
    >
      {children}
    </motion.button>
  )
}

export default GlowButton
