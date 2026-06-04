import StarField from '@/components/animations/StarField.jsx'
import Sidebar from './Sidebar.jsx'
import TopBar from './TopBar.jsx'
import MobileNav from './MobileNav.jsx'
import ToastProvider from '@/components/ui/Toast.jsx'
import UpgradeModal from '@/components/payment/UpgradeModal.jsx'
import { useLocation } from 'react-router-dom'

export default function AppShell({ children }) {
  const location = useLocation()
  const isStudio = location.pathname === '/ai-studio'

  return (
    <>
      {/* Global background */}
      <StarField />

      {/* Toast notifications */}
      <ToastProvider />

      {/* App layout */}
      <div className="app-layout">
        {/* Sidebar (desktop) */}
        <div style={{ display: 'none' }} className="sidebar-desktop">
          <Sidebar />
        </div>
        <Sidebar />

        {/* Main content */}
        <main className="app-main" style={{ position: 'relative', zIndex: 1 }}>
          <TopBar />
          <div style={{ padding: isStudio ? '0' : 'var(--space-6)' }}>
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <div style={{ display: 'none' }} id="mobile-nav-container">
        <MobileNav />
      </div>
      <MobileNav />

      {/* Global Upgrade/Recharge Modal */}
      <UpgradeModal />

      <style>{`
        @media (min-width: 769px) {
          #mobile-nav-container, .app-main + nav { display: none !important; }
        }
        @media (max-width: 768px) {
          .hide-on-mobile { display: none !important; }
          .app-sidebar { display: none !important; }
        }
      `}</style>
    </>
  )
}
