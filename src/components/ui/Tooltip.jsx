import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Tooltip({ children, content, placement = 'top', delay = 300 }) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef(null)

  const show = () => {
    timerRef.current = setTimeout(() => setVisible(true), delay)
  }
  const hide = () => {
    clearTimeout(timerRef.current)
    setVisible(false)
  }

  const placementStyles = {
    top:    { bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' },
    bottom: { top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' },
    left:   { right: 'calc(100% + 8px)', top: '50%', transform: 'translateY(-50%)' },
    right:  { left: 'calc(100% + 8px)', top: '50%', transform: 'translateY(-50%)' },
  }

  const motionProps = {
    top:    { initial: { opacity: 0, y: 4, scale: 0.96 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 4, scale: 0.96 } },
    bottom: { initial: { opacity: 0, y: -4, scale: 0.96 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: -4, scale: 0.96 } },
    left:   { initial: { opacity: 0, x: 4, scale: 0.96 }, animate: { opacity: 1, x: 0, scale: 1 }, exit: { opacity: 0, x: 4, scale: 0.96 } },
    right:  { initial: { opacity: 0, x: -4, scale: 0.96 }, animate: { opacity: 1, x: 0, scale: 1 }, exit: { opacity: 0, x: -4, scale: 0.96 } },
  }

  return (
    <div
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      <AnimatePresence>
        {visible && content && (
          <motion.div
            {...motionProps[placement]}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute',
              ...placementStyles[placement],
              background: 'rgba(8,8,18,0.95)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(200,255,0,0.12)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 12px',
              fontSize: 'var(--text-xs)',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 9999,
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
