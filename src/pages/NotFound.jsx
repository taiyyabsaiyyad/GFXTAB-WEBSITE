import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Home } from 'lucide-react'
import StarField from '@/components/animations/StarField.jsx'
import { GlowButton } from '@/components/ui/Button.jsx'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      padding: 'var(--space-6)',
      textAlign: 'center'
    }}>
      <StarField />
      
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 520,
          background: 'rgba(13, 13, 26, 0.6)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(200, 255, 0, 0.15)',
          padding: 'var(--space-10) var(--space-8)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--glow-card-hover)'
        }}
      >
        <div style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'rgba(200, 255, 0, 0.08)',
          border: '2px solid var(--lime)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--space-6)',
          boxShadow: '0 0 30px rgba(200, 255, 0, 0.25)'
        }}>
          <AlertCircle size={36} color="var(--lime)" />
        </div>

        <h1 style={{
          fontSize: 'clamp(54px, 8vw, 84px)',
          fontWeight: 900,
          fontFamily: 'var(--font-display)',
          lineHeight: 1,
          marginBottom: 'var(--space-2)',
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em'
        }}>
          404
        </h1>

        <h2 style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 600,
          marginBottom: 'var(--space-4)',
          color: 'var(--lime)',
          letterSpacing: '0.05em',
          textTransform: 'uppercase'
        }}>
          Page Not Found
        </h2>

        <p style={{
          color: 'var(--text-secondary)',
          fontSize: 'var(--text-sm)',
          lineHeight: 1.6,
          marginBottom: 'var(--space-8)',
          maxWidth: 380,
          margin: '0 auto var(--space-8)'
        }}>
          The creative coordinates you entered do not exist, or this design section is still being compiled by our AI.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <GlowButton
            onClick={() => navigate('/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 24px' }}
          >
            <Home size={16} /> Return to Dashboard
          </GlowButton>
        </div>
      </motion.div>
    </div>
  )
}
