import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bell, Search, ChevronRight } from 'lucide-react'
import { useUIStore, useAuthStore } from '@/store/index.js'
import { GlowButton } from '@/components/ui/Button.jsx'

const PAGE_META = {
  '/dashboard':   { title: 'Marketplace',  crumb: ['Home', 'Marketplace'] },
  '/marketplace': { title: 'Marketplace',  crumb: ['Home', 'Marketplace'] },
  '/upload':      { title: 'AI Generator', crumb: ['Home', 'AI Workbench'] },
  '/editor':      { title: 'Mockup Editor', crumb: ['Home', 'AI Workbench', 'Editor'] },
  '/projects':    { title: 'My Projects',  crumb: ['Home', 'AI Workbench', 'Projects'] },
  '/library':     { title: 'My Library',   crumb: ['Home', 'Design Vault'] },
  '/collections': { title: 'Collections',  crumb: ['Home', 'Saved'] },
  '/brandkit':    { title: 'Brand Kit',    crumb: ['Home', 'AI Workbench', 'Brand'] },
  '/settings':    { title: 'Settings',     crumb: ['Home', 'Settings'] },
  '/preview':     { title: 'Preview',      crumb: ['Home', 'AI Workbench', 'Preview'] },
}

export default function TopBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { sidebarExpanded } = useUIStore()
  const { user, credits } = useAuthStore()

  const meta = PAGE_META[location.pathname] || { title: 'GFXTAB AI Studio', crumb: ['Home'] }

  return (
    <motion.header
      className="topbar"
      animate={{ left: sidebarExpanded ? 'var(--sidebar-expanded)' : 'var(--sidebar-w)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--space-6)',
      }}
    >
      {/* Left: breadcrumb + title */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          {meta.crumb.map((crumb, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)' }}>{crumb}</span>
              {i < meta.crumb.length - 1 && <ChevronRight size={10} color="var(--text-dim)" />}
            </span>
          ))}
        </div>
        <h1 style={{ fontSize: 'var(--text-lg)', fontFamily: 'var(--font-display)', fontWeight: 600, lineHeight: 1 }}>
          {meta.title}
        </h1>
      </div>

      {/* Right: actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        {/* Credits pill */}
        <div 
          onClick={() => useAuthStore.getState().setUpgradeModalOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 14px',
            background: 'rgba(200,255,0,0.08)',
            border: '1px solid rgba(200,255,0,0.15)',
            borderRadius: 'var(--radius-full)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--lime)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(200,255,0,0.15)'}
        >
          <span style={{ fontSize: 11, color: 'var(--lime)', fontWeight: 700 }}>⚡</span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--lime)', fontWeight: 600 }}>
            {user?.plan === 'unlimited' ? 'Unlimited Pass' : `${credits} credits`}
          </span>
        </div>

        {/* Notifications */}
        <motion.button
          id="topbar-notifications"
          whileHover={{ scale: 1.08, backgroundColor: 'rgba(255,255,255,0.06)' }}
          whileTap={{ scale: 0.92 }}
          style={{
            width: 38, height: 38,
            borderRadius: '50%',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', position: 'relative',
          }}
        >
          <Bell size={16} color="var(--text-secondary)" />
          {/* Notification dot */}
          <div style={{
            position: 'absolute', top: 8, right: 8,
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--lime)',
            boxShadow: 'var(--glow-lime)',
          }} />
        </motion.button>

        {/* Create CTA */}
        {location.pathname !== '/upload' && (
          <GlowButton
            id="topbar-create-cta"
            size="sm"
            onClick={() => navigate('/upload')}
          >
            + New Mockup
          </GlowButton>
        )}

        {/* Avatar */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/settings')}
          style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--lime), var(--violet))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            fontSize: 'var(--text-sm)', fontWeight: 700, color: '#020208',
            flexShrink: 0,
            border: '2px solid rgba(200,255,0,0.2)',
          }}
        >
          {user?.name ? user.name.charAt(0).toUpperCase() : 'G'}
        </motion.div>
      </div>
    </motion.header>
  )
}
