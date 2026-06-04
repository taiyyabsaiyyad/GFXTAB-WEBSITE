/**
 * GFXTAB AI Studio — User Analytics Dashboard
 * Track user sessions, downloads, searches, and engagement
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart2, Users, Download, Search, TrendingUp, Mail, Activity, RefreshCw, FileText } from 'lucide-react'
import { GlassCard } from '@/components/ui/Card.jsx'
import { GlowButton } from '@/components/ui/Button.jsx'

// ── Analytics storage keys ─────────────────────────────────────────
const ANALYTICS_KEY = 'gfxtab_analytics_v1'

export const trackEvent = (type, data = {}) => {
  const stored = JSON.parse(localStorage.getItem(ANALYTICS_KEY) || '{"events":[]}')
  stored.events.push({
    type,
    data,
    timestamp: new Date().toISOString(),
    session: sessionStorage.getItem('gfxtab_studio_session') || 'unknown',
    userAgent: navigator.userAgent.slice(0, 80)
  })
  // Keep last 500 events
  if (stored.events.length > 500) stored.events = stored.events.slice(-500)
  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(stored))
}

// ── Metric Card ────────────────────────────────────────────────────
function MetricCard({ icon: Icon, label, value, color = 'var(--lime)', sub }) {
  return (
    <GlassCard style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: 16, top: 16, opacity: 0.1 }}>
        <Icon size={52} color={color} />
      </div>
      <div style={{
        width: 40, height: 40, borderRadius: 'var(--radius-md)',
        background: `${color}18`, border: `1px solid ${color}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, fontFamily: 'var(--font-display)', color }}>{value}</div>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', marginTop: 4 }}>{sub}</div>}
      </div>
    </GlassCard>
  )
}

export default function Analytics() {
  const [events, setEvents] = useState([])
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const loadEvents = () => {
    const stored = JSON.parse(localStorage.getItem(ANALYTICS_KEY) || '{"events":[]}')
    setEvents(stored.events || [])
    setLastRefresh(new Date())
  }

  useEffect(() => { loadEvents() }, [])

  // ── Computed metrics ───────────────────────────────────────────
  const totalSessions = new Set(events.map(e => e.session)).size
  const totalDownloads = events.filter(e => e.type === 'download').length
  const totalSearches = events.filter(e => e.type === 'search').length
  const totalChatMessages = events.filter(e => e.type === 'ai_chat').length
  const totalPageViews = events.filter(e => e.type === 'pageview').length

  const topSearches = (() => {
    const counts = {}
    events.filter(e => e.type === 'search' && e.data?.query).forEach(e => {
      const q = e.data.query.toLowerCase()
      counts[q] = (counts[q] || 0) + 1
    })
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10)
  })()

  const topDownloads = (() => {
    const counts = {}
    events.filter(e => e.type === 'download' && e.data?.assetName).forEach(e => {
      const n = e.data.assetName
      counts[n] = (counts[n] || 0) + 1
    })
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10)
  })()

  const recentActivity = events.slice(-20).reverse()

  const today = new Date().toDateString()
  const todayEvents = events.filter(e => new Date(e.timestamp).toDateString() === today)
  const todayActiveUsers = new Set(todayEvents.map(e => e.session)).size

  // ── Export as CSV ──────────────────────────────────────────────
  const exportCSV = () => {
    const rows = [['Type', 'Data', 'Timestamp', 'Session']]
    events.forEach(e => rows.push([
      e.type,
      JSON.stringify(e.data || {}),
      e.timestamp,
      e.session
    ]))
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `gfxtab_analytics_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  // ── Clear analytics ────────────────────────────────────────────
  const clearAnalytics = () => {
    if (confirm('Clear all analytics data? This cannot be undone.')) {
      localStorage.removeItem(ANALYTICS_KEY)
      loadEvents()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: 6 }}>
            📊 User Analytics
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: 'var(--text-sm)' }}>
            Track engagement, downloads, searches, and user behavior across GFXTAB AI Studio.
            <br />Last refreshed: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={loadEvents} style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', background: 'var(--void-3)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-sm)' }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={exportCSV} style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', background: 'var(--void-3)', border: '1px solid var(--glass-border)', color: '#4ade80', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-sm)' }}>
            <FileText size={14} /> Export CSV
          </button>
          <GlowButton onClick={clearAnalytics} style={{ padding: '8px 16px', fontSize: 'var(--text-sm)' }}>
            Clear Data
          </GlowButton>
        </div>
      </div>

      {/* Metric Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
        <MetricCard icon={Activity} label="Total Events" value={events.length} color="var(--lime)" sub="All tracked interactions" />
        <MetricCard icon={Users} label="Total Sessions" value={totalSessions} color="#06b6d4" sub="Unique browser sessions" />
        <MetricCard icon={Users} label="Active Today" value={todayActiveUsers} color="#a78bfa" sub={`${todayEvents.length} events today`} />
        <MetricCard icon={Download} label="Downloads" value={totalDownloads} color="#4ade80" sub="Assets downloaded" />
        <MetricCard icon={Search} label="Searches" value={totalSearches} color="#fb923c" sub="Search queries" />
        <MetricCard icon={BarChart2} label="AI Chats" value={totalChatMessages} color="#f472b6" sub="AI Studio messages" />
        <MetricCard icon={TrendingUp} label="Page Views" value={totalPageViews} color="#60a5fa" sub="Total page navigations" />
      </div>

      {/* Content Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
        
        {/* Top Searches */}
        <GlassCard style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-4)' }}>
            <Search size={16} color="var(--lime)" />
            <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600 }}>Top Search Queries</h3>
          </div>
          {topSearches.length === 0 ? (
            <p style={{ color: 'var(--text-dim)', fontSize: 'var(--text-sm)' }}>No searches tracked yet. Search activity will appear here.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {topSearches.map(([term, count], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', width: 16, textAlign: 'right' }}>#{i+1}</span>
                  <div style={{ flex: 1, background: 'var(--void-3)', borderRadius: 4, overflow: 'hidden', height: 6 }}>
                    <div style={{ height: '100%', background: 'var(--lime)', width: `${(count / topSearches[0][1]) * 100}%`, borderRadius: 4 }} />
                  </div>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, flex: 2 }}>{term}</span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--lime)', fontWeight: 700 }}>{count}x</span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Top Downloads */}
        <GlassCard style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-4)' }}>
            <Download size={16} color="#4ade80" />
            <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600 }}>Top Downloaded Assets</h3>
          </div>
          {topDownloads.length === 0 ? (
            <p style={{ color: 'var(--text-dim)', fontSize: 'var(--text-sm)' }}>No downloads tracked yet. Download activity will appear here.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {topDownloads.map(([name, count], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', width: 16, textAlign: 'right' }}>#{i+1}</span>
                  <span style={{ fontSize: 'var(--text-sm)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                  <span style={{ fontSize: 'var(--text-xs)', color: '#4ade80', fontWeight: 700 }}>{count}x</span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Recent Activity Feed */}
        <GlassCard style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-4)' }}>
            <Activity size={16} color="#a78bfa" />
            <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600 }}>Recent Activity</h3>
          </div>
          {recentActivity.length === 0 ? (
            <p style={{ color: 'var(--text-dim)', fontSize: 'var(--text-sm)' }}>No activity tracked yet. As users interact with the site, events will appear here.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 280, overflowY: 'auto' }}>
              {recentActivity.map((e, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '6px 0', borderBottom: '1px solid var(--glass-border)', fontSize: 'var(--text-xs)' }}>
                  <span style={{
                    padding: '2px 6px', borderRadius: 4, fontWeight: 600, whiteSpace: 'nowrap',
                    background: e.type === 'download' ? 'rgba(74,222,128,0.15)' : e.type === 'search' ? 'rgba(200,255,0,0.15)' : 'rgba(167,139,250,0.15)',
                    color: e.type === 'download' ? '#4ade80' : e.type === 'search' ? 'var(--lime)' : '#a78bfa'
                  }}>{e.type}</span>
                  <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {e.data?.query || e.data?.assetName || e.data?.page || JSON.stringify(e.data || {}).slice(0, 30)}
                  </span>
                  <span style={{ color: 'var(--text-dim)', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                    {new Date(e.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      {/* How to Enable Push Notifications Info */}
      <GlassCard style={{ padding: 'var(--space-5)', border: '1px solid rgba(200,255,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <Mail size={24} color="var(--lime)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, marginBottom: 8 }}>📬 Push Notifications & Email Marketing</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.6, marginBottom: 12 }}>
              To send push notifications and collect user emails for marketing, integrate the following services:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
              {[
                { name: 'Firebase Cloud Messaging', desc: 'Free push notifications for web & mobile', color: '#fb923c' },
                { name: 'Mailchimp API', desc: 'Email lists, campaigns & automation', color: '#f472b6' },
                { name: 'Supabase Auth', desc: 'Already integrated — captures user emails', color: '#60a5fa' },
                { name: 'OneSignal', desc: 'Easy web push with free tier up to 10k', color: 'var(--lime)' },
              ].map((s, i) => (
                <div key={i} style={{ padding: 'var(--space-3)', background: 'var(--void-3)', borderRadius: 'var(--radius-md)', border: `1px solid ${s.color}30` }}>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: s.color, marginBottom: 4 }}>{s.name}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)' }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}
