import { useAuthStore } from '@/store/index.js'

/**
 * GFXTAB Analytics & User Tracking System
 * Logs user registrations, profile updates, page visits, searches, and downloads.
 * Syncs details to the local tracking backend file: gfxtab_user_tracking.json
 */
export const trackEvent = async (eventType, eventData = {}) => {
  const user = useAuthStore.getState().user
  const logEntry = {
    timestamp: new Date().toISOString(),
    event: eventType,
    user: user ? {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || 'N/A'
    } : null,
    data: eventData
  }

  // 1. Log locally in browser localStorage
  try {
    const logs = JSON.parse(localStorage.getItem('gfxtab_analytics_logs') || '[]')
    logs.push(logEntry)
    // Keep last 500 events
    localStorage.setItem('gfxtab_analytics_logs', JSON.stringify(logs.slice(-500)))
  } catch (e) {
    console.error('[Tracker] Local storage logging failed:', e)
  }

  // 2. Log to the dedicated backend tracking file (if online)
  try {
    await fetch('http://localhost:4000/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logEntry)
    })
  } catch (err) {
    // Fail silently when server is offline (e.g. running on GitHub Pages static mode)
  }
}
