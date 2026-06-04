import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import StarField from '@/components/animations/StarField.jsx'
import { useUIStore } from '@/store/index.js'

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    }
  }
}

const letterVariants = {
  hidden: { 
    opacity: 0, 
    y: 35,
    scale: 0.75,
    filter: 'blur(10px)',
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 140,
      damping: 14,
    }
  }
}

export default function Splash() {
  const navigate = useNavigate()
  const location = useLocation()
  const setSplashDone = useUIStore((s) => s.setSplashDone)
  const [step, setStep] = useState(0)

  const handleComplete = () => {
    setSplashDone(true)
    if (location.pathname === '/') {
      navigate('/dashboard', { replace: true })
    }
  }

  useEffect(() => {
    const timings = [
      { delay: 100,  next: 1 },  // dot appears
      { delay: 700,  next: 2 },  // ring expands
      { delay: 1200, next: 3 },  // GFXTAB letters stagger in
      { delay: 2000, next: 4 },  // tagline fades in
    ]

    const timers = timings.map(({ delay, next }) =>
      setTimeout(() => setStep(next), delay)
    )

    // Final trigger
    const navTimer = setTimeout(() => {
      handleComplete()
    }, 3000)

    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(navTimer)
    }
  }, [navigate, setSplashDone])

  const handleSkip = () => {
    handleComplete()
  }

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
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
        {step >= 1 && step < 3 && (
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

        {/* Step 2: Expanding rings */}
        {step >= 2 && step < 3 && (
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

        {/* Step 3: GFXTAB text animation */}
        {step >= 3 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
            <motion.div
              layoutId="gfxtab-title"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: 'clamp(48px, 8vw, 88px)',
                letterSpacing: '-0.03em',
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {"GFXTAB".split("").map((letter, i) => (
                <motion.span
                  key={i}
                  variants={letterVariants}
                  className="animated-gradient-text"
                  style={{
                    display: 'inline-block',
                    textShadow: '0 0 60px rgba(200,255,0,0.5)',
                  }}
                >
                  {letter}
                </motion.span>
              ))}
            </motion.div>
          </div>
        )}

        {/* Step 4: Tagline */}
        {step >= 4 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(13px, 1.8vw, 18px)',
              color: 'var(--text-secondary)',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              marginBottom: 'var(--space-12)',
            }}
          >
            Design. Create. Inspire
          </motion.div>
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
        transition={{ delay: 1.2 }}
        style={{
          position: 'absolute', bottom: 'var(--space-4)',
          fontSize: 10, color: 'var(--text-dim)',
          letterSpacing: '0.15em', textTransform: 'uppercase',
          zIndex: 2,
        }}
      >
        GFXTAB AI Studio
      </motion.div>
    </motion.div>
  )
}
