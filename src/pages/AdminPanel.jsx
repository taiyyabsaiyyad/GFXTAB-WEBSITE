import { useState } from 'react'
import { Check, X, Shield, ShieldCheck, User, Trash2, Eye, Clipboard } from 'lucide-react'
import { GlassCard } from '@/components/ui/Card.jsx'
import { GlowButton, GhostButton } from '@/components/ui/Button.jsx'
import { notify } from '@/components/ui/Toast.jsx'
import { PRODUCTS } from '@/constants/products.js'

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('moderation') // 'moderation' | 'users'
  const [approvalQueue, setApprovalQueue] = useState([
    { id: 'apparel-custom-1', name: 'Hoodie Flatlay Front', category: 'apparel', creator: 'Jordan Miller', asset: 'Photo from GFXTAB(3).jpg', date: '2026-06-02' },
    { id: 'print-custom-2', name: 'Rollup Showcase Mockup', category: 'print', creator: 'Sarah K.', asset: 'A4-Flyer-Mock-Up 3.jpg', date: '2026-06-01' }
  ])
  const [users, setUsers] = useState([
    { id: 'usr-1', name: 'Alex Rivera', email: 'alex@rivera.design', role: 'user', date: '2026-05-20' },
    { id: 'usr-2', name: 'Jordan Miller', email: 'jordan@miller.graphics', role: 'creator', date: '2026-05-18' },
    { id: 'usr-3', name: 'Sarah K.', email: 'sarah@sk-studios.com', role: 'creator', date: '2026-05-15' }
  ])

  const handleApprove = (id) => {
    setApprovalQueue(prev => prev.filter(item => item.id !== id))
    notify.success('Asset Approved', 'The mockup has been successfully published to the marketplace catalog.')
  }

  const handleReject = (id) => {
    setApprovalQueue(prev => prev.filter(item => item.id !== id))
    notify.error('Asset Rejected', 'The mockup template submission was rejected.')
  }

  const handleToggleRole = (id) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const nextRole = u.role === 'user' ? 'creator' : 'user'
        notify.success('Role Updated', `${u.name} is now a ${nextRole}.`)
        return { ...u, role: nextRole }
      }
      return u
    }))
  }

  const handleDeleteUser = (id) => {
    setUsers(prev => prev.filter(u => u.id !== id))
    notify.success('User Account Removed')
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 'var(--space-12)' }}>
      {/* Admin Panel Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)' }}>Admin Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Review creator submissions, toggle role profiles, and manage system status.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            onClick={() => setActiveTab('moderation')}
            style={{ 
              padding: '8px 16px', borderRadius: 'var(--radius-md)', 
              background: activeTab === 'moderation' ? 'var(--void-3)' : 'transparent',
              border: '1px solid', borderColor: activeTab === 'moderation' ? 'var(--glass-border-hover)' : 'transparent',
              color: activeTab === 'moderation' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: 500
            }}
          >
            Asset Approval Queue ({approvalQueue.length})
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            style={{ 
              padding: '8px 16px', borderRadius: 'var(--radius-md)', 
              background: activeTab === 'users' ? 'var(--void-3)' : 'transparent',
              border: '1px solid', borderColor: activeTab === 'users' ? 'var(--glass-border-hover)' : 'transparent',
              color: activeTab === 'users' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: 500
            }}
          >
            User Roles
          </button>
        </div>
      </div>

      {/* Moderation Approval Queue */}
      {activeTab === 'moderation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {approvalQueue.length === 0 ? (
            <GlassCard style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-dim)', fontSize: 'var(--text-sm)' }}>No items currently awaiting approval.</p>
            </GlassCard>
          ) : (
            approvalQueue.map((item) => (
              <GlassCard key={item.id} style={{ padding: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
                <div style={{ width: 100, height: 100, borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--void-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={`${import.meta.env.BASE_URL}assets/${item.asset}`} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
                
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--cryo)', fontWeight: 600, textTransform: 'uppercase' }}>{item.category}</span>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginTop: 2 }}>{item.name}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>Submitted by: <strong>{item.creator}</strong> on {item.date}</p>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <GhostButton onClick={() => handleReject(item.id)} style={{ padding: '8px 12px', color: 'var(--red)' }}>
                    <X size={16} /> Reject
                  </GhostButton>
                  <GlowButton onClick={() => handleApprove(item.id)} style={{ padding: '8px 16px' }}>
                    <Check size={16} /> Approve Publish
                  </GlowButton>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      )}

      {/* User Accounts Management */}
      {activeTab === 'users' && (
        <GlassCard style={{ padding: 'var(--space-6)' }}>
          <h2 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-4)' }}>Platform Accounts</h2>
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>
                  <th style={{ padding: '12px 8px', color: 'var(--text-dim)', fontWeight: 500 }}>Name</th>
                  <th style={{ padding: '12px 8px', color: 'var(--text-dim)', fontWeight: 500 }}>Email</th>
                  <th style={{ padding: '12px 8px', color: 'var(--text-dim)', fontWeight: 500 }}>Role</th>
                  <th style={{ padding: '12px 8px', color: 'var(--text-dim)', fontWeight: 500 }}>Created Date</th>
                  <th style={{ padding: '12px 8px', color: 'var(--text-dim)', fontWeight: 500, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '16px 8px', color: 'var(--text-primary)', fontWeight: 600 }}>{user.name}</td>
                    <td style={{ padding: '16px 8px', color: 'var(--text-secondary)' }}>{user.email}</td>
                    <td style={{ padding: '16px 8px' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700,
                        background: user.role === 'creator' ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.04)',
                        color: user.role === 'creator' ? 'var(--lime)' : 'var(--text-secondary)',
                        border: '1px solid', borderColor: user.role === 'creator' ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.08)'
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '16px 8px', color: 'var(--text-secondary)' }}>{user.date}</td>
                    <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 12 }}>
                        <button 
                          onClick={() => handleToggleRole(user.id)} 
                          title="Toggle Creator Role"
                          style={{ color: 'var(--text-secondary)', border: 'none', background: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
                        >
                          <ShieldCheck size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)} 
                          title="Delete Account"
                          style={{ color: 'var(--text-secondary)', border: 'none', background: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  )
}
