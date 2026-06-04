import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, MessageSquare, Send, CheckCircle } from 'lucide-react'
import { GlassCard } from '@/components/ui/Card.jsx'
import { GlowButton } from '@/components/ui/Button.jsx'
import { FloatLabelInput } from '@/components/ui/Input.jsx'
import { notify } from '@/components/ui/Toast.jsx'

export default function Contact() {
  const location = useLocation()
  const preSelectedSubject = location.state?.subject || ''

  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: preSelectedSubject || 'Custom Brief / Design Inquiry',
    brief: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [successId, setSuccessId] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.brief) {
      notify.error('Missing details', 'Please fill in name, email, and inquiry description.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('http://localhost:4000/inquiries/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: 'contact-form',
          assetName: form.subject,
          name: form.name,
          email: form.email,
          requirements: form.brief
        })
      })

      const data = await res.json()
      if (data.success) {
        setSuccessId(data.confirmationId)
        notify.success('Message Sent!', 'Your request has been received by GFXTAB system.')
        setForm({ name: '', email: '', subject: 'Custom Brief / Design Inquiry', brief: '' })
      } else {
        throw new Error(data.message || 'Failed to submit inquiry')
      }
    } catch (err) {
      console.error(err)
      notify.error('Submission Failed', err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 22 }}
      style={{ maxWidth: 720, margin: '0 auto', paddingBottom: 'var(--space-12)' }}
    >
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 6 }}>
          Contact <span className="gradient-lime">Us</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', maxWidth: 440, margin: '0 auto' }}>
          Submit your design requirements or project brief. The GFXTAB team will analyze and respond within 24 hours.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {successId ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{ textAlign: 'center', padding: 'var(--space-4)' }}
          >
            <GlassCard style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: 'rgba(0,255,136,0.15)', border: '2px solid var(--green)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 20px rgba(0,255,136,0.2)'
              }}>
                <CheckCircle size={28} color="var(--green)" />
              </div>
              <h3 style={{ fontSize: 'var(--text-xl)', color: 'var(--green)' }}>Inquiry Received</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', maxWidth: 420 }}>
                Your brief has been forwarded directly to GFXTAB support operations. Your ticket ID is:
              </p>
              <div style={{
                padding: '12px 24px', background: 'var(--void-2)',
                borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)',
                fontFamily: 'var(--font-mono)', fontSize: 'var(--text-md)', color: 'var(--lime)',
                fontWeight: 700
              }}>
                {successId}
              </div>
              <GlowButton onClick={() => setSuccessId('')} style={{ marginTop: 'var(--space-4)' }}>
                Send Another Brief
              </GlowButton>
            </GlassCard>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GlassCard style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <FloatLabelInput
                  id="contact-name"
                  label="Your Name"
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                />
                <FloatLabelInput
                  id="contact-email"
                  label="Your Email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>

              <FloatLabelInput
                id="contact-subject"
                label="Subject"
                value={form.subject}
                onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}
              />

              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-dim)', marginBottom: 6 }}>
                  Project Brief & Detailed Requirements
                </label>
                <textarea
                  placeholder="Describe your design specifications, formats required, brand constraints, etc..."
                  value={form.brief}
                  onChange={(e) => setForm(f => ({ ...f, brief: e.target.value }))}
                  rows={6}
                  style={{
                    width: '100%', padding: '14px var(--space-4)', borderRadius: 'var(--radius-md)',
                    background: 'var(--void-2)', border: '1px solid var(--glass-border)',
                    color: '#ffffff', fontSize: 'var(--text-sm)', resize: 'vertical',
                    lineHeight: 1.6
                  }}
                />
              </div>

              <GlowButton type="submit" disabled={submitting} style={{ justifyContent: 'center', marginTop: 'var(--space-2)' }}>
                <Send size={14} style={{ marginRight: 8 }} /> {submitting ? 'Submitting brief...' : 'Send Inquiry Brief'}
              </GlowButton>
            </GlassCard>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
