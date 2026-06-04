import { useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import AppShell from '@/components/layout/AppShell.jsx'
import Splash from '@/pages/Splash.jsx'
import Auth from '@/pages/Auth.jsx'
import Dashboard from '@/pages/Dashboard.jsx'
import Upload from '@/pages/Upload.jsx'
import Editor from '@/pages/Editor.jsx'
import Preview from '@/pages/Preview.jsx'
import Projects from '@/pages/Projects.jsx'
import BrandKit from '@/pages/BrandKit.jsx'
import Settings from '@/pages/Settings.jsx'
import { useUIStore, useAuthStore } from '@/store/index.js'
import MockupDetail from '@/pages/MockupDetail.jsx'
import CreatorDashboard from '@/pages/CreatorDashboard.jsx'
import AdminPanel from '@/pages/AdminPanel.jsx'
import Library from '@/pages/Library.jsx'
import Collections from '@/pages/Collections.jsx'
import Contact from '@/pages/Contact.jsx'
import AIStudio from '@/pages/AIStudio.jsx'
import NotFound from '@/pages/NotFound.jsx'
import Analytics from '@/pages/Analytics.jsx'


// Auth guard
function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? children : <Navigate to="/auth" replace />
}

// Layout wrapper for authenticated pages
function AuthenticatedLayout({ children }) {
  return (
    <AppShell>
      {children}
    </AppShell>
  )
}

export default function App() {
  const splashDone = useUIStore((s) => s.splashDone)

  useEffect(() => {
    useAuthStore.getState().syncSession()
  }, [])

  return (
    <HashRouter>
      <div style={{ position: 'relative', width: '100%', minHeight: '100vh', overflowX: 'hidden' }}>
        <Routes>
          {/* Splash */}
          <Route
            path="/"
            element={splashDone ? <Navigate to="/dashboard" replace /> : <div style={{ background: '#020208', minHeight: '100vh' }} />}
          />

          {/* Auth */}
          <Route path="/auth" element={<Auth />} />

        {/* Authenticated app routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <AuthenticatedLayout><Dashboard /></AuthenticatedLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <PrivateRoute>
              <AuthenticatedLayout><Upload /></AuthenticatedLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/editor"
          element={
            <PrivateRoute>
              <AuthenticatedLayout><Editor /></AuthenticatedLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/preview"
          element={
            <PrivateRoute>
              <AuthenticatedLayout><Preview /></AuthenticatedLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <PrivateRoute>
              <AuthenticatedLayout><Projects /></AuthenticatedLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/brandkit"
          element={
            <PrivateRoute>
              <AuthenticatedLayout><BrandKit /></AuthenticatedLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <AuthenticatedLayout><Settings /></AuthenticatedLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/mockup/:id"
          element={
            <PrivateRoute>
              <AuthenticatedLayout><MockupDetail /></AuthenticatedLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/creator"
          element={
            <PrivateRoute>
              <AuthenticatedLayout><CreatorDashboard /></AuthenticatedLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/library"
          element={
            <PrivateRoute>
              <AuthenticatedLayout><Library /></AuthenticatedLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/collections"
          element={
            <PrivateRoute>
              <AuthenticatedLayout><Collections /></AuthenticatedLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/contact"
          element={
            <PrivateRoute>
              <AuthenticatedLayout><Contact /></AuthenticatedLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/marketplace"
          element={
            <PrivateRoute>
              <AuthenticatedLayout><Dashboard /></AuthenticatedLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AuthenticatedLayout><AdminPanel /></AuthenticatedLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/ai-studio"
          element={
            <PrivateRoute>
              <AuthenticatedLayout><AIStudio /></AuthenticatedLayout>
            </PrivateRoute>
          }
        />


        <Route
          path="/analytics"
          element={
            <PrivateRoute>
              <AuthenticatedLayout><Analytics /></AuthenticatedLayout>
            </PrivateRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <AnimatePresence>
        {!splashDone && <Splash key="splash" />}
      </AnimatePresence>
      </div>
    </HashRouter>
  )
}
