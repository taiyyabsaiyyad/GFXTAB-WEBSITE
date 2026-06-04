import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Download, PenTool, Heart, Tag, Eye, Layers, DollarSign, RefreshCw, Star, MessageSquare } from 'lucide-react'
import { PRODUCTS, MOCK_FREEBIES } from '@/constants/products.js'
import { GhostButton, GlowButton } from '@/components/ui/Button.jsx'
import { GlassCard } from '@/components/ui/Card.jsx'
import { notify } from '@/components/ui/Toast.jsx'
import PaymentModal from '@/components/payment/PaymentModal.jsx'
import Modal from '@/components/ui/Modal.jsx'
import { useDownloadStore, useCollectionStore, useAuthStore } from '@/store/index.js'

const MOCK_FONTS = [
  { id: 'font-clash', name: 'Clash Display Font', category: 'fonts', description: 'Bold, premium display typography for branding layouts.', previewAsset: 'Photo from GFXTAB(17).jpg', isPremium: false, price: 0, tags: ['typography', 'display', 'sans'] },
  { id: 'font-sans', name: 'General Sans Typeface', category: 'fonts', description: 'Neutral, clean sans-serif typeface optimized for UI copy.', previewAsset: 'Photo from GFXTAB(18).jpg', isPremium: false, price: 0, tags: ['typography', 'sans', 'body'] },
  { id: 'font-cabinet', name: 'Cabinet Grotesk', category: 'fonts', description: 'Playful grotesque display font with vintage modern aesthetics.', previewAsset: 'Photo from GFXTAB(19).jpg', isPremium: false, price: 0, tags: ['grotesque', 'headings', 'type'] },
]

const MOCK_ICONS = [
  { id: 'icon-minimal', name: 'Minimal Line Icons Pack', category: 'icons', description: 'Clean stroke vector icons for web and mobile dashboards.', previewAsset: 'Photo from GFXTAB(20).jpg', isPremium: false, tags: ['vector', 'ui', 'stroke'] },
  { id: 'icon-3d', name: '3D Glossy Renders Pack', category: 'icons', description: 'Sleek transparent rendered objects for modern landing pages.', previewAsset: 'Photo from GFXTAB(21).jpg', isPremium: true, price: 99, tags: ['3d', 'renders', 'glossy'] },
]

const MOCK_TEMPLATES = [
  { id: 'temp-brand', name: 'Minimalist Stationery Brand Kit', category: 'templates', description: 'Corporate identity mock layouts (Card, Letterhead, Envelope).', previewAsset: 'Photo from GFXTAB(22).jpg', isPremium: true, price: 79, tags: ['branding', 'stationery', 'corporate'] },
  { id: 'temp-social', name: 'Social Media Carousel System', category: 'templates', description: 'Customizable Canva/Figma layout grid for carousel storytelling.', previewAsset: 'Photo from GFXTAB(23).jpg', isPremium: false, tags: ['social', 'instagram', 'figma'] },
]

