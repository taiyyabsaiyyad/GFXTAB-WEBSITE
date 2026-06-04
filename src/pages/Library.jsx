import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Search, FileText, ArrowRight, Library as LibIcon } from 'lucide-react'
import { useDownloadStore, useAuthStore } from '@/store/index.js'
import { GlassCard } from '@/components/ui/Card.jsx'
import { GlowButton, GhostButton, IconButton } from '@/components/ui/Button.jsx'
import { SearchInput } from '@/components/ui/Input.jsx'
import { notify } from '@/components/ui/Toast.jsx'
import { useNavigate } from 'react-router-dom'

export default function Library() {
  const navigate = useNavigate()
  const { downloads, fetchDownloads } = useDownloadStore()
  const { user } = useAuthStore()
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [fontsList, setFontsList] = useState([])

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        await fetchDownloads()
        // Fetch fonts list to inject font-faces
        const res = await fetch('http://localhost:4000/fonts/list')
        const data = await res.json()
        if (data.success) {
          setFontsList(data.fonts || [])
        }
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    loadData()
  }, [fetchDownloads])

  const handleRedownload = (dl) => {
    notify.success('Download starting...', `Fetching files for ${dl.asset_name || dl.assetName}`)
    const link = document.createElement('a')
    
    const fileName = dl.asset_id || dl.assetId
    const isLocalVector = fileName?.startsWith('shutterstock_') && fileName?.endsWith('.eps')
    const isLocalFont = /\.(ttf|otf)$/i.test(fileName)
    
    if (isLocalVector) {
      link.href = `http://localhost:4000/vectors/download/${fileName}`
    } else if (isLocalFont) {
      link.href = `http://localhost:4000/fonts/download/${fileName}`
    } else {
      // Mock source file
      link.href = '/assets/Artboard 1.jpg'
      link.download = `gfxtab_download_${fileName}.jpg`
    }
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filtered = downloads.filter(dl => 
    (dl.asset_name || dl.assetName || '').toLowerCase().includes(search.toLowerCase()) ||
    (dl.asset_id || dl.assetId || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 22 }}
      style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 'var(--space-12)' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-8)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 6 }}>
            Download Library
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Track and re-download your purchased vector files, fonts, and mockup assets.
          </p>
        </div>
        <GlowButton onClick={() => navigate('/dashboard')} icon={<ArrowRight size={16} />}>
          Browse Marketplace
        </GlowButton>
      </div>

      {/* Search Bar */}
      <div style={{ maxWidth: 360, marginBottom: 'var(--space-6)' }}>
        <SearchInput
          id="library-search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search downloads..."
        />
      </div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <div className="pulse" style={{ fontSize: '1.2rem', color: 'var(--lime)' }}>Loading downloads history...</div>
          </div>
        ) : filtered.length === 0 ? (
          <GlassCard style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}><LibIcon size={48} color="var(--text-dim)" style={{ margin: '0 auto' }} /></div>
            <h3 style={{ marginBottom: 8, fontSize: 'var(--text-base)' }}>No downloaded assets</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-5)' }}>
              Assets you purchase or download from the GFXTAB Marketplace will appear here.
            </p>
            <GhostButton onClick={() => navigate('/dashboard')}>Visit Marketplace →</GhostButton>
          </GlassCard>
        ) : (
          <>
            {/* Dynamic font-face style tags injection for library */}
            {fontsList.length > 0 && (
              <style>{`
                ${fontsList.map(f => `
                  @font-face {
                    font-family: "${f.id}";
                    src: url("http://localhost:4000/fonts/download/${encodeURIComponent(f.id)}") format("${f.id.toLowerCase().endsWith('.otf') ? 'opentype' : 'truetype'}");
                  }
                `).join('\n')}
              `}</style>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
              {filtered.map((dl) => {
                const name = dl.asset_name || dl.assetName || 'Vector Design File'
                const assetId = dl.asset_id || dl.assetId || ''
                const isFont = assetId.includes('font') || /\.(ttf|otf)$/i.test(assetId) || dl.preview_url === 'font-asset'
                const preview = dl.preview_url || dl.previewUrl || '/assets/Artboard 1.jpg'
                
                return (
                  <GlassCard
                    key={dl.id}
                    style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                  >
                    {isFont ? (
                      <div style={{
                        aspectRatio: '4/3', overflow: 'hidden', background: 'var(--void-3)',
                        borderBottom: '1px solid var(--glass-border)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)'
                      }}>
                        <span style={{
                          fontFamily: `"${assetId}"`,
                          fontSize: '56px',
                          color: 'var(--lime)',
                          textAlign: 'center',
                          fontWeight: 600
                        }}>
                          Aa
                        </span>
                      </div>
                    ) : (
                      <div style={{ aspectRatio: '4/3', overflow: 'hidden', background: 'var(--void-2)' }}>
                        <img src={preview} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <div style={{ padding: 'var(--space-4)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{name}</h4>
                        <p style={{ fontSize: 10, color: 'var(--text-dim)', wordBreak: 'break-all' }}>ID: {assetId}</p>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-4)', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 'var(--space-3)' }}>
                        <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>
                          {dl.created_at ? new Date(dl.created_at).toLocaleDateString() : 'Just Now'}
                        </span>
                        <GhostButton size="sm" color="lime" onClick={() => handleRedownload(dl)}>
                          <Download size={12} style={{ marginRight: 6 }} /> Re-download
                        </GhostButton>
                      </div>
                    </div>
                  </GlassCard>
                )
            })}
          </div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
