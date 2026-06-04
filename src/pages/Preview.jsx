import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Download, Share2, ArrowLeft, Send } from 'lucide-react'
import { GlowButton, GhostButton } from '@/components/ui/Button.jsx'
import { useEditorStore } from '@/store/index.js'
import { notify } from '@/components/ui/Toast.jsx'

const EXPORT_FORMATS = [
  { id: 'png-hd',    label: 'PNG HD',       desc: '3000×3000px · Best Quality', badge: 'PRO', size: '~12MB' },
  { id: 'png-web',   label: 'PNG Web',      desc: '1200×1200px · Fast Load',    badge: null, size: '~2MB' },
  { id: 'jpg-print', label: 'JPG Print',    desc: '4000px · CMYK Ready',        badge: 'PRO', size: '~8MB' },
  { id: 'instagram', label: 'Instagram',    desc: '1080×1080px · Square',       badge: null, size: '~1.5MB' },
  { id: 'stories',   label: 'Stories',      desc: '1080×1920px · Vertical',     badge: null, size: '~2MB' },
  { id: 'linkedin',  label: 'LinkedIn',     desc: '1200×627px · Banner',        badge: null, size: '~1.2MB' },
]

const SHARE_OPTIONS = [
  { id: 'whatsapp', label: 'WhatsApp', icon: '💬', color: '#25D366' },
  { id: 'instagram', label: 'Instagram', icon: '📸', color: '#E1306C' },
  { id: 'drive', label: 'Google Drive', icon: '📁', color: '#4285F4' },
  { id: 'copy', label: 'Copy Link', icon: '🔗', color: 'var(--lime)' },
]

export default function Preview() {
  const navigate = useNavigate()
  const { artwork, product, generatedPreviewUrl } = useEditorStore()

  const handleExport = (format) => {
    if (generatedPreviewUrl) {
      notify.success(`Exporting ${format.label}`, `${format.desc} — ${format.size}`)
      setTimeout(() => {
        const link = document.createElement('a')
        link.download = `gfxtab_${product?.id || 'mockup'}_${format.id}.png`
        link.href = generatedPreviewUrl
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        notify.success('Export Ready!', `${format.label} downloaded successfully.`)
      }, 800)
    } else {
      notify.error('No preview generated', 'Ensure you have a design active in the editor.')
    }
  }

  const handleShare = (option) => {
    if (option.id === 'copy') {
      navigator.clipboard.writeText(window.location.href).catch(() => {})
      notify.success('Link copied!', 'Share your mockup link.')
    } else {
      notify.info(`Sharing to ${option.label}`, 'Opening share sheet...')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ maxWidth: 1000 }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
        <GhostButton size="sm" color="white" onClick={() => navigate('/editor')} icon={<ArrowLeft size={14} />}>
          Back to Editor
        </GhostButton>
        <GlowButton id="preview-export-btn" onClick={() => handleExport(EXPORT_FORMATS[0])} icon={<Download size={16} />}>
          Export PNG HD
        </GlowButton>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'var(--space-6)', alignItems: 'flex-start' }}>
        {/* Preview */}
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 22 }}
          style={{
            aspectRatio: '1',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            border: '1px solid rgba(200,255,0,0.1)',
            boxShadow: 'var(--glow-card)',
            background: '#1a1a2e',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}
        >
          {generatedPreviewUrl ? (
            <img src={generatedPreviewUrl} alt="Mockup preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : artwork?.url ? (
            <img src={artwork.url} alt="Mockup preview" style={{ maxWidth: '60%', maxHeight: '60%', objectFit: 'contain', borderRadius: 8 }} />
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-dim)' }}>
              <div style={{ fontSize: '4rem', marginBottom: 12 }}>{product ? '🎨' : '📦'}</div>
              <p>{product?.name || 'No mockup generated yet'}</p>
            </div>
          )}
          {/* Watermark badge */}
          <div style={{
            position: 'absolute', bottom: 16, right: 16,
            background: 'rgba(200,255,0,0.15)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(200,255,0,0.2)',
            borderRadius: 'var(--radius-sm)', padding: '4px 10px',
            fontSize: 10, color: 'var(--lime)', fontWeight: 600, letterSpacing: '0.06em',
          }}>
            GFXTAB AI Studio
          </div>
        </motion.div>

        {/* Export panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Formats */}
          <div
            style={{
              background: 'var(--glass)', backdropFilter: 'blur(24px)',
              border: '1px solid rgba(200,255,0,0.08)',
              borderRadius: 'var(--radius-lg)', overflow: 'hidden',
            }}
          >
            <div style={{ padding: 'var(--space-4) var(--space-4) var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text-dim)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Export Formats
            </div>
            {EXPORT_FORMATS.map((format, i) => (
              <motion.div
                key={format.id}
                whileHover={{ backgroundColor: 'rgba(200,255,0,0.04)' }}
                onClick={() => handleExport(format)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: 'var(--space-3) var(--space-4)',
                  borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.04)',
                  cursor: 'pointer',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-sm)' }}>{format.label}</span>
                    {format.badge && (
                      <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--violet)', background: 'rgba(123,47,255,0.12)', padding: '1px 6px', borderRadius: 3 }}>
                        {format.badge}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)' }}>{format.desc}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>{format.size}</span>
                  <Download size={14} color="var(--text-dim)" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Share */}
          <div
            style={{
              background: 'var(--glass)', backdropFilter: 'blur(24px)',
              border: '1px solid rgba(200,255,0,0.08)',
              borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)',
            }}
          >
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-3)' }}>
              Share
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
              {SHARE_OPTIONS.map((opt) => (
                <motion.button
                  key={opt.id}
                  onClick={() => handleShare(opt)}
                  whileHover={{ scale: 1.04, backgroundColor: `${opt.color}15` }}
                  whileTap={{ scale: 0.96 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    background: 'transparent', cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-xs)', fontWeight: 500,
                    color: 'var(--text-secondary)',
                    transition: 'background 0.2s',
                  }}
                >
                  <span>{opt.icon}</span>
                  {opt.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
