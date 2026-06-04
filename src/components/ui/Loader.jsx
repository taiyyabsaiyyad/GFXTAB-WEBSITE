// Loader components
import { motion } from 'framer-motion'

/* ---- OrbitLoader — 3 dots orbiting a center ---- */
export function OrbitLoader({ size = 48, color = 'var(--lime)', label = 'Loading...' }) {
  return (
    <div
      role="status"
      aria-label={label}
      style={{ width: size, height: size, position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.4 - i * 0.15, repeat: Infinity, ease: 'linear', delay: i * 0.12 }}
          style={{
            position: 'absolute',
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          }}
        >
          <div style={{
            width: size * 0.14 + i * 1.5,
            height: size * 0.14 + i * 1.5,
            borderRadius: '50%',
            background: color,
            opacity: 1 - i * 0.25,
            marginTop: i * 3,
          }} />
        </motion.div>
      ))}
    </div>
  )
}

/* ---- PulseLoader — pulsing dot ---- */
export function PulseLoader({ size = 12, color = 'var(--violet)' }) {
  return (
    <motion.div
      animate={{ scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        width: size, height: size,
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 12px ${color}`,
      }}
    />
  )
}

/* ---- SpinnerLoader — thin ring ---- */
export function SpinnerLoader({ size = 24, color = 'var(--lime)', thickness = 2 }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
      style={{
        width: size, height: size,
        borderRadius: '50%',
        border: `${thickness}px solid rgba(200,255,0,0.15)`,
        borderTopColor: color,
        flexShrink: 0,
      }}
    />
  )
}

/* ---- Skeleton shimmer ---- */
export function Skeleton({ width = '100%', height = 20, borderRadius = 'var(--radius-sm)', style = {} }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius, ...style }}
      aria-hidden="true"
    />
  )
}

export default OrbitLoader
