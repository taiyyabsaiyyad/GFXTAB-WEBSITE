import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShieldCheck, CheckCircle2, QrCode, Smartphone, Zap, Award } from 'lucide-react'
import { GlowButton, GhostButton } from '@/components/ui/Button.jsx'
import { notify } from '@/components/ui/Toast.jsx'
import { useAuthStore } from '@/store/index.js'

export default function UpgradeModal() {
  const isOpen = useAuthStore((s) => s.isUpgradeModalOpen)
  const onClose = () => useAuthStore.getState().setUpgradeModalOpen(false)
  const { addCredits, credits, user, setUser } = useAuthStore()

  const [step, setStep] = useState('pricing') // 'pricing' | 'qrcode' | 'success'
  const [selectedPlan, setSelectedPlan] = useState(null) // { id, name, price, reward }
  const [timeRemaining, setTimeRemaining] = useState(180) // 3 minutes countdown

  const plans = [
    { id: 'lite', name: 'Lite Plan', price: 50, reward: '50 Credits', description: 'Best for one-off creators. 10 credits deducted per asset download.' },
    { id: 'plus', name: 'Plus Plan (Bonus)', price: 100, reward: '120 Credits', description: 'Most popular. Includes 20 bonus credits for typography and templates.' },
    { id: 'ultimate', name: 'Unlimited Monthly Pass', price: 200, reward: 'Unlimited Downloads', description: 'Professional creator tier. Bypasses all credit deductions for 30 days.' }
  ]

  useEffect(() => {
    if (step !== 'qrcode') return
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [step])

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan)
    setStep('qrcode')
    setTimeRemaining(180)
    notify.info('UPI QR Code Generated', `Scan to subscribe to the ${plan.name}.`)
  }

  const handleSimulateSuccess = () => {
    if (!selectedPlan) return
    
    // Apply credits/plan update in auth store
    if (selectedPlan.id === 'ultimate') {
      // Set plan as unlimited and maximize credits
      setUser({ ...user, plan: 'unlimited' })
      addCredits(9999)
      notify.success('Plan Upgraded!', 'Unlimited downloads active!')
    } else if (selectedPlan.id === 'plus') {
      addCredits(120)
      notify.success('Credits Added!', '120 credits added successfully.')
    } else {
      addCredits(50)
      notify.success('Credits Added!', '50 credits added successfully.')
    }

    setStep('success')
    
    setTimeout(() => {
      onClose()
      // reset
      setStep('pricing')
      setSelectedPlan(null)
    }, 1800)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(2,2,8,0.85)', backdropFilter: 'blur(16px)',
        padding: 'var(--space-4)'
      }}>
        {/* Backdrop close */}
        <div style={{ position: 'absolute', inset: 0 }} onClick={onClose} />

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          style={{
            width: '100%', maxWidth: 520,
            background: '#0d0d1a',
            border: '1px solid rgba(200,255,0,0.15)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--glow-card-hover)',
            overflow: 'hidden', zIndex: 10,
            position: 'relative'
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 16, right: 16,
              background: 'none', border: 'none', color: 'var(--text-dim)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', zIndex: 20
            }}
          >
            <X size={18} />
          </button>

          {/* Pricing Screen */}
          {step === 'pricing' && (
            <div style={{ padding: 'var(--space-6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-4)' }}>
                <ShieldCheck size={20} color="var(--lime)" />
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--lime)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Recharge Credits & Plans</span>
              </div>

              <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 4 }}>Select Credit Package</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-5)' }}>
                Choose a plan to replenish your credits or unlock unlimited downloads.
              </p>

              {/* Plans selector list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 'var(--space-6)' }}>
                {plans.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectPlan(p)}
                    style={{
                      border: '1px solid var(--glass-border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px var(--space-4)',
                      background: 'var(--void-2)',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--lime)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                  >
                    {p.id === 'ultimate' && (
                      <div style={{
                        position: 'absolute', top: 0, right: 0,
                        background: 'var(--lime-ghost)', color: 'var(--lime)',
                        fontSize: 9, fontWeight: 700, padding: '2px 8px',
                        borderBottomLeftRadius: 6, textTransform: 'uppercase'
                      }}>
                        Best Value
                      </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: '72%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</span>
                        <span style={{ fontSize: 10, color: 'var(--lime)', fontWeight: 600, background: 'rgba(200,255,0,0.08)', padding: '2px 6px', borderRadius: 4 }}>
                          {p.reward}
                        </span>
                      </div>
                      <p style={{ fontSize: 10, color: 'var(--text-dim)', lineHeight: 1.4 }}>{p.description}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)' }}>₹{p.price}</span>
                      <span style={{ display: 'block', fontSize: 9, color: 'var(--text-dim)' }}>One-time pay</span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: 10, color: 'var(--text-dim)', textAlign: 'center' }}>
                Currently you have: <strong style={{ color: 'var(--lime)' }}>{credits} credits</strong> remaining.
              </div>
            </div>
          )}

          {/* QRCode QR Code Scan Screen */}
          {step === 'qrcode' && selectedPlan && (
            <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Scan QR via GPay/PhonePe</span>
                <h4 style={{ fontSize: 'var(--text-xl)', margin: '4px 0 2px', color: 'var(--lime)' }}>₹{selectedPlan.price}.00</h4>
                <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>Payee VPA: <strong>tabsyed@okicici</strong></span>
              </div>

              {/* QR Container */}
              <div style={{
                width: 200, height: 200,
                background: '#ffffff',
                borderRadius: 'var(--radius-md)',
                margin: '0 auto var(--space-4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                padding: 16
              }}>
                <QrCode size={168} color="#000" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 'var(--space-5)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', fontSize: 'var(--text-xs)', color: 'var(--lime)' }}>
                  <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--lime)' }} />
                  Waiting for verification... ({formatTime(timeRemaining)})
                </div>
                <p style={{ fontSize: 10, color: 'var(--text-dim)' }}>Scan this code using BHIM, Paytm, PhonePe, or Google Pay.</p>
              </div>

              {/* Simulation buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <GlowButton onClick={handleSimulateSuccess} style={{ width: '100%', justifyContent: 'center' }}>
                  Simulate Payment Success
                </GlowButton>
                <GhostButton size="sm" onClick={() => setStep('pricing')} style={{ width: '100%', justifyContent: 'center' }}>
                  Choose Different Plan
                </GhostButton>
              </div>
            </div>
          )}

          {/* Success Screen */}
          {step === 'success' && selectedPlan && (
            <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'rgba(0,255,136,0.15)',
                  border: '2px solid var(--green)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto var(--space-5)',
                  boxShadow: '0 0 20px rgba(0,255,136,0.3)'
                }}
              >
                <CheckCircle2 size={36} color="var(--green)" />
              </motion.div>
              <h3 style={{ color: 'var(--green)', marginBottom: 4 }}>Payment Verified!</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                Successfully activated: <strong>{selectedPlan.reward}</strong>
              </p>
            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  )
}
