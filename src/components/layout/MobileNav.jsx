import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, Upload, FolderOpen, Palette, Settings } from 'lucide-react'

const TABS = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { path: '/upload',    icon: Upload,          label: 'Create' },
  { path: '/projects',  icon: FolderOpen,      label: 'Projects' },
  { path: '/brandkit',  icon: Palette,         label: 'Brand' },
  { path: '/settings',  icon: Settings,        label: 'More' },
]

export default function MobileNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        height: 72,
        background: 'rgba(2,2,8,0.92)',
        backdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(200,255,0,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 200,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {TABS.map(({ path, icon: Icon, label }) => {
        const active = location.pathname === path
        return (
          <motion.button
            key={path}
            onClick={() => navigate(path)}
            whileTap={{ scale: 0.85 }}
            style={{
              flex: 1, height: '100%',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 4, background: 'none', border: 'none', cursor: 'pointer',
              color: active ? 'var(--lime)' : 'var(--text-dim)',
              minHeight: 44, /* WCAG touch target */
            }}
          >
            <div style={{ position: 'relative' }}>
              <Icon size={20} />
              {active && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  style={{
                    position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)',
                    width: 4, height: 4, borderRadius: '50%',
                    background: 'var(--lime)',
                    boxShadow: 'var(--glow-lime)',
                  }}
                />
              )}
            </div>
            <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, letterSpacing: '0.04em' }}>
              {label}
            </span>
          </motion.button>
        )
      })}
    </nav>
  )
}
