import { motion } from 'framer-motion'
import FloatWrapper from '@/components/animations/FloatWrapper.jsx'
import { clsx } from 'clsx'

/* ---- GlassCard ---- */
export function GlassCard({ children, className = '', onClick, hoverable = true, style = {}, padding = 'var(--space-6)' }) {
  const props = hoverable ? {
    whileHover: { y: -6, boxShadow: 'var(--glow-card-hover)' },
    transition: { type: 'spring', stiffness: 300, damping: 20 },
  } : {}

  return (
    <motion.div
      className={clsx('glass', className)}
      onClick={onClick}
      style={{ padding, cursor: onClick ? 'pointer' : 'default', ...style }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/* ---- FloatingCard ---- */
export function FloatingCard({ children, className = '', floatDelay = 0, floatAmplitude = 8, style = {} }) {
  return (
    <FloatWrapper delay={floatDelay} amplitude={floatAmplitude} className={className} style={style}>
      <div className="glass" style={{ padding: 'var(--space-5)' }}>
        {children}
      </div>
    </FloatWrapper>
  )
}

/* ---- ProductCard ---- */
export function ProductCard({ product, image, selected, onClick, badge }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 18 }}
      style={{
        position: 'relative',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        cursor: 'pointer',
        border: `1px solid ${selected ? 'var(--lime)' : 'rgba(200,255,0,0.1)'}`,
        boxShadow: selected ? 'var(--glow-lime)' : 'var(--glow-card)',
        background: 'var(--glass)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Product image */}
      <div style={{ aspectRatio: '4/3', overflow: 'hidden', background: 'var(--void-2)' }}>
        {image ? (
          <img
            src={image}
            alt={product?.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s var(--spring)' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '3rem',
            background: 'radial-gradient(circle at center, rgba(200,255,0,0.05), transparent)',
          }}>
            {product?.icon || '📦'}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: 'var(--space-4)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: 4 }}>
          {product?.name}
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)' }}>
          {product?.description}
        </div>
      </div>

      {/* Selected indicator */}
      {selected && (
        <div style={{
          position: 'absolute', top: 10, right: 10,
          background: 'var(--lime)', color: '#020208',
          borderRadius: 'var(--radius-full)',
          width: 24, height: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700,
        }}>
          ✓
        </div>
      )}

      {/* Badge */}
      {badge && (
        <div style={{
          position: 'absolute', top: 10, left: 10,
          background: 'var(--violet)',
          color: '#fff',
          borderRadius: 'var(--radius-full)',
          padding: '2px 10px',
          fontSize: 'var(--text-xs)',
          fontWeight: 600,
        }}>
          {badge}
        </div>
      )}
    </motion.div>
  )
}

/* ---- StatCard ---- */
export function StatCard({ label, value, icon, color = 'var(--lime)', delta }) {
  return (
    <GlassCard hoverable={false} style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', fontWeight: 500, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {label}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 700, color }}>
            {value}
          </div>
          {delta && (
            <div style={{ fontSize: 'var(--text-xs)', color: delta > 0 ? 'var(--green)' : 'var(--red)', marginTop: 4 }}>
              {delta > 0 ? '↑' : '↓'} {Math.abs(delta)}% this week
            </div>
          )}
        </div>
        {icon && (
          <div style={{ fontSize: '1.8rem', opacity: 0.7 }}>{icon}</div>
        )}
      </div>
      {/* Subtle glow blob */}
      <div style={{
        position: 'absolute', bottom: -20, right: -20,
        width: 80, height: 80,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color}22, transparent)`,
        pointerEvents: 'none',
      }} />
    </GlassCard>
  )
}

export default GlassCard
