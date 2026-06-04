import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { IconButton } from './Button.jsx'

export default function Modal({ isOpen, onClose, title, children, size = 'md', id }) {
  const sizes = {
    sm: 440,
    md: 600,
    lg: 800,
    xl: 1000,
    full: '95vw',
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(2,2,8,0.8)',
              backdropFilter: 'blur(8px)',
              zIndex: 1000,
            }}
          />
          {/* Modal overlay layout container to center the dialog safely */}
          <div style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
            pointerEvents: 'none',
            padding: 'var(--space-4)'
          }}>
            {/* Modal */}
            <motion.div
              id={id}
              role="dialog"
              aria-modal="true"
              aria-label={title}
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              style={{
                width: typeof sizes[size] === 'number' ? `${sizes[size]}px` : sizes[size],
                maxWidth: '100%',
                maxHeight: '90vh',
                background: 'rgba(8,8,18,0.95)',
                backdropFilter: 'blur(32px)',
                border: '1px solid rgba(200,255,0,0.12)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 60px rgba(200,255,0,0.06)',
                pointerEvents: 'auto',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Header */}
              {title && (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: 'var(--space-6)',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  flexShrink: 0,
                }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', margin: 0 }}>{title}</h3>
                  <IconButton onClick={onClose} size={32} color="white" tooltip="Close">
                    <X size={16} />
                  </IconButton>
                </div>
              )}
              {/* Content */}
              <div style={{ overflowY: 'auto', flex: 1, padding: 'var(--space-6)' }}>
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
