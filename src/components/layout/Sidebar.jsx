import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Sparkles, FolderOpen, Library, Heart, Palette,
  Settings, ChevronRight, Zap, Menu, X, Users, MessageSquare, Brain, BarChart2
} from 'lucide-react'
import { useUIStore, useAuthStore } from '@/store/index.js'
import Tooltip from '@/components/ui/Tooltip.jsx'

const NAV_ITEMS = [
  { path: '/dashboard',   icon: LayoutDashboard, label: 'Marketplace' },
  { path: '/upload',      icon: Sparkles,        label: 'AI Generator' },
  { path: '/ai-studio',   icon: Brain,           label: 'AI Studio', badge: 'NEW' },
  { path: '/projects',    icon: FolderOpen,      label: 'My Projects' },
  { path: '/library',     icon: Library,         label: 'My Library' },
  { path: '/collections', icon: Heart,           label: 'Collections' },
  { path: '/brandkit',    icon: Palette,         label: 'Brand Kit' },
  { path: '/creator',     icon: Users,           label: 'Creator Panel' },
  { path: '/analytics',   icon: BarChart2,       label: 'Analytics', badge: 'ADMIN' },
  { path: '/contact',     icon: MessageSquare,   label: 'Contact Us' },
  { path: '/settings',    icon: Settings,        label: 'Settings' },
]


export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { sidebarExpanded, toggleSidebar } = useUIStore()
  const { user, credits } = useAuthStore()

  return (
    <motion.aside
      className={`app-sidebar ${sidebarExpanded ? 'expanded' : ''}`}
      animate={{ width: sidebarExpanded ? 'var(--sidebar-expanded)' : 'var(--sidebar-w)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      style={{
        background: 'rgba(2,2,8,0.9)',
        backdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(200,255,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: sidebarExpanded ? 'stretch' : 'center',
        padding: 'var(--space-4) 0',
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div style={{
        padding: sidebarExpanded ? '0 var(--space-4) var(--space-6)' : '0 0 var(--space-6)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        justifyContent: sidebarExpanded ? 'space-between' : 'center',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36,
            borderRadius: '50%',
            overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: 'var(--glow-lime)',
            border: '1px solid rgba(200, 255, 0, 0.2)',
            background: 'var(--void-3)'
          }}>
            <img src={`${import.meta.env.BASE_URL}gfxtab.png`} alt="GFXTAB Mascot" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 2 }} />

          </div>
          <AnimatePresence>
            {sidebarExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="animated-gradient-text" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>
                  GFXTAB
                </div>
                <div style={{ fontSize: 10, color: 'var(--lime)', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  Studio
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {sidebarExpanded && (
          <motion.button
            onClick={toggleSidebar}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
              background: 'none', border: 'none',
              color: 'var(--text-dim)', cursor: 'pointer',
              display: 'flex', alignItems: 'center',
            }}
          >
            <X size={16} />
          </motion.button>
        )}
      </div>

      {/* Collapse toggle (when collapsed) */}
      {!sidebarExpanded && (
        <Tooltip content="Expand sidebar" placement="right">
          <motion.button
            onClick={toggleSidebar}
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(200,255,0,0.08)' }}
            whileTap={{ scale: 0.9 }}
            style={{
              background: 'none', border: 'none',
              color: 'var(--text-dim)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 36, height: 36, borderRadius: 10,
              marginBottom: 'var(--space-2)',
            }}
          >
            <Menu size={16} />
          </motion.button>
        </Tooltip>
      )}

      {/* Nav Items */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, padding: '0 8px' }}>
        {NAV_ITEMS.map(({ path, icon: Icon, label, badge }) => {
          const active = location.pathname === path || location.pathname.startsWith(path + '/')
          return (
            <Tooltip key={path} content={sidebarExpanded ? null : label} placement="right">
              <motion.button
                onClick={() => navigate(path)}
                whileHover={{ backgroundColor: 'rgba(200,255,0,0.06)' }}
                whileTap={{ scale: 0.96 }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: sidebarExpanded ? '10px 14px' : '10px',
                  borderRadius: 'var(--radius-md)',
                  background: active ? 'rgba(200,255,0,0.08)' : 'transparent',
                  border: `1px solid ${active ? 'rgba(200,255,0,0.18)' : 'transparent'}`,
                  cursor: 'pointer',
                  justifyContent: sidebarExpanded ? 'flex-start' : 'center',
                  color: active ? 'var(--lime)' : 'var(--text-secondary)',
                  transition: 'color 0.2s',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Active glow line */}
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    style={{
                      position: 'absolute', left: 0, top: '20%', bottom: '20%',
                      width: 2, borderRadius: 2,
                      background: 'var(--lime)',
                      boxShadow: 'var(--glow-lime)',
                    }}
                  />
                )}
                <Icon size={18} style={{ flexShrink: 0 }} />
                <AnimatePresence>
                  {sidebarExpanded && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.18 }}
                      style={{ fontWeight: active ? 600 : 400, fontSize: 'var(--text-sm)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      {label}
                      {badge && <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 4, background: 'rgba(200,255,0,0.15)', color: 'var(--lime)', border: '1px solid rgba(200,255,0,0.25)', letterSpacing: '0.08em' }}>{badge}</span>}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </Tooltip>
          )
        })}
      </nav>

      {/* Credits / Bottom */}
      <div style={{ padding: '8px 8px 0', flexShrink: 0 }}>
        {sidebarExpanded ? (
          <div 
            onClick={() => useAuthStore.getState().setUpgradeModalOpen(true)}
            style={{
              padding: 'var(--space-3) var(--space-4)',
              background: 'rgba(200,255,0,0.05)',
              border: '1px solid rgba(200,255,0,0.1)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--lime)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(200,255,0,0.1)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', fontWeight: 500 }}>AI CREDITS</span>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--lime)', fontWeight: 700 }}>
                {user?.plan === 'unlimited' ? 'Unlimited' : credits}
              </span>
            </div>
            <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: user?.plan === 'unlimited' ? '100%' : `${Math.min(100, (credits / 100) * 100)}%` }}
                style={{ height: '100%', background: 'var(--lime)', borderRadius: 2 }}
              />
            </div>
          </div>
        ) : (
          <Tooltip content={user?.plan === 'unlimited' ? 'Unlimited Downloads' : `${credits} credits`} placement="right">
            <div 
              onClick={() => useAuthStore.getState().setUpgradeModalOpen(true)}
              style={{
                width: 36, height: 36,
                borderRadius: 10,
                background: 'rgba(200,255,0,0.08)',
                border: '1px solid rgba(200,255,0,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--lime)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(200,255,0,0.15)'}
            >
              <span style={{ fontSize: 12, color: 'var(--lime)', fontWeight: 700 }}>
                {user?.plan === 'unlimited' ? '∞' : credits}
              </span>
            </div>
          </Tooltip>
        )}
      </div>
    </motion.aside>
  )
}
