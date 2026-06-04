import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, CreditCard, Bell, Shield, Zap, ChevronRight, LogOut } from 'lucide-react'
import { GlassCard } from '@/components/ui/Card.jsx'
import { GlowButton, GhostButton } from '@/components/ui/Button.jsx'
import { FloatLabelInput } from '@/components/ui/Input.jsx'
import { StatusBadge, PillBadge } from '@/components/ui/Badge.jsx'
import { useAuthStore } from '@/store/index.js'
import { useNavigate } from 'react-router-dom'
import { notify } from '@/components/ui/Toast.jsx'

const PLAN_FEATURES = {
  free:  { name: 'Free', color: 'var(--text-secondary)', credits: 50, exports: 10 },
  pro:   { name: 'Pro',  color: 'var(--lime)',           credits: 500, exports: 'Unlimited' },
  team:  { name: 'Team', color: 'var(--violet)',         credits: 2000, exports: 'Unlimited' },
}

export default function Settings() {
  const navigate = useNavigate()
  const { user, logout, credits, setUser } = useAuthStore()
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', company: user?.company || '', website: user?.website || '' })
  const [notifications, setNotifications] = useState({ email: true, push: false, marketing: true })
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
  const plan = PLAN_FEATURES[user?.plan || 'pro']

  const handleSave = () => {
    setUser({ ...user, ...form })
    notify.success('Profile updated!', 'Your changes have been saved.')
  }

  const handleLogout = () => {
    logout()
    navigate('/auth')
    notify.info('Signed out', 'See you next time!')
  }

  const sections = [
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'billing', icon: CreditCard, label: 'Billing & Plan' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'security', icon: Shield, label: 'Security' },
  ]

  const [activeSection, setActiveSection] = useState('profile')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 22 }}
      style={{ maxWidth: 900 }}
    >
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-8)' }}>
        Settings
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 'var(--space-6)', alignItems: 'flex-start' }}>
        {/* Nav */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {sections.map(({ id, icon: Icon, label }) => (
            <motion.button
              key={id}
              onClick={() => setActiveSection(id)}
              whileHover={{ x: 4 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: activeSection === id ? 'rgba(200,255,0,0.08)' : 'transparent',
                border: `1px solid ${activeSection === id ? 'rgba(200,255,0,0.18)' : 'transparent'}`,
                color: activeSection === id ? 'var(--lime)' : 'var(--text-secondary)',
                cursor: 'pointer', fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)', fontWeight: activeSection === id ? 600 : 400,
              }}
            >
              <Icon size={16} />
              {label}
            </motion.button>
          ))}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '8px 0' }} />
          <motion.button
            onClick={handleLogout}
            whileHover={{ x: 4 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              color: 'var(--red)', cursor: 'pointer',
              background: 'transparent', border: 'none',
              fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 500,
            }}
          >
            <LogOut size={16} />
            Sign Out
          </motion.button>
        </div>

        {/* Content */}
        <div>
          {activeSection === 'profile' && (
            <GlassCard hoverable={false}>
              <h3 style={{ marginBottom: 'var(--space-6)' }}>Profile Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {/* Avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--lime), var(--violet))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 'var(--text-xl)', fontWeight: 700, color: '#020208',
                    border: '2px solid rgba(200,255,0,0.3)',
                  }}>
                    {form.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-lg)' }}>{form.name}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)' }}>GFXTAB Productions</div>
                    <PillBadge color="lime" size="sm">{plan.name} Plan</PillBadge>
                  </div>
                </div>
                <FloatLabelInput id="settings-name" label="Full Name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
                <FloatLabelInput id="settings-email" label="Email" type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} />
                <FloatLabelInput id="settings-company" label="Company" value={form.company} onChange={(e) => setForm(f => ({ ...f, company: e.target.value }))} />
                <FloatLabelInput id="settings-website" label="Website" value={form.website} onChange={(e) => setForm(f => ({ ...f, website: e.target.value }))} />
                <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                  <GlowButton id="settings-save-btn" onClick={handleSave}>Save Changes</GlowButton>
                </div>
              </div>
            </GlassCard>
          )}

          {activeSection === 'billing' && (
            <GlassCard hoverable={false}>
              <h3 style={{ marginBottom: 'var(--space-6)' }}>Billing & Plan</h3>

              {/* Current plan */}
              <div style={{
                padding: 'var(--space-5)',
                background: 'rgba(200,255,0,0.05)',
                border: '1px solid rgba(200,255,0,0.15)',
                borderRadius: 'var(--radius-lg)',
                marginBottom: 'var(--space-6)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <Zap size={16} color="var(--lime)" />
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-lg)' }}>{plan.name} Plan</span>
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)' }}>Billed monthly · visa ending in 4242</div>
                  </div>
                  <StatusBadge status="active" dot>Active</StatusBadge>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)' }}>AI Credits</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-xl)', color: 'var(--lime)' }}>{credits}/{plan.credits}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)' }}>Exports</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-xl)', color: 'var(--cryo)' }}>{plan.exports}</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <GlowButton onClick={() => useAuthStore.getState().setUpgradeModalOpen(true)}>
                  Upgrade Plan
                </GlowButton>
                <GhostButton onClick={() => notify.info('Billing portal', 'Connecting to payment portal...')}>
                  Billing History
                </GhostButton>
              </div>
            </GlassCard>
          )}

          {activeSection === 'notifications' && (
            <GlassCard hoverable={false}>
              <h3 style={{ marginBottom: 'var(--space-6)' }}>Notification Preferences</h3>
              {[
                { key: 'email', label: 'Email Notifications', desc: 'Export complete, AI analysis done' },
                { key: 'push', label: 'Push Notifications', desc: 'Browser notifications for key events' },
                { key: 'marketing', label: 'Product Updates', desc: 'New features and mockup templates' },
              ].map(({ key, label, desc }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4) 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 'var(--text-sm)', marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)' }}>{desc}</div>
                  </div>
                  <motion.button
                    onClick={() => setNotifications(n => ({ ...n, [key]: !n[key] }))}
                    style={{
                      width: 44, height: 24, borderRadius: 12,
                      background: notifications[key] ? 'var(--lime)' : 'rgba(255,255,255,0.1)',
                      position: 'relative', border: 'none', cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                  >
                    <motion.div
                      animate={{ x: notifications[key] ? 22 : 2 }}
                      style={{ width: 18, height: 18, borderRadius: 9, background: notifications[key] ? '#020208' : '#888', position: 'absolute', top: 3 }}
                    />
                  </motion.button>
                </div>
              ))}
            </GlassCard>
          )}

          {activeSection === 'security' && (
            <GlassCard hoverable={false}>
              <h3 style={{ marginBottom: 'var(--space-6)' }}>Security</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <FloatLabelInput id="settings-current-pw" label="Current Password" type="password" value={passwords.current} onChange={(e) => setPasswords(p => ({ ...p, current: e.target.value }))} />
                <FloatLabelInput id="settings-new-pw" label="New Password" type="password" value={passwords.new} onChange={(e) => setPasswords(p => ({ ...p, new: e.target.value }))} />
                <FloatLabelInput id="settings-confirm-pw" label="Confirm Password" type="password" value={passwords.confirm} onChange={(e) => setPasswords(p => ({ ...p, confirm: e.target.value }))} />
                <GlowButton style={{ alignSelf: 'flex-start' }} onClick={() => { notify.success('Password updated!'); setPasswords({ current: '', new: '', confirm: '' }) }}>
                  Update Password
                </GlowButton>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </motion.div>
  )
}
