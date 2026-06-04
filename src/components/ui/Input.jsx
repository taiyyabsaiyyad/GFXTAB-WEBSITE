import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'
import { clsx } from 'clsx'

/* ---- FloatLabelInput ---- */
export function FloatLabelInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder = ' ',
  error,
  autoComplete,
  disabled,
  className = '',
  ...props
}) {
  const [focused, setFocused] = useState(false)
  const hasValue = value && value.length > 0
  const floated = focused || hasValue

  return (
    <div className={clsx('float-input-wrap', className)} style={{ position: 'relative' }}>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          padding: '22px 16px 10px',
          background: 'var(--glass)',
          border: `1px solid ${error ? 'var(--red)' : focused ? 'rgba(200,255,0,0.35)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)',
          backdropFilter: 'blur(12px)',
          transition: 'border-color 0.2s var(--spring)',
          boxShadow: focused ? '0 0 0 3px rgba(200,255,0,0.06)' : 'none',
          outline: 'none',
          cursor: disabled ? 'not-allowed' : 'text',
          opacity: disabled ? 0.5 : 1,
        }}
        {...props}
      />
      <motion.label
        htmlFor={id}
        animate={{ y: floated ? -8 : 4, scale: floated ? 0.8 : 1, originX: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        style={{
          position: 'absolute',
          left: 16,
          top: 14,
          color: error ? 'var(--red)' : focused ? 'var(--lime)' : 'var(--text-dim)',
          fontSize: 'var(--text-base)',
          fontWeight: 500,
          pointerEvents: 'none',
          transformOrigin: 'left center',
          transition: 'color 0.2s',
        }}
      >
        {label}
      </motion.label>
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            style={{ color: 'var(--red)', fontSize: 'var(--text-xs)', marginTop: 4, paddingLeft: 16 }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---- SearchInput ---- */
export function SearchInput({ value, onChange, placeholder = 'Search...', id }) {
  const [focused, setFocused] = useState(false)

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <Search
        size={16}
        style={{
          position: 'absolute', left: 14,
          color: focused ? 'var(--lime)' : 'var(--text-dim)',
          transition: 'color 0.2s',
          pointerEvents: 'none',
        }}
      />
      <input
        id={id}
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          padding: '10px 16px 10px 40px',
          background: 'var(--glass)',
          border: `1px solid ${focused ? 'rgba(200,255,0,0.3)' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: 'var(--radius-full)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          backdropFilter: 'blur(12px)',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          boxShadow: focused ? '0 0 0 3px rgba(200,255,0,0.06)' : 'none',
          outline: 'none',
        }}
      />
    </div>
  )
}

/* ---- Textarea ---- */
export function FloatLabelTextarea({ id, label, value, onChange, rows = 4, error, className = '' }) {
  const [focused, setFocused] = useState(false)
  const hasValue = value && value.length > 0
  const floated = focused || hasValue

  return (
    <div className={className} style={{ position: 'relative' }}>
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        rows={rows}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          padding: '22px 16px 10px',
          background: 'var(--glass)',
          border: `1px solid ${error ? 'var(--red)' : focused ? 'rgba(200,255,0,0.35)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)',
          backdropFilter: 'blur(12px)',
          transition: 'border-color 0.2s',
          outline: 'none',
          resize: 'vertical',
          lineHeight: 1.6,
        }}
      />
      <motion.label
        htmlFor={id}
        animate={{ y: floated ? -8 : 4, scale: floated ? 0.8 : 1, originX: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        style={{
          position: 'absolute', left: 16, top: 14,
          color: focused ? 'var(--lime)' : 'var(--text-dim)',
          fontSize: 'var(--text-base)', fontWeight: 500,
          pointerEvents: 'none', transformOrigin: 'left center',
        }}
      >
        {label}
      </motion.label>
    </div>
  )
}

export default FloatLabelInput
