import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShieldCheck, CheckCircle2, QrCode, Smartphone } from 'lucide-react'
import { GlowButton, GhostButton } from '@/components/ui/Button.jsx'
import { notify } from '@/components/ui/Toast.jsx'

export default function PaymentModal({ isOpen, onClose, assetName, price, onPaymentSuccess }) {
  const [step, setStep] = useState('checkout') // 'checkout' | 'waiting' | 'success'
  const [timeRemaining, setTimeRemaining] = useState(180) // 3 minutes countdown
  
  // Read VPA securely from environment variables, never hardcode in client components
  const paymentVpa = import.meta.env.VITE_PAYMENT_VPA || 'payment@gfxtab.com'

  useEffect(() => {
    if (step !== 'waiting') return
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

  const handleStartPayment = () => {
    setStep('waiting')
    notify.info('UPI QR Generated', 'Scan to complete payment via UPI app.')
  }

  const handleSimulateSuccess = () => {
    setStep('success')
    notify.success('Payment Received!', `Successfully purchased ${assetName}.`)
    setTimeout(() => {
      onPaymentSuccess?.()
      onClose()
      // reset
      setStep('checkout')
      setTimeRemaining(180)
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
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(2,2,8,0.85)', backdropFilter: 'blur(16px)',
        padding: 'var(--space-4)'
      }}>
        {/* Backdrop close area */}
        <div style={{ position: 'absolute', inset: 0 }} onClick={onClose} />

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          style={{
            width: '100%', maxWidth: 440,
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
              cursor: 'pointer', display: 'flex', alignItems: 'center'
            }}
          >
            <X size={18} />
          </button>

          {/* Checkout Screen */}
          {step === 'checkout' && (
            <div style={{ padding: 'var(--space-6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-4)' }}>
                <ShieldCheck size={20} color="var(--lime)" />
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--lime)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Secure UPI Sandbox</span>
              </div>
              
              <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 8 }}>Purchase Premium Asset</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-5)' }}>
                You are purchasing access to: <strong style={{ color: 'var(--text-primary)' }}>{assetName}</strong>
              </p>

              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)',
                marginBottom: 'var(--space-6)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Amount Due</span>
                <span style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--lime)' }}>₹{price}.00</span>
              </div>

              <GlowButton onClick={handleStartPayment} style={{ width: '100%', justifyContent: 'center' }}>
                Pay Securely via UPI
              </GlowButton>
            </div>
          )}

          {/* Scanning / QR Screen */}
          {step === 'waiting' && (
            <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
              <div style={{ marginBottom: 'var(--space-5)' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Scan QR to Pay</span>
                <h4 style={{ fontSize: 'var(--text-md)', margin: '4px 0 2px' }}>₹{price}.00</h4>
                <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>UPI Payee: {paymentVpa.replace(/./g, (c, i) => i > 2 && i < paymentVpa.indexOf('@') ? '*' : c)}</span>
              </div>

              {/* QR Code Container */}
              <div style={{
                width: 200, height: 200,
                background: '#ffffff',
                borderRadius: 'var(--radius-md)',
                margin: '0 auto var(--space-5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                padding: 16
              }}>
                <QrCode size={168} color="#000" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 'var(--space-6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', fontSize: 'var(--text-xs)', color: 'var(--lime)' }}>
                  <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--lime)' }} />
                  Waiting for verification... ({formatTime(timeRemaining)})
                </div>
                <p style={{ fontSize: 10, color: 'var(--text-dim)' }}>Open your UPI App (GPay, BHIM, Paytm, PhonePe) and scan the QR.</p>
              </div>

              {/* Simulation triggers */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <GlowButton onClick={handleSimulateSuccess} style={{ width: '100%', justifyContent: 'center' }}>
                  Simulate UPI Payment Success
                </GlowButton>
                <GhostButton size="sm" onClick={() => setStep('checkout')} style={{ width: '100%', justifyContent: 'center' }}>
                  Cancel
                </GhostButton>
              </div>
            </div>
          )}

          {/* Success Screen */}
          {step === 'success' && (
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
              <h3 style={{ color: 'var(--green)', marginBottom: 4 }}>Payment Successful!</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Unlocking download and preparing design files...</p>
            </div>
          )}

        </motion.div>

        <style>{`
          .pulse-dot {
            animation: pulse-blink 1.5s infinite;
          }
          @keyframes pulse-blink {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
          }
        `}</style>
      </div>
    </AnimatePresence>
  )
}
