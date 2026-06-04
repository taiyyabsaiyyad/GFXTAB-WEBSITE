import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Grid, Star, Heart, Sparkles, Filter, SlidersHorizontal, RefreshCw, Download } from 'lucide-react'
import { GlowButton, GhostButton } from '@/components/ui/Button.jsx'
import { GlassCard } from '@/components/ui/Card.jsx'
import { PRODUCTS, MOCK_FREEBIES } from '@/constants/products.js'
import { useAuthStore, useCollectionStore, useDownloadStore, useMarketplaceStore } from '@/store/index.js'
import { notify } from '@/components/ui/Toast.jsx'

const MOCK_FONTS = [
  { id: 'font-clash', name: 'Clash Display Font', category: 'fonts', description: 'Bold, premium display typography for branding layouts.', previewAsset: 'Photo from GFXTAB(17).jpg', isPremium: false, price: 0, tags: ['typography', 'display', 'sans'] },
  { id: 'font-sans', name: 'General Sans Typeface', category: 'fonts', description: 'Neutral, clean sans-serif typeface optimized for UI copy.', previewAsset: 'Photo from GFXTAB(18).jpg', isPremium: false, price: 0, tags: ['typography', 'sans', 'body'] },
  { id: 'font-cabinet', name: 'Cabinet Grotesk', category: 'fonts', description: 'Playful grotesque display font with vintage modern aesthetics.', previewAsset: 'Photo from GFXTAB(19).jpg', isPremium: false, price: 0, tags: ['grotesque', 'headings', 'type'] },
]

const MOCK_ICONS = []

const MOCK_WEB_UI = [
  { id: 'web-saas', name: 'SaaS Platform Presentation', category: 'web_ui', description: 'Clean modern mockup presentation of a SaaS web app dashboard.', previewAsset: 'Photo from GFXTAB(26).jpg', isPremium: false, tags: ['web', 'ui', 'saas', 'landing'] },
  { id: 'web-mobile', name: 'Finance Mobile App UI', category: 'web_ui', description: 'Premium visual presentation showing a modern mobile cryptocurrency app interface.', previewAsset: 'Photo from GFXTAB(27).jpg', isPremium: true, price: 49, tags: ['mobile', 'ui', 'finance', 'ios'] },
  { id: 'web-ecom', name: 'Minimal E-Commerce Layout', category: 'web_ui', description: 'E-commerce platform presentation with clean catalog grids and minimalist typography.', previewAsset: 'Photo from GFXTAB(28).jpg', isPremium: false, tags: ['web', 'ui', 'ecom', 'shop'] },
]

const MOCK_VECTORS = [
  { id: 'vector-1', name: 'Minimalist Line Logo Pack', category: 'vectors', description: 'A collection of 15 clean, geometric line art logo templates.', previewAsset: 'Photo from GFXTAB(21).jpg', isPremium: false, tags: ['vector', 'logo', 'lineart'] },
  { id: 'vector-2', name: 'Abstract Organic Shapes', category: 'vectors', description: 'Stunning organic abstract shapes for modern branding and posters.', previewAsset: 'Photo from GFXTAB(22).jpg', isPremium: true, price: 29, tags: ['vector', 'abstract', 'organic'] },
  { id: 'vector-3', name: 'Isometric Tech Workspace', category: 'vectors', description: 'Highly detailed vector illustration of a modern developer home office.', previewAsset: 'Photo from GFXTAB(23).jpg', isPremium: false, tags: ['vector', 'tech', 'isometric'] },
]

const MOCK_PHOTOS = [
  { id: 'photo-1', name: 'Modern Creative Workspace', category: 'photos', description: 'High-resolution commercial photograph of a designer home office setup.', previewAsset: 'Photo from GFXTAB(31).jpg', isPremium: false, price: 0, isAi: false, tags: ['photo', 'office', 'lifestyle'] },
  { id: 'photo-2', name: 'Minimalist Clay Pots Still Life', category: 'photos', description: 'Elegant commercial photo of textured ceramic vases in warm natural light.', previewAsset: 'Photo from GFXTAB(32).jpg', isPremium: false, price: 0, isAi: false, tags: ['photo', 'interior', 'minimalist'] },
  { id: 'photo-3', name: 'Cyberpunk Neon Street Art (AI)', category: 'photos', description: 'Stunning futuristic night photograph of neon-lit Tokyo street signs.', previewAsset: 'Photo from GFXTAB(33).jpg', isPremium: false, price: 0, isAi: true, tags: ['photo', 'cyberpunk', 'neon', 'ai'] },
  { id: 'photo-4', name: 'Surreal Organic Landscape (AI)', category: 'photos', description: 'Dreamy visual illustration depicting futuristic glowing desert dunes.', previewAsset: 'Photo from GFXTAB(34).jpg', isPremium: false, price: 0, isAi: true, tags: ['photo', 'surreal', 'landscape', 'ai'] },
]

