import { Toaster, toast } from 'react-hot-toast'
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'
import { motion } from 'framer-motion'

const iconMap = {
  success: <CheckCircle size={18} color="var(--green)" />,
  error:   <AlertCircle size={18} color="var(--red)" />,
  info:    <Info size={18} color="var(--cryo)" />,
  warning: <AlertTriangle size={18} color="var(--orange)" />,
}

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      gutter={12}
      toastOptions={{ duration: 4000 }}
      containerStyle={{ top: 80, right: 20 }}
    />
  )
}

// Custom toast renderer
function CustomToast({ t, type, title, message, action }) {
  const icon = iconMap[type] || iconMap.info
  const borderColor = {
    success: 'rgba(0,255,136,0.2)',
    error:   'rgba(255,68,68,0.2)',
    info:    'rgba(0,212,255,0.2)',
    warning: 'rgba(255,140,0,0.2)',
  }[type] || 'rgba(200,255,0,0.12)'

  return (
    <motion.div
      initial={{ opacity: 0, x: 60, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '14px 16px',
        background: 'rgba(8,8,18,0.96)',
        backdropFilter: 'blur(24px)',
        border: `1px solid ${borderColor}`,
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        maxWidth: 360,
        width: '100%',
      }}
    >
      <div style={{ flexShrink: 0, marginTop: 1 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && (
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: 2 }}>
            {title}
          </div>
        )}
        {message && (
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {message}
          </div>
        )}
        {action && (
          <button
            onClick={action.onClick}
            style={{
              marginTop: 8, background: 'none', border: 'none', color: 'var(--lime)',
              fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer', padding: 0,
            }}
          >
            {action.label} →
          </button>
        )}
      </div>
      <button
        onClick={() => toast.dismiss(t.id)}
        style={{
          flexShrink: 0, background: 'none', border: 'none',
          color: 'var(--text-dim)', cursor: 'pointer', padding: 2, marginTop: -2,
        }}
      >
        <X size={14} />
      </button>
    </motion.div>
  )
}

// Convenience functions
export const notify = {
  success: (title, message, action) => toast.custom((t) => (
    <CustomToast t={t} type="success" title={title} message={message} action={action} />
  )),
  error: (title, message, action) => toast.custom((t) => (
    <CustomToast t={t} type="error" title={title} message={message} action={action} />
  )),
  info: (title, message, action) => toast.custom((t) => (
    <CustomToast t={t} type="info" title={title} message={message} action={action} />
  )),
  warning: (title, message, action) => toast.custom((t) => (
    <CustomToast t={t} type="warning" title={title} message={message} action={action} />
  )),
}

export default ToastProvider