export default function MockupDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  
  const { favorites, toggleFavorite } = useCollectionStore()
  const { addDownload } = useDownloadStore()
  const { user } = useAuthStore()
  
  const [vectorAsset, setVectorAsset] = useState(null)
  const [loading, setLoading] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  // Star rating & Likes
  const [userRating, setUserRating] = useState(() => {
    const saved = localStorage.getItem(`rating_${id}`)
    return saved ? Number(saved) : 0
  })

  // Find asset in mock collections first
  const staticAsset = PRODUCTS.find((p) => p.id === id) ||
                      MOCK_FONTS.find((f) => f.id === id) ||
                      MOCK_ICONS.find((i) => i.id === id) ||
                      MOCK_TEMPLATES.find((t) => t.id === id) ||
                      MOCK_FREEBIES.find((fr) => fr.id === id)

  const asset = staticAsset || vectorAsset
  const isFav = favorites.includes(id)
  
  // Likes count state
  const initialLikes = asset ? ((asset.popularity || 15) * 3 + 24) : 48
  const [likesCount, setLikesCount] = useState(initialLikes)
  const [hasLiked, setHasLiked] = useState(isFav)

  // Sync like status with favorite store
  useEffect(() => {
    const currentFav = favorites.includes(id)
    if (currentFav !== hasLiked) {
      setHasLiked(currentFav)
      setLikesCount(prev => currentFav ? prev + 1 : Math.max(0, prev - 1))
    }
  }, [favorites, id])

  // Design Inquiry states
  const [inquiryOpen, setInquiryOpen] = useState(false)
  const [clientName, setClientName] = useState(user?.name || '')
  const [clientEmail, setClientEmail] = useState(user?.email || '')
  const [selectedReasons, setSelectedReasons] = useState(['Pricing & Commercial License'])
  const [inquiryMessage, setInquiryMessage] = useState('')
  const [detailPreviewText, setDetailPreviewText] = useState('GFXTAB Productions 2026')

  // Fetch from backend vector or font scan list dynamically if not found statically
  const assetType = location.state?.assetType

  useEffect(() => {
    if (!staticAsset && id) {
      setLoading(true)
      let apiEndpoint = 'http://localhost:4000/vectors/list'
      if (assetType === 'fonts') {
        apiEndpoint = 'http://localhost:4000/fonts/list'
      } else if (assetType === 'icons') {
        apiEndpoint = 'http://localhost:4000/icons/list'
      } else if (assetType === 'templates') {
        apiEndpoint = 'http://localhost:4000/templates/list'
      } else if (assetType === 'mockups') {
        apiEndpoint = 'http://localhost:4000/mockups/list'
      }

      fetch(apiEndpoint)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            let list = []
            if (assetType === 'fonts') list = data.fonts
            else if (assetType === 'vectors') list = data.vectors
            else if (assetType === 'icons') list = data.icons
            else if (assetType === 'templates') list = data.templates
            else if (assetType === 'mockups') list = data.mockups

            const found = list?.find(v => v.id === id)
            if (found) {
              setVectorAsset(found)
              setLikesCount((found.popularity || 15) * 3 + 24)
            }
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false))
    }
  }, [id, staticAsset, assetType])

  // Graceful fallback to avoid blank screen
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-20)' }}>
        <RefreshCw className="spin" size={32} color="var(--lime)" style={{ margin: '0 auto var(--space-4)' }} />
        <p style={{ color: 'var(--text-dim)' }}>Loading asset files detail...</p>
      </div>
    )
  }

  if (!asset) {
    return (
      <GlassCard style={{ padding: 'var(--space-12)', textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
        <h3 style={{ marginBottom: 12 }}>Asset not found</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>The request design resource was not loaded properly.</p>
        <GlowButton onClick={() => navigate('/dashboard')}>Back to Marketplace</GlowButton>
      </GlassCard>
    )
  }

  const isMockup = asset.category !== 'vectors' && asset.category !== 'fonts' && asset.category !== 'icons' && asset.category !== 'templates'
  const isPremium = (asset.category === 'fonts' || asset.category === 'photos') ? false : asset.isPremium
  const assetPrice = (asset.category === 'fonts' || asset.category === 'photos') ? 0 : (asset.price || 0)
  const preview = asset.previewAsset && (asset.previewAsset.startsWith('data:') || asset.previewAsset.startsWith('http'))
    ? asset.previewAsset
    : (asset.previewAsset ? `${import.meta.env.BASE_URL}assets/${asset.previewAsset}` : `${import.meta.env.BASE_URL}assets/Artboard 1.jpg`)

  // Trigger vector/font/mockup preview download
  const triggerDownloadAction = () => {
    const currentCredits = useAuthStore.getState().credits
    const isUnlimited = useAuthStore.getState().user?.plan === 'unlimited'
    const isFreeCategory = asset.category === 'fonts' || asset.category === 'photos' || asset.category === 'freebies'
    
    if (!isFreeCategory && !isUnlimited && currentCredits < 10) {
      notify.error('Insufficient Credits', 'Recharge your credits to download assets.')
      useAuthStore.getState().setUpgradeModalOpen(true)
      return
    }

    if (!isFreeCategory && !isUnlimited) {
      useAuthStore.getState().addCredits(-10)
      notify.info('10 Credits Deducted', `Remaining: ${currentCredits - 10} credits.`)
    }

    // Save to downloads library history
    addDownload({
      assetId: asset.id,
      assetName: asset.name,
      previewUrl: asset.category === 'fonts' ? 'font-asset' : preview
    })

    const link = document.createElement('a')
    if (asset.category === 'vectors') {
      link.href = `http://localhost:4000/vectors/download/${asset.id}`
    } else if (asset.category === 'fonts') {
      link.href = `http://localhost:4000/fonts/download/${asset.id}`
    } else {
      // Mock icon/template download or high-res preview mockup
      link.href = preview
      link.download = `gfxtab_${asset.id}_preview.jpg`
    }
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    notify.success('Download Complete', `${asset.name} has been downloaded.`)
  }

  const handleDownload = () => {
    if (isPremium) {
      setCheckoutOpen(true)
    } else {
      triggerDownloadAction()
    }
  }

  const handleWhatsAppInquiry = () => {
    if (!clientName || !clientEmail || !inquiryMessage) {
      notify.error('Missing Details', 'Please fill in your name, email, and requirements.')
      return
    }

    const reasonsText = selectedReasons.length > 0 
      ? selectedReasons.join(', ')
      : 'General Inquiry'

    const formattedMessage = `Hello GFXTAB! I'm interested in the mockup: "${asset.name}" (ID: ${asset.id}).
    
My Name: ${clientName}
My Email: ${clientEmail}
Inquiry Details: ${reasonsText}
Custom Requirements: ${inquiryMessage}`

    // Log to local backend inquiry system
    fetch('http://localhost:4000/inquiries/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assetId: asset.id,
        assetName: asset.name,
        name: clientName,
        email: clientEmail,
        requirements: `Inquiry type: ${reasonsText}. Details: ${inquiryMessage}`
      })
    }).catch(err => console.error(err))

    const url = `https://wa.me/917448264686?text=${encodeURIComponent(formattedMessage)}`
    window.open(url, '_blank')
    setInquiryOpen(false)
    notify.success('Redirecting to WhatsApp...', 'Send your prefilled inquiry directly to GFXTAB.')
  }

  // File Specs config
  const getSpecs = () => {
    if (isMockup) {
      return [
        { label: 'Resolution', value: '3000 x 3000 px' },
        { label: 'DPI', value: '300 DPI' },
        { label: 'Format', value: 'PSD (Smart Object), JPG' },
        { label: 'Ratio', value: '1:1 Square' }
      ]
    } else if (asset.category === 'vectors') {
      return [
        { label: 'Format', value: 'Vector EPS, High-Res Preview' },
        { label: 'Vector Type', value: 'Scalable Coordinates' },
        { label: 'File Size', value: asset.fileSize || '2.4 MB' },
        { label: 'Compatibility', value: 'Adobe Illustrator, CorelDraw' }
      ]
    } else if (asset.category === 'fonts') {
      return [
        { label: 'Formats', value: 'OTF, TTF, WOFF2' },
        { label: 'License', value: 'GFXTAB Font EULA' },
        { label: 'Weights', value: 'Regular, Bold, Medium' },
        { label: 'Web Font', value: 'Included' }
      ]
    } else {
      return [
        { label: 'Format', value: 'Layered Figma / Transparent PNG' },
        { label: 'DPI', value: '300 DPI Print Ready' },
        { label: 'Asset ID', value: asset.id },
        { label: 'Licensing', value: 'GFXTAB Commercial license' }
      ]
    }
  }

  const specs = getSpecs()

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 'var(--space-12)' }}>
      <button 
        onClick={() => navigate('/dashboard')} 
        style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', marginBottom: 'var(--space-6)', fontWeight: 500 }}
      >
        <ArrowLeft size={16} /> Back to Marketplace
      </button>

      {/* Main Detail Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.4fr) 1fr', gap: 'var(--space-8)', marginBottom: 'var(--space-12)' }}>
        {/* Left: Image Preview or Font Tester */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {asset.category === 'fonts' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', width: '100%' }}>
              {/* Dynamic style block for loading the specific font family */}
              <style>{`
                @font-face {
                  font-family: "${asset.id}";
                  src: url("http://localhost:4000/fonts/download/${encodeURIComponent(asset.id)}") format("${asset.id.toLowerCase().endsWith('.otf') ? 'opentype' : 'truetype'}");
                }
              `}</style>
              
              <div style={{ 
                width: '100%', 
                borderRadius: 'var(--radius-lg)', 
                overflow: 'hidden', 
                background: 'var(--void-2)', 
                border: '1px solid var(--glass-border)',
                display: 'flex',
                flexDirection: 'column',
                padding: 'var(--space-8)',
                minHeight: 480,
                justifyContent: 'center',
                boxShadow: 'var(--glow-card)',
                position: 'relative'
              }}>
                <div style={{ width: '100%', overflowX: 'auto', textAlign: 'center', padding: 'var(--space-4) 0' }}>
                  <span style={{
                    fontFamily: `"${asset.id}"`,
                    fontSize: 'clamp(24px, 4.5vw, 64px)',
                    color: 'var(--text-primary)',
                    lineHeight: 1.25,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    display: 'inline-block'
                  }}>
                    {detailPreviewText || asset.name}
                  </span>
                </div>
              </div>

              {/* Text input to test font */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.08em' }}>
                  Type to test this typeface (Real-time Preview)
                </label>
                <input
                  type="text"
                  value={detailPreviewText}
                  onChange={(e) => setDetailPreviewText(e.target.value)}
                  placeholder="Type custom text to preview font..."
                  style={{
                    width: '100%', padding: '14px var(--space-4)', borderRadius: 'var(--radius-md)',
                    background: 'var(--void-3)', border: '1px solid var(--glass-border)',
                    color: 'var(--text-primary)', fontSize: 'var(--text-base)',
                    boxShadow: 'var(--glow-card)'
                  }}
                />
              </div>
            </div>
          ) : (
            <div style={{ 
              width: '100%', 
              borderRadius: 'var(--radius-lg)', 
              overflow: 'hidden', 
              background: 'var(--void-2)', 
              border: '1px solid var(--glass-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--space-4)',
              minHeight: 480
            }}>
              <img 
                src={preview} 
                alt={asset.name} 
                style={{ maxWidth: '100%', maxHeight: 520, borderRadius: 'var(--radius-md)', objectFit: 'contain' }}
              />
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', padding: '0 4px' }}>
            <span>Category: <strong style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{asset.category}</strong></span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={14} /> {((asset.popularity || 15) * 12)} Views</span>
          </div>
        </div>

        {/* Right: Info & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div>
            <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>{asset.name}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', lineHeight: 1.6 }}>{asset.description}</p>
          </div>

          {/* Actions & Pricing Card */}
          <GlassCard style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', textTransform: 'uppercase' }}>License</span>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>GFXTAB Free Personal & Commercial</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Price</span>
                <p style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: isPremium ? 'var(--lime)' : 'var(--text-secondary)' }}>
                  {isPremium ? `₹${assetPrice}` : 'Free'}
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
              {isMockup ? (
                <>
                  <GlowButton onClick={() => setInquiryOpen(true)} style={{ flex: 1, justifyContent: 'center', gap: 8 }}>
                    <MessageSquare size={18} /> Submit Design Inquiry
                  </GlowButton>
                  <GhostButton onClick={triggerDownloadAction} style={{ flex: 1, justifyContent: 'center', gap: 8 }}>
                    <Download size={18} /> Download High-Res Preview
                  </GhostButton>
                </>
              ) : (
                <GlowButton onClick={handleDownload} style={{ flex: 1, justifyContent: 'center', gap: 8 }}>
                  <Download size={18} /> {isPremium ? `Pay & Download (₹${assetPrice})` : 'Download Free Asset'}
                </GlowButton>
              )}
              
              <GhostButton 
                onClick={() => toggleFavorite(asset.id)}
                style={{ color: hasLiked ? 'var(--red)' : 'var(--text-primary)', display: 'flex', gap: 8, alignItems: 'center', padding: '0 16px' }}
                tooltip={hasLiked ? 'Unlike' : 'Like'}
              >
                <Heart size={18} fill={hasLiked ? 'var(--red)' : 'none'} />
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>{likesCount}</span>
              </GhostButton>
            </div>

            {/* Interactive Stars Rating for Mockups (Our Works) */}
            {isMockup && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 'var(--space-3)', marginTop: 'var(--space-1)' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', fontWeight: 500, textTransform: 'uppercase' }}>
                  Rate this work
                </span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {Array.from({ length: 5 }).map((_, idx) => {
                    const active = idx < userRating
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setUserRating(idx + 1)
                          localStorage.setItem(`rating_${id}`, String(idx + 1))
                          notify.success('Rating Submitted!', `Thank you! You rated this work ${idx + 1} stars.`)
                        }}
                        style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Star 
                          size={16} 
                          fill={active ? 'var(--lime)' : 'none'} 
                          color={active ? 'var(--lime)' : 'var(--text-dim)'} 
                          style={{ transition: 'all 0.15s' }}
                        />
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </GlassCard>

          {/* Specs info */}
          <GlassCard style={{ padding: 'var(--space-5)' }}>
            <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-3)' }}>File Specifications</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              {specs.map((s, i) => (
                <div key={i}>{s.label}: <strong style={{ color: 'var(--text-primary)' }}>{s.value}</strong></div>
              ))}
            </div>
          </GlassCard>
          
          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(asset.tags || []).map((tag) => (
              <span key={tag} style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '4px 10px', borderRadius: 'var(--radius-full)',
                background: 'var(--void-3)', border: '1px solid var(--glass-border)',
                fontSize: 'var(--text-xs)', color: 'var(--text-secondary)'
              }}>
                <Tag size={10} /> {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Abstraction Dialog */}
      <PaymentModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        assetName={asset.name}
        price={asset.price}
        onPaymentSuccess={triggerDownloadAction}
      />

      {/* Design Inquiry Modal */}
      <Modal
        id="inquiry-modal"
        isOpen={inquiryOpen}
        onClose={() => setInquiryOpen(false)}
        title={`Submit Inquiry: ${asset.name}`}
        size="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-2)' }}>
            Tell us about your project requirements. Submitting this form will automatically redirect you to WhatsApp to discuss directly with GFXTAB Productions.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-dim)', marginBottom: 6 }}>Your Name</label>
              <input
                type="text"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                placeholder="Enter your name"
                style={{
                  width: '100%', padding: '12px var(--space-4)', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--glass-border)', background: 'var(--void-2)',
                  color: 'var(--text-primary)', fontSize: 'var(--text-sm)'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-dim)', marginBottom: 6 }}>Your Email</label>
              <input
                type="email"
                value={clientEmail}
                onChange={e => setClientEmail(e.target.value)}
                placeholder="Enter your email"
                style={{
                  width: '100%', padding: '12px var(--space-4)', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--glass-border)', background: 'var(--void-2)',
                  color: 'var(--text-primary)', fontSize: 'var(--text-sm)'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-dim)', marginBottom: 6 }}>Select Custom Options</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                'Pricing & Commercial License',
                'Get custom mockups created',
                'Request high-res mockup render',
                'Custom graphic design services'
              ].map(opt => {
                const selected = selectedReasons.includes(opt)
                return (
                  <label key={opt} style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)', border: '1px solid',
                    borderColor: selected ? 'var(--lime)' : 'var(--glass-border)',
                    background: selected ? 'var(--lime-ghost)' : 'var(--void-2)',
                    fontSize: 'var(--text-xs)', color: selected ? 'var(--text-primary)' : 'var(--text-secondary)',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}>
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => {
                        if (selected) {
                          setSelectedReasons(prev => prev.filter(r => r !== opt))
                        } else {
                          setSelectedReasons(prev => [...prev, opt])
                        }
                      }}
                      style={{ accentColor: 'var(--lime)' }}
                    />
                    {opt}
                  </label>
                )
              })}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-dim)', marginBottom: 6 }}>Requirements Details</label>
            <textarea
              rows={4}
              value={inquiryMessage}
              onChange={e => setInquiryMessage(e.target.value)}
              placeholder="Example: I want to customize this bag template with my brand logo. Please let me know the pricing and delivery details..."
              style={{
                width: '100%', padding: '12px var(--space-4)', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--glass-border)', background: 'var(--void-2)',
                color: 'var(--text-primary)', fontSize: 'var(--text-sm)', resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
            <GhostButton onClick={() => setInquiryOpen(false)}>Cancel</GhostButton>
            <GlowButton onClick={handleWhatsAppInquiry} style={{ gap: 8 }}>
              <MessageSquare size={16} /> Send Message on WhatsApp
            </GlowButton>
          </div>
        </div>
      </Modal>
    </div>
  )
}
