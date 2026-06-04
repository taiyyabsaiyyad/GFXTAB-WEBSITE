import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Eye, EyeOff, ArrowRight } from 'lucide-react'
import StarField from '@/components/animations/StarField.jsx'
import { FloatLabelInput } from '@/components/ui/Input.jsx'
import { GlowButton, GhostButton } from '@/components/ui/Button.jsx'
import { useAuthStore } from '@/store/index.js'
import { notify } from '@/components/ui/Toast.jsx'
import FloatWrapper from '@/components/animations/FloatWrapper.jsx'
import { supabase, isSupabaseConfigured } from '@/supabase.js'
import mascotLogo from '@/assets/gfxtab.png'
import { trackEvent } from '@/utils/tracker.js'

export default function Auth() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)

  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (mode === 'register' && !form.name) errs.name = 'Name is required'
    if (!form.email.includes('@')) errs.email = 'Enter a valid email'
    if (form.password.length < 6) errs.password = 'Password must be 6+ characters'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)

    if (isSupabaseConfigured) {
      try {
        if (mode === 'login') {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: form.email,
            password: form.password,
          })
          if (error) throw error
          
          const userObj = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || '',
            phone: data.user.user_metadata?.phone || '',
            avatar: data.user.user_metadata?.avatar_url,
            plan: 'pro'
          }
          login(userObj)
          trackEvent('auth_login', { email: userObj.email })
          notify.success('Welcome back to GFXTAB AI Studio!', 'Your workspace is ready.')
          navigate('/dashboard')
        } else {
          const { data, error } = await supabase.auth.signUp({
            email: form.email,
            password: form.password,
            options: {
              data: {
                full_name: form.name
              }
            }
          })
          if (error) throw error
          trackEvent('auth_signup', { email: form.email, name: form.name })
          notify.success('Sign up complete!', 'Please check your email to verify your account.')
          setMode('login')
        }
      } catch (error) {
        notify.error('Authentication Failed', error.message)
      } finally {
        setLoading(false)
      }
    } else {
      // Local fallback for demo
      await new Promise(r => setTimeout(r, 800))
      const mockUser = {
        id: 'demo-user-id',
        name: form.name || '',
        email: form.email,
        phone: '',
        avatar: null,
        plan: 'pro',
      }
      login(mockUser)
      trackEvent('auth_login', { email: mockUser.email, mode: 'demo' })
      notify.success('Welcome to GFXTAB AI Studio (Demo Mode)', 'Live connection settings are active.')
      setLoading(false)
      navigate('/dashboard')
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/dashboard`,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent'
            },
            scopes: 'email profile'
          }
        })
        if (error) throw error
      } catch (error) {
        notify.error('OAuth Error', error.message)
        setLoading(false)
      }
    } else {
      await new Promise(r => setTimeout(r, 600))
      const mockGoogleUser = { id: 'demo-google-user', name: '', email: 'creator@gfxtab.com', phone: '', plan: 'pro' }
      login(mockGoogleUser)
      trackEvent('auth_login', { email: mockGoogleUser.email, mode: 'demo_google' })
      notify.success('Logged in with Google (Demo Mode)', 'Workspace loaded.')
      setLoading(false)
      navigate('/dashboard')
    }
  }

  const update = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      padding: 'var(--space-6)',
    }}>
      <StarField />

      {/* Auth card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 440 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <div style={{
            width: 64, height: 64,
            borderRadius: '50%',
            overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto var(--space-4)',
            boxShadow: 'var(--glow-lime-strong)',
            border: '2px solid rgba(200, 255, 0, 0.4)',
            background: 'var(--void-3)'
          }}>
            <img src={mascotLogo} alt="GFXTAB Mascot" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} />
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 6 }}>
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: 'var(--text-sm)' }}>
            {mode === 'login' ? 'Sign in to your creative workspace' : 'Start generating stunning mockups'}
          </p>
        </div>

        {/* Glass card */}
        <div
          className="glass"
          style={{ padding: 'var(--space-8)' }}
        >
          {/* Google Sign In */}
          <GhostButton
            id="auth-google-btn"
            color="white"
            size="md"
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginBottom: 'var(--space-6)' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </GhostButton>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            marginBottom: 'var(--space-6)',
          }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <AnimatePresence mode="wait">
                {mode === 'register' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <FloatLabelInput
                      id="auth-name"
                      label="Full Name"
                      value={form.name}
                      onChange={update('name')}
                      error={errors.name}
                      autoComplete="name"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <FloatLabelInput
                id="auth-email"
                label="Email"
                type="email"
                value={form.email}
                onChange={update('email')}
                error={errors.email}
                autoComplete="email"
              />

              <div style={{ position: 'relative' }}>
                <FloatLabelInput
                  id="auth-password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={update('password')}
                  error={errors.password}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  style={{
                    position: 'absolute', right: 14, top: '50%',
                    transform: errors.password ? 'translateY(-65%)' : 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <GlowButton
                id="auth-submit-btn"
                type="submit"
                size="lg"
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--space-2)' }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ display: 'block', width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#020208' }} />
                    {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                    <ArrowRight size={16} />
                  </span>
                )}
              </GlowButton>
            </div>
          </form>

          {/* Toggle mode */}
          <div style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--text-dim)' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              id="auth-toggle-mode"
              onClick={() => setMode(m => m === 'login' ? 'register' : 'login')}
              style={{ background: 'none', border: 'none', color: 'var(--lime)', cursor: 'pointer', fontWeight: 600 }}
            >
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </div>
        </div>

        {/* Terms */}
        <p style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-dim)', marginTop: 'var(--space-4)', lineHeight: 1.6 }}>
          By continuing, you agree to GFXTAB AI Studio's Terms of Service & Privacy Policy.
          <br />
          Built by GFXTAB Productions
        </p>
      </motion.div>
    </div>
  )
}
