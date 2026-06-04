import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import StarField from '@/components/animations/StarField.jsx'
import { useUIStore } from '@/store/index.js'

const PRODUCT_ICONS = ['👕', '📚', '☕', '🗒️', '🪪']

export default function Splash() {
  const navigate = useNavigate()
  const setSplashDone = useUIStore((s) => s.setSplashDone)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timings = [
      { delay: 100,  next: 1 },  // dot appears
      { delay: 700,  next: 2 },  // ring expands
      { delay: 1200, next: 3 },  // MOCKUP + AI text
      { delay: 2000, next: 4 },  // tagline
      { delay: 2600, next: 5 },  // product icons orbit in
      { delay: 3200, next: 6 },  // everything contracts
      { delay: 3800, next: 7 },  // transition wipe
    ]

    const timers = timings.map(({ delay, next }) =>
      setTimeout(() => setStep(next), delay)
    )

    // Final navigate
    const navTimer = setTimeout(() => {
      setSplashDone(true)
      navigate('/dashboard', { replace: true })
    }, 4300)

    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(navTimer)
    }
  }, [navigate, setSplashDone])

  // Skip on click
  const handleSkip = () => {
    setSplashDone(true)
    navigate('/dashboard', { replace: true })
  }

  return (
    <div
      onClick={handleSkip}
      style={{
        position: 'fixed', inset: 0,
        background: '#020208',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column',
        zIndex: 9999,
        cursor: 'pointer',
        overflow: 'hidden',
      }}
    >
      <StarField />

      {/* Center stage */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', userSelect: 'none' }}>

        {/* Step 1: Center dot */}
        <AnimatePresence>
          {step >= 1 && step < 6 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: step === 2 ? [1, 3, 0] : 1, opacity: step === 2 ? [1, 1, 0] : 1 }}
              transition={{ duration: step === 2 ? 0.5 : 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 12, height: 12, borderRadius: '50%',
                background: 'var(--lime)',
                boxShadow: '0 0 40px rgba(200,255,0,0.8)',
              }}
            />
          )}
        </AnimatePresence>

        {/* Step 2: Expanding rings */}
        {step >= 2 && step < 4 && (
          <>
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0.6 }}
                animate={{ scale: 4 + i * 2, opacity: 0 }}
                transition={{ duration: 1.2, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 80, height: 80, borderRadius: '50%',
                  border: '1px solid rgba(200,255,0,0.4)',
                  pointerEvents: 'none',
                }}
              />
            ))}
          </>
        )}

        {/* Step 3: MOCKUP AI Text */}
        {step >= 3 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
            <motion.div
              initial={{ x: -80, opacity: 0 }}
              animate={step >= 6 ? { x: -120, opacity: 0, scale: 0.5 } : { x: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 'clamp(48px, 8vw, 88px)',
                color: 'var(--text-primary)',
                letterSpacing: '-0.04em',
                lineHeight: 1,
              }}
            >
              GFXTAB
            </motion.div>
            <motion.div
              initial={{ x: 80, opacity: 0 }}
              animate={step >= 6 ? { x: 120, opacity: 0, scale: 0.5 } : { x: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 'clamp(48px, 8vw, 88px)',
                color: 'var(--lime)',
                letterSpacing: '-0.04em',
                lineHeight: 1,
                textShadow: '0 0 60px rgba(200,255,0,0.5)',
                marginLeft: '0.2em',
              }}
            >
              AI
            </motion.div>
          </div>
        )}

        {/* Step 4: Tagline */}
        {step >= 4 && step < 6 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(14px, 2vw, 20px)',
              color: 'var(--text-secondary)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: 'var(--space-12)',
            }}
          >
            Create · Mockup · Publish · Sell
          </motion.div>
        )}

        {/* Step 5: Product icons orbit */}
        {step >= 5 && step < 6 && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 0, height: 0 }}>
            {PRODUCT_ICONS.map((icon, i) => {
              const angle = (i / PRODUCT_ICONS.length) * 2 * Math.PI - Math.PI / 2
              const radius = 200
              const x = Math.cos(angle) * radius
              const y = Math.sin(angle) * radius
              return (
                <motion.div
                  key={i}
                  initial={{ x: x * 4, y: y * 4, opacity: 0, scale: 0 }}
                  animate={{ x, y, opacity: 1, scale: 1 }}
                  transition={{
                    type: 'spring', stiffness: 180, damping: 16, delay: i * 0.08
                  }}
                  style={{
                    position: 'absolute',
                    width: 56, height: 56,
                    background: 'rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(200,255,0,0.2)',
                    borderRadius: 16,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.6rem',
                    transform: `translate(-50%, -50%)`,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  }}
                >
                  {icon}
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Step 6: Wipe transition */}
        {step >= 7 && (
          <motion.div
            initial={{ scaleY: 0, originY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed', inset: 0,
              background: '#020208',
              zIndex: 100,
              transformOrigin: 'top',
            }}
          />
        )}
      </div>

      {/* Skip hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        style={{
          position: 'absolute', bottom: 'var(--space-8)',
          fontSize: 'var(--text-xs)',
          color: 'var(--text-dim)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          zIndex: 2,
        }}
      >
        Tap anywhere to skip
      </motion.div>

      {/* GFXTAB credit */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        style={{
          position: 'absolute', bottom: 'var(--space-4)',
          fontSize: 10, color: 'var(--text-dim)',
          letterSpacing: '0.15em', textTransform: 'uppercase',
          zIndex: 2,
        }}
      >
        GFXTAB AI Studio
      </motion.div>
    </div>
  )
}