const MOCK_MAILERS = [
  { id: 'mailer-1', name: 'Minimalist Wedding Invitation', category: 'mailers', description: 'Clean, elegant print-ready wedding invitation layouts.', previewAsset: 'Photo from GFXTAB(36).jpg', isPremium: false, tags: ['invitation', 'wedding', 'print'] },
  { id: 'mailer-2', name: 'SaaS Platform Product Update', category: 'mailers', description: 'High-converting email newsletter template layout for product releases.', previewAsset: 'Photo from GFXTAB(37).jpg', isPremium: true, price: 19, tags: ['newsletter', 'email', 'mailer'] },
]

const MOCK_LOGOS = [
  { id: 'logo-1', name: 'Minimal Geometric Logo Sign', category: 'logos', description: 'Clean outlines and modern typography brand mark.', previewAsset: 'Photo from GFXTAB(40).jpg', isPremium: false, tags: ['logo', 'identity', 'branding'] },
  { id: 'logo-2', name: 'Luxury Monogram Emblem', category: 'logos', description: 'Gold foil crest monogram vector logo template.', previewAsset: 'Photo from GFXTAB(41).jpg', isPremium: true, price: 49, tags: ['logo', 'monogram', 'gold'] },
]

const MOCK_SOCIAL_POSTS = [
  { id: 'social-1', name: 'Instagram Carousel Layout', category: 'social_posts', description: 'Stunning Instagram multi-slide carousel design resource.', previewAsset: 'Photo from GFXTAB(44).jpg', isPremium: false, tags: ['social', 'instagram', 'carousel'] },
  { id: 'social-2', name: 'LinkedIn Slide Deck Template', category: 'social_posts', description: 'Professional modern slide deck presentation for thought leadership.', previewAsset: 'Photo from GFXTAB(45).jpg', isPremium: true, price: 19, tags: ['social', 'linkedin', 'slides'] },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const { favorites, toggleFavorite } = useCollectionStore()
  const { customAssets } = useMarketplaceStore()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(location.state?.category || 'web_ui') // Set category from redirect state if available
  const [sortBy, setSortBy] = useState('trending')
  const [previewText, setPreviewText] = useState('Grumpy wizards make toxic brew for the evil queen')
  const [photosAiOnly, setPhotosAiOnly] = useState(false)
  
  const [vectorsList, setVectorsList] = useState([])
  const [fontsList, setFontsList] = useState([])
  const [iconsList, setIconsList] = useState([])
  const [templatesList, setTemplatesList] = useState([])
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (location.state?.category) {
      setSelectedCategory(location.state.category)
    }
  }, [location.state?.category])

  // Fetch vectors dynamically from local backend if selected
  useEffect(() => {
    if (selectedCategory === 'vectors') {
      setLoading(true)
      setErrorMsg('')
      fetch('http://localhost:4000/vectors/list')
        .then((res) => {
          if (!res.ok) throw new Error('API server returned error')
          return res.json()
        })
        .then((data) => {
          if (data.success) {
            setVectorsList(data.vectors || [])
          } else {
            throw new Error(data.message || 'Failed to fetch')
          }
        })
        .catch((err) => {
          console.error(err)
          setErrorMsg('Failed to load local vectors directory from backend.')
          setVectorsList([])
        })
        .finally(() => setLoading(false))
    }
  }, [selectedCategory])

  // Fetch fonts dynamically from local backend if selected
  useEffect(() => {
    if (selectedCategory === 'fonts') {
      setLoading(true)
      setErrorMsg('')
      fetch('http://localhost:4000/fonts/list')
        .then((res) => {
          if (!res.ok) throw new Error('API server returned error')
          return res.json()
        })
        .then((data) => {
          if (data.success) {
            setFontsList(data.fonts || [])
          } else {
            throw new Error(data.message || 'Failed to fetch')
          }
        })
        .catch((err) => {
          console.error(err)
          setErrorMsg('Failed to load local fonts directory from backend. Running client fallback.')
          setFontsList(MOCK_FONTS)
        })
        .finally(() => setLoading(false))
    }
  }, [selectedCategory])

  // Fetch icons dynamically from local backend if selected
  useEffect(() => {
    if (selectedCategory === 'icons') {
      setLoading(true)
      setErrorMsg('')
      fetch('http://localhost:4000/icons/list')
        .then((res) => {
          if (!res.ok) throw new Error('API server returned error')
          return res.json()
        })
        .then((data) => {
          if (data.success) {
            setIconsList(data.icons || [])
          } else {
            throw new Error(data.message || 'Failed to fetch')
          }
        })
        .catch((err) => {
          console.error(err)
          setIconsList([])
        })
        .finally(() => setLoading(false))
    }
  }, [selectedCategory])

  // Fetch templates dynamically from local backend if selected
  useEffect(() => {
    if (selectedCategory === 'templates') {
      setLoading(true)
      setErrorMsg('')
      fetch('http://localhost:4000/templates/list')
        .then((res) => {
          if (!res.ok) throw new Error('API server returned error')
          return res.json()
        })
        .then((data) => {
          if (data.success) {
            setTemplatesList(data.templates || [])
          } else {
            throw new Error(data.message || 'Failed to fetch')
          }
        })
        .catch((err) => {
          console.error(err)
          setTemplatesList([])
        })
        .finally(() => setLoading(false))
    }
  }, [selectedCategory])

  // Get active list to render
  const getActiveList = () => {
    let baseList = []
    switch (selectedCategory) {
      case 'web_ui':
        baseList = []
        break
      case 'vectors':
        baseList = [] // Empty for inquiry default, as requested in Audio 1
        break
      case 'fonts':
        baseList = fontsList.length > 0 ? fontsList : MOCK_FONTS
        break
      case 'icons':
        baseList = []
        break
      case 'photos':
        baseList = []
        break
      case 'mailers':
        baseList = []
        break
      case 'mockups':
        baseList = PRODUCTS.filter(p => p.category !== 'apparel' && p.category !== 'print')
        break
      case 'logos':
        baseList = []
        break
      case 'social_posts':
        baseList = MOCK_SOCIAL_POSTS
        break
      case 'freebies':
        baseList = MOCK_FREEBIES
        break
      case 'artworks':
        baseList = PRODUCTS
        break
      default:
        baseList = []
    }
    const categoryCustoms = customAssets ? customAssets.filter(asset => asset.category === selectedCategory) : []
    return [...categoryCustoms, ...baseList]
  }

  // Filter & Sort list
  const getFilteredList = () => {
    let list = [...getActiveList()]

    // 1. Smart Search Query
    if (searchQuery.trim()) {
      const queryWords = searchQuery.toLowerCase().trim().split(/\s+/)
      list = list.filter(item => {
        const name = (item.name || '').toLowerCase()
        const desc = (item.description || '').toLowerCase()
        const tags = (item.tags || []).map(t => t.toLowerCase())
        return queryWords.every(word => 
          name.includes(word) ||
          desc.includes(word) ||
          tags.some(t => t.includes(word))
        )
      })
    }

    // 2. Sorting
    if (sortBy === 'trending') {
      list.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    } else if (sortBy === 'popular') {
      list.sort((a, b) => (b.downloads_count || b.price || 0) - (a.downloads_count || a.price || 0))
    } else if (sortBy === 'latest') {
      list.sort((a, b) => b.id.localeCompare(a.id))
    }

    return list
  }

  const activeList = getFilteredList()
  const userName = user?.name || 'Creator'

  const handleDownloadFont = (font) => {
    // Fonts are completely free - no credit checks or deductions!
    
    // Save download history
    useDownloadStore.getState().addDownload({
      assetId: font.id,
      assetName: font.name,
      previewUrl: 'font-asset'
    })

    const link = document.createElement('a')
    link.href = `http://localhost:4000/fonts/download/${encodeURIComponent(font.id)}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    notify.success('Download Complete', `${font.name} has been downloaded for free.`)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      
      {/* Marketplace Header Hero (Centered & Attractive) */}
      <div style={{ padding: 'var(--space-8) 0 var(--space-4)', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', alignItems: 'center' }}>
          <h1 style={{ fontSize: 'clamp(44px, 6vw, 68px)', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span className="animated-gradient-text" style={{ textShadow: '0 0 40px rgba(99,102,241,0.2)' }}>GFXTAB</span>
            <span style={{ fontSize: 'clamp(14px, 2.5vw, 20px)', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 4 }}>
              AI Studio & Marketplace
            </span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', maxWidth: 640, margin: 'var(--space-3) auto 0', lineHeight: 1.6 }}>
            {selectedCategory === 'artworks'
              ? "GFXTAB's official portfolio. Select any artwork to request custom modifications, sizing, or commercial deployment via WhatsApp inquiry."
              : "The ultimate AI-powered creator ecosystem. Browse our dynamic work portfolio, submit custom inquiries, or instantly search and download assets."}
          </p>
        </div>

        {/* Centered Global Search Bar */}
        <div style={{
          display: 'flex', gap: 12, width: '100%', maxWidth: 720, marginTop: 'var(--space-6)',
          position: 'relative', zIndex: 5, justifyContent: 'center'
        }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input 
              type="text" 
              placeholder={`Search ${selectedCategory.replace('_', ' ')} (e.g. bold, sans, stationery)...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '16px 16px 16px 48px',
                borderRadius: 'var(--radius-md)', background: 'var(--void-2)',
                border: '1px solid var(--glass-border)', color: 'var(--text-primary)',
                fontSize: 'var(--text-base)', boxShadow: 'var(--glow-card)'
              }}
            />
          </div>
          <GlowButton onClick={() => navigate('/upload')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 24px' }}>
            <Sparkles size={16} /> AI Mockup Generator
          </GlowButton>
        </div>
      </div>

      {/* Centered Categories Switcher */}
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 12, justifyContent: 'flex-start', width: '100%', scrollbarWidth: 'thin' }}>
        {[
          { id: 'web_ui', label: 'Web & UI' },
          { id: 'fonts', label: 'Fonts' },
          { id: 'vectors', label: 'Vectors (EPS)' },
          { id: 'icons', label: 'Icons' },
          { id: 'photos', label: 'Photos & Images' },
          { id: 'mailers', label: 'Mailers & Invites' },
          { id: 'mockups', label: 'Mockups' },
          { id: 'logos', label: 'Logos' },
          { id: 'social_posts', label: 'Social Media Posts' },
          { id: 'freebies', label: 'Freebies (Weekly)' },
          { id: 'artworks', label: 'Our Artworks' }
        ].map((cat) => (
          <motion.button
            key={cat.id}
            onClick={() => { setSelectedCategory(cat.id); setSearchQuery(''); }}
            whileHover={{ scale: 1.05, borderColor: 'var(--lime)', boxShadow: '0 0 10px rgba(200, 255, 0, 0.2)' }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '10px 18px', borderRadius: 'var(--radius-full)',
              background: selectedCategory === cat.id ? 'rgba(200, 255, 0, 0.15)' : 'var(--void-3)',
              border: '1px solid', borderColor: selectedCategory === cat.id ? 'var(--lime)' : 'var(--glass-border)',
              color: selectedCategory === cat.id ? 'var(--lime)' : '#e4e4e7',
              fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: 8,
              cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s var(--spring)',
              boxShadow: selectedCategory === cat.id ? '0 0 15px rgba(200, 255, 0, 0.3)' : 'none',
              fontWeight: selectedCategory === cat.id ? 600 : 400
            }}
          >
            {cat.label}
          </motion.button>
        ))}
      </div>

      {/* Sorting Sub-filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)', borderBottom: '1px solid var(--glass-border)', paddingBottom: 'var(--space-3)' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { id: 'trending', label: 'Trending' },
              { id: 'popular', label: 'Popular' },
              { id: 'latest', label: 'Latest' }
            ].map(sort => (
              <button
                key={sort.id}
                onClick={() => setSortBy(sort.id)}
                style={{
                  background: 'none', border: 'none',
                  color: sortBy === sort.id ? 'var(--text-primary)' : 'var(--text-dim)',
                  fontSize: 'var(--text-sm)', fontWeight: sortBy === sort.id ? 600 : 400,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                }}
              >
                {sortBy === sort.id && <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--lime)' }} />}
                {sort.label}
              </button>
            ))}
          </div>

          {/* AI Generated Toggle for Photos */}
          {selectedCategory === 'photos' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderLeft: '1px solid var(--glass-border)', paddingLeft: 16 }}>
              <span style={{ fontSize: 'var(--text-sm)', color: '#e4e4e7' }}>AI Generated Only</span>
              <button
                type="button"
                onClick={() => setPhotosAiOnly(!photosAiOnly)}
                style={{
                  width: 40, height: 20, borderRadius: 10,
                  background: photosAiOnly ? 'var(--lime)' : 'rgba(255,255,255,0.1)',
                  position: 'relative', border: 'none', cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                <motion.div
                  animate={{ x: photosAiOnly ? 22 : 2 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  style={{ width: 14, height: 14, borderRadius: 7, background: photosAiOnly ? '#020208' : '#888', position: 'absolute', top: 3 }}
                />
              </button>
            </div>
          )}
        </div>
        
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <SlidersHorizontal size={12} /> Sorting by {sortBy}
        </span>
      </div>

      {/* Backend error warning */}
      {errorMsg && (
        <div style={{ padding: '10px var(--space-4)', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-md)', color: 'var(--red)', fontSize: 'var(--text-xs)' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Font Tester Text Input */}
      {selectedCategory === 'fonts' && fontsList.length > 0 && (
        <GlassCard style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.08em' }}>
              Type to test fonts (Real-time Preview)
            </label>
            <input
              type="text"
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              placeholder="Type custom text to preview your typefaces..."
              style={{
                width: '100%', padding: '14px var(--space-4)', borderRadius: 'var(--radius-md)',
                background: 'var(--void-2)', border: '1px solid var(--glass-border)',
                color: 'var(--text-primary)', fontSize: 'var(--text-md)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
              }}
            />
          </div>
        </GlassCard>
      )}

      {/* Dynamic font-face style tags injection */}
      {selectedCategory === 'fonts' && fontsList.length > 0 && (
        <style>{`
          ${fontsList.map(f => `
            @font-face {
              font-family: "${f.id}";
              src: url("http://localhost:4000/fonts/download/${encodeURIComponent(f.id)}") format("${f.id.toLowerCase().endsWith('.otf') ? 'opentype' : 'truetype'}");
            }
          `).join('\n')}
        `}</style>
      )}

      {/* Social Media Posts Subscription Plans */}
      {selectedCategory === 'social_posts' && (
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', textAlign: 'center', marginBottom: 'var(--space-6)', fontFamily: 'var(--font-display)' }}>
            GFXTAB Social Media Design Subscriptions
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-4)' }}>
            {[
              { title: 'Starter Plan', price: '₹2,499', period: 'month', posts: '15 Custom Posts', features: ['High-contrast designs', 'Source files included', '2 Revision cycles', '48-hour delivery'] },
              { title: 'Growth Plan', price: '₹11,999', period: 'month', posts: '30 Custom Posts', features: ['Custom illustrations/infographics', 'Brand consistency matching', 'Unlimited revisions', 'Dedicated designer chat', 'Content calendar assistance'], popular: true },
              { title: 'Elite Plan', price: '₹24,999', period: 'month', posts: '60 Custom Posts', features: ['Priority 24h delivery', 'Custom video animations', 'Unlimited design assets', 'Full social media branding suite', 'Weekly strategy syncs'] }
            ].map((plan, i) => (
              <GlassCard key={i} style={{ padding: 'var(--space-5)', border: plan.popular ? '1px solid var(--lime)' : '1px solid var(--glass-border)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                {plan.popular && (
                  <span style={{ position: 'absolute', top: 12, right: 12, background: 'var(--lime)', color: '#020208', fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-full)', textTransform: 'uppercase' }}>
                    Most Popular
                  </span>
                )}
                <h3 style={{ fontSize: 'var(--text-md)', marginBottom: 8 }}>{plan.title}</h3>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--lime)', fontWeight: 600, marginBottom: 12 }}>{plan.posts}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 'var(--space-4)' }}>
                  <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>{plan.price}</span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)' }}>/month</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 var(--space-5) 0', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                  {plan.features.map((feat, idx) => (
                    <li key={idx} style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: 'var(--lime)' }}>✓</span> {feat}
                    </li>
                  ))}
                </ul>
                <GlowButton onClick={() => navigate('/contact', { state: { subject: `Social Media Design: ${plan.title}` } })} style={{ width: '100%', justifyContent: 'center' }}>
                  Subscribe Now
                </GlowButton>
              </GlassCard>
            ))}
          </div>
        </div>
      )}
      <div style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'flex-start', flexDirection: 'row', flexWrap: 'wrap', width: '100%' }}>
        <div style={{ flex: 1, minWidth: 300 }}>
          <AnimatePresence mode="wait">
            {loading ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
                <RefreshCw className="spin" size={32} color="var(--lime)" style={{ margin: '0 auto var(--space-4)' }} />
                <p style={{ color: 'var(--text-dim)' }}>Scanning and loading local assets catalog...</p>
              </div>
            ) : activeList.length === 0 ? (
              (() => {
                const categoryMeta = {
                  web_ui: {
                    title: 'No SaaS Layouts Stocked Yet',
                    desc: 'Currently, there are no pre-made Web & UI presentation templates listed. You can submit a custom brief to GFXTAB to generate one for you.',
                    btn: 'Submit custom UI inquiry',
                    icon: '🖥️'
                  },
                  vectors: {
                    title: 'No Vector EPS Stocks',
                    desc: 'The vector catalog has no active items on shelf. You can request customized scalable vector graphics or logo files.',
                    btn: 'Request vector file creation',
                    icon: '📐'
                  },
                  icons: {
                    title: 'No Icons Pack Uploaded Yet',
                    desc: 'Our premium custom design icons library is empty. Submit a subject brief to get custom icons built.',
                    btn: 'Inquire for custom icon set',
                    icon: '✨'
                  },
                  photos: {
                    title: 'No Photos & Images Uploaded Yet',
                    desc: 'Commercial photo listings and stock images are currently empty. You can request custom photography or AI image rendering.',
                    btn: 'Inquire for stock photography',
                    icon: '📷'
                  },
                  mailers: {
                    title: 'No Newsletter Templates',
                    desc: 'There are no active mailers or invitation layout templates available in this section. Custom newsletters can be requested.',
                    btn: 'Request custom newsletter layout',
                    icon: '✉️'
                  },
                  logos: {
                    title: 'No Brand Logo Templates',
                    desc: 'Minimal brand identity and logo templates are currently unstocked. Contact GFXTAB for custom brand mark creations.',
                    btn: 'Inquire for logo design',
                    icon: '🪪'
                  }
                }[selectedCategory] || {
                  title: 'No items found',
                  desc: 'No design assets found matching your search term or active filters. Try searching for something else.',
                  btn: 'Reset Filters & Search',
                  action: () => { setSearchQuery(''); setSortBy('trending'); },
                  icon: '🔍'
                }

                const actionHandler = categoryMeta.action || (() => navigate('/contact', { state: { subject: `Inquiry for ${selectedCategory.replace('_', ' ')}` } }));

                return (
                  <GlassCard style={{ padding: 'var(--space-12)', textAlign: 'center', maxWidth: 640, margin: '0 auto', border: '1px dashed rgba(200, 255, 0, 0.25)' }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: 'var(--space-4)' }}>{categoryMeta.icon}</div>
                    <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 8, color: '#ffffff', fontFamily: 'var(--font-display)' }}>{categoryMeta.title}</h3>
                    <p style={{ color: 'var(--text-dim)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)', maxWidth: 480, margin: '0 auto var(--space-6)', lineHeight: 1.6 }}>{categoryMeta.desc}</p>
                    <GlowButton onClick={actionHandler}>
                      {categoryMeta.btn}
                    </GlowButton>
                  </GlassCard>
                )
              })()
            ) : selectedCategory === 'fonts' ? (
              /* Premium Fonts Row list (No Images, Google Fonts Style) */
              <motion.div
                key={`${selectedCategory}-${sortBy}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', width: '100%' }}
              >
                {activeList.map((p) => {
                  const isFav = favorites.includes(p.id)
                  return (
                    <GlassCard 
                      key={p.id}
                      onClick={() => navigate(`/mockup/${p.id}`, { state: { assetType: selectedCategory } })}
                      style={{
                        padding: 'var(--space-5) var(--space-6)',
                        cursor: 'pointer',
                        display: 'grid',
                        gridTemplateColumns: '240px 1fr',
                        gap: 'var(--space-6)',
                        alignItems: 'center',
                        position: 'relative'
                      }}
                    >
                      {/* Left Column: Metadata & Actions */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderRight: '1px solid var(--glass-border)', paddingRight: 'var(--space-6)' }}>
                        <div>
                          <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{p.name}</h3>
                          <span style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase' }}>{p.fileSize || 'Free TTF/OTF'}</span>
                        </div>

                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <GlowButton 
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); handleDownloadFont(p); }} 
                            style={{ display: 'flex', gap: 6, alignItems: 'center', flex: 1, justifyContent: 'center' }}
                          >
                            <Download size={12} /> Download Font
                          </GlowButton>
                          
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(p.id); }}
                            style={{
                              width: 32, height: 32, borderRadius: '50%',
                              background: 'rgba(255,255,255,0.03)',
                              border: '1px solid var(--glass-border)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', color: isFav ? 'var(--red)' : 'var(--text-dim)',
                              transition: 'all 0.2s'
                            }}
                          >
                            <Heart size={14} fill={isFav ? 'var(--red)' : 'none'} color={isFav ? 'var(--red)' : 'currentColor'} />
                          </button>
                        </div>
                      </div>

                      {/* Right Column: Live Typography preview */}
                      <div style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', minHeight: 64 }}>
                        <span style={{
                          fontFamily: `"${p.id}"`,
                          fontSize: 'clamp(20px, 3.5vw, 42px)',
                          color: 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          width: '100%',
                          paddingLeft: 'var(--space-2)'
                        }}>
                          {previewText || p.name}
                        </span>
                      </div>
                    </GlassCard>
                  )
                })}
              </motion.div>
            ) : (
              /* Mockups grid layout (Other works) */
              <motion.div
                key={`${selectedCategory}-${sortBy}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-6)' }}
              >
                {activeList.map((p) => {
                  const isFav = favorites.includes(p.id)
                  const preview = p.previewAsset && (p.previewAsset.startsWith('data:') || p.previewAsset.startsWith('http'))
                    ? p.previewAsset
                    : (p.previewAsset ? `/assets/${p.previewAsset}` : '/assets/Artboard 1.jpg')
                  
                  return (
                    <GlassCard 
                      key={p.id}
                      onClick={() => navigate(`/mockup/${p.id}`, { state: { assetType: selectedCategory, assetData: p } })}
                      style={{ overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column', position: 'relative' }}
                    >
                      {p.isAi && (
                        <span style={{
                          position: 'absolute', top: 12, left: 12, zIndex: 10,
                          background: 'rgba(200, 255, 0, 0.2)', backdropFilter: 'blur(8px)',
                          border: '1px solid var(--lime)', color: 'var(--lime)',
                          fontSize: '9px', fontWeight: 700, padding: '2px 8px',
                          borderRadius: 'var(--radius-full)', textTransform: 'uppercase'
                        }}>
                          AI Generated
                        </span>
                      )}

                      {/* Favorite button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(p.id); }}
                        style={{
                          position: 'absolute', top: 12, right: 12, zIndex: 10,
                          width: 28, height: 28, borderRadius: '50%',
                          background: 'rgba(2,2,8,0.7)', backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', color: isFav ? 'var(--red)' : 'var(--text-dim)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.3)', transition: 'all 0.2s'
                        }}
                      >
                        <Heart size={14} fill={isFav ? 'var(--red)' : 'none'} color={isFav ? 'var(--red)' : 'currentColor'} />
                      </button>

                      <div style={{ aspectRatio: '4/3', overflow: 'hidden', background: 'var(--void-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                        {selectedCategory === 'vectors' || (p.previewAsset && p.previewAsset.startsWith('vector-svg')) ? (
                          <div style={{
                            width: '100%', height: '100%', 
                            background: 'linear-gradient(135deg, var(--void-3), #121216)', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            position: 'relative', overflow: 'hidden'
                          }}>
                            <div style={{
                              position: 'absolute', inset: 0,
                              background: `radial-gradient(circle at ${(p.id.charCodeAt(0) || 50) % 100}% ${(p.id.charCodeAt(1) || 50) % 100}%, rgba(200, 255, 0, 0.12), transparent 70%)`
                            }} />
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--lime)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 10px rgba(200, 255, 0, 0.5))', position: 'relative', zIndex: 2 }}>
                              {((p.id.charCodeAt(0) || 0) % 4) === 0 ? (
                                <>
                                  <circle cx="12" cy="12" r="10" />
                                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                                  <line x1="9" y1="9" x2="9.01" y2="9" />
                                  <line x1="15" y1="9" x2="15.01" y2="9" />
                                </>
                              ) : ((p.id.charCodeAt(0) || 0) % 4) === 1 ? (
                                <>
                                  <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
                                  <line x1="12" y1="22" x2="12" y2="15.5" />
                                  <polyline points="22 8.5 12 15.5 2 8.5" />
                                  <polyline points="2 15.5 12 8.5 22 15.5" />
                                </>
                              ) : ((p.id.charCodeAt(0) || 0) % 4) === 2 ? (
                                <>
                                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                </>
                              ) : (
                                <>
                                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                                  <path d="M12 6v6l4 2" />
                                </>
                              )}
                            </svg>
                          </div>
                        ) : (
                          <img 
                            src={preview} 
                            alt={p.name} 
                            loading="lazy"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        )}
                      </div>

                      {/* Text Details */}
                      <div style={{ padding: 'var(--space-4)', flex: 1, display: 'flex', flexDirection: 'column', justify: 'between' }}>
                        <div>
                          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{p.name}</h3>
                          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)', lineClamp: 2, overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 }}>{p.description}</p>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 'var(--space-2)' }}>
                          <span style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase' }}>{p.fileSize || p.category}</span>
                          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: p.isPremium ? 'var(--lime)' : 'var(--text-secondary)' }}>
                            {p.isPremium ? `₹${p.price}` : 'Free'}
                          </span>
                        </div>
                      </div>
                    </GlassCard>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {searchQuery.trim() !== '' && (
          <div style={{
            width: 310, minWidth: 310,
            background: 'var(--glass)', border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)',
            boxShadow: 'var(--glow-card)', display: 'flex', flexDirection: 'column', gap: 16,
            position: 'sticky', top: 96
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 10 }}>
              <span style={{ fontSize: '1.2rem' }}>🔍</span>
              <div>
                <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Web Search Insights</h4>
                <span style={{ fontSize: 9, color: 'var(--lime)', fontWeight: 600, letterSpacing: '0.05em' }}>AI REFERENCE MATRIX</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Google Fonts Matches</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { name: 'Inter Typeface', url: 'https://fonts.google.com/specimen/Inter', desc: 'Highly legible geometric UI font.' },
                  { name: 'Outfit Display', url: 'https://fonts.google.com/specimen/Outfit', desc: 'Elegant circular display font.' },
                  { name: 'Syne Sans', url: 'https://fonts.google.com/specimen/Syne', desc: 'Artistic expressive display typeface.' }
                ].map((f, idx) => (
                  <a key={idx} href={f.url} target="_blank" rel="noopener noreferrer" style={{
                    padding: '8px 12px', background: 'var(--void-3)', borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(255,255,255,0.04)', display: 'block', textDecoration: 'none',
                    transition: 'all 0.2s'
                  }}>
                    <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--lime)' }}>{f.name} ↗</div>
                    <div style={{ fontSize: 9, color: 'var(--text-secondary)', marginTop: 2 }}>{f.desc}</div>
                  </a>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>External Design References</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { name: 'Fonts In Use', url: 'https://fontsinuse.com', desc: 'Real-world typeface application archive.' },
                  { name: 'Typewolf Typography', url: 'https://www.typewolf.com', desc: 'Independent typography style guide.' },
                  { name: 'SVGRepo Search', url: `https://www.svgrepo.com/vectors/${encodeURIComponent(searchQuery)}`, desc: 'Find matching raw SVG vectors.' }
                ].map((r, idx) => (
                  <a key={idx} href={r.url} target="_blank" rel="noopener noreferrer" style={{
                    padding: '8px 12px', background: 'var(--void-3)', borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(255,255,255,0.04)', display: 'block', textDecoration: 'none',
                    transition: 'all 0.2s'
                  }}>
                    <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: '#ffffff' }}>{r.name} ↗</div>
                    <div style={{ fontSize: 9, color: 'var(--text-secondary)', marginTop: 2 }}>{r.desc}</div>
                  </a>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 'var(--space-2)', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
              <span style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: 4 }}>Design Tip</span>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                For search term <strong style={{ color: 'var(--lime)' }}>"{searchQuery}"</strong>, pairing structured sans-serif typefaces with high-contrast vector composition delivers clean, modern brand aesthetics.
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Platform Brand Footer */}
      <div style={{ textAlign: 'center', marginTop: 'var(--space-12)', padding: 'var(--space-6) 0', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)' }}>
          GFXTAB AI Studio & Marketplace © 2026. Production Version.
        </p>
      </div>

    </div>
  )
}
