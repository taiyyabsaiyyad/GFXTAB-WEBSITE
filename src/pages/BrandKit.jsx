import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Palette, Edit, Trash2, Check } from 'lucide-react'
import { GlowButton, GhostButton, IconButton } from '@/components/ui/Button.jsx'
import { GlassCard } from '@/components/ui/Card.jsx'
import { FloatLabelInput } from '@/components/ui/Input.jsx'
import { StatusBadge } from '@/components/ui/Badge.jsx'
import { useBrandStore } from '@/store/index.js'
import { notify } from '@/components/ui/Toast.jsx'
import Modal from '@/components/ui/Modal.jsx'

const DEFAULT_BRAND = {
  name: '',
  tagline: '',
  primaryColor: '#C8FF00',
  secondaryColor: '#7B2FFF',
  font: 'Clash Display',
  email: 'brand@gfxtab.com',
}

function BrandForm({ brand, onSave, onCancel }) {
  const [form, setForm] = useState(brand || DEFAULT_BRAND)

  const update = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))
  const updateColor = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <FloatLabelInput id="brand-name" label="Brand Name" value={form.name} onChange={update('name')} />
      <FloatLabelInput id="brand-tagline" label="Tagline" value={form.tagline} onChange={update('tagline')} />
      <FloatLabelInput id="brand-email" label="Email" type="email" value={form.email} onChange={update('email')} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', marginBottom: 8 }}>Primary Color</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="color" value={form.primaryColor} onChange={updateColor('primaryColor')}
              style={{ width: 40, height: 40, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', background: 'none' }} />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{form.primaryColor}</span>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', marginBottom: 8 }}>Secondary Color</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="color" value={form.secondaryColor} onChange={updateColor('secondaryColor')}
              style={{ width: 40, height: 40, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', background: 'none' }} />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{form.secondaryColor}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', paddingTop: 'var(--space-4)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <GhostButton size="sm" onClick={onCancel}>Cancel</GhostButton>
        <GlowButton size="sm" onClick={() => onSave(form)} icon={<Check size={14} />}>Save Brand</GlowButton>
      </div>
    </div>
  )
}

export default function BrandKit() {
  const { brands, addBrand, updateBrand, deleteBrand, activeBrandId, setActiveBrand } = useBrandStore()
  const [showModal, setShowModal] = useState(false)
  const [editingBrand, setEditingBrand] = useState(null)
  const activeBrand = brands.find(b => b.id === activeBrandId) || brands[0]

  const handleSave = (form) => {
    if (editingBrand?.id) {
      updateBrand(editingBrand.id, form)
      notify.success('Brand updated!', form.name)
    } else {
      addBrand(form)
      notify.success('Brand created!', `${form.name} is ready to use.`)
    }
    setShowModal(false)
    setEditingBrand(null)
  }

  const handleEdit = (brand) => {
    setEditingBrand(brand)
    setShowModal(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 22 }}
      style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 'var(--space-12)' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', marginBottom: 6 }}>
            Brand <span className="gradient-lime">Kit</span>
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: 'var(--text-sm)' }}>
            Manage your brand identities and design systems
          </p>
        </div>
        <GlowButton id="brandkit-create-btn" icon={<Plus size={16} />} onClick={() => { setEditingBrand(null); setShowModal(true) }}>
          New Brand
        </GlowButton>
      </div>

      {brands.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: 'var(--space-16)',
          border: '1px dashed rgba(200,255,0,0.15)', borderRadius: 'var(--radius-xl)',
        }}>
          <Palette size={40} color="var(--text-dim)" style={{ margin: '0 auto var(--space-4)' }} />
          <h3 style={{ marginBottom: 8 }}>No brands yet</h3>
          <p style={{ color: 'var(--text-dim)', marginBottom: 'var(--space-5)' }}>Create your first brand kit to maintain consistent branding across all mockups</p>
          <GlowButton onClick={() => setShowModal(true)}>Create Brand Kit</GlowButton>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          {brands.map((brand) => (
            <motion.div
              key={brand.id}
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <GlassCard hoverable={false} style={{ position: 'relative', overflow: 'hidden' }}>
                {/* Color strip */}
                <div style={{
                  height: 4, marginBottom: 'var(--space-4)',
                  background: `linear-gradient(90deg, ${brand.primaryColor}, ${brand.secondaryColor})`,
                  borderRadius: 2,
                  boxShadow: `0 0 12px ${brand.primaryColor}60`,
                }} />

                {/* Brand info */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-lg)', marginBottom: 2 }}>
                      {brand.name}
                    </div>
                    {brand.tagline && (
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)' }}>{brand.tagline}</div>
                    )}
                  </div>
                  {activeBrandId === brand.id && (
                    <StatusBadge status="active" dot>Active</StatusBadge>
                  )}
                </div>

                {/* Colors */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--space-4)' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: brand.primaryColor, border: '1px solid rgba(255,255,255,0.1)', marginBottom: 3 }} />
                    <div style={{ fontSize: 9, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{brand.primaryColor}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: brand.secondaryColor, border: '1px solid rgba(255,255,255,0.1)', marginBottom: 3 }} />
                    <div style={{ fontSize: 9, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{brand.secondaryColor}</div>
                  </div>
                </div>

                {brand.email && (
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', marginBottom: 'var(--space-4)' }}>
                    📧 {brand.email}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                  <GhostButton size="sm" color="lime" onClick={() => setActiveBrand(brand.id)}>
                    {activeBrandId === brand.id ? '✓ Active' : 'Set Active'}
                  </GhostButton>
                  <IconButton size={32} onClick={() => handleEdit(brand)} tooltip="Edit">
                    <Edit size={13} />
                  </IconButton>
                  <IconButton size={32} onClick={() => { deleteBrand(brand.id); notify.info('Brand deleted') }} tooltip="Delete">
                    <Trash2 size={13} style={{ color: 'var(--red)' }} />
                  </IconButton>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* Brand Guidelines Presentation Panel */}
      {activeBrand && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 24 }}
          style={{ marginTop: 'var(--space-10)' }}
        >
          <GlassCard hoverable={false} style={{ padding: 'var(--space-8)' }}>
            <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: 'var(--space-4)', marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--lime)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>STITCH AI Brand Engine</span>
                <h2 style={{ fontSize: 'var(--text-xl)' }}>Brand Style Guide: {activeBrand.name}</h2>
              </div>
              <StatusBadge status="success">Active Guidelines</StatusBadge>
            </div>

            {/* Grid for Guidelines Sections */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'var(--space-6)' }}>
              
              {/* Left Column: Color system & Typography & Mock logo generator */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                {/* Logo Generator widget */}
                <div style={{ background: 'var(--void-2)', padding: 'var(--space-5)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                  <h4 style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)' }}>Minimalist Brand Logo mark</h4>
                  <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                    {/* SVG logo preview */}
                    <div style={{ width: 90, height: 90, borderRadius: 'var(--radius-sm)', background: 'var(--void-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <svg width="64" height="64" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke={activeBrand.primaryColor} strokeWidth="3" />
                        <circle cx="50" cy="50" r="36" fill="none" stroke={activeBrand.secondaryColor} strokeWidth="1.5" strokeDasharray="4 3" />
                        <text x="50" y="55" fontFamily="var(--font-display)" fontWeight="bold" fontSize="16" fill="#ffffff" text-anchor="middle">
                          {(activeBrand.name || 'GBK').slice(0, 3).toUpperCase()}
                        </text>
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', marginBottom: 4 }}>LOGO TYPE</div>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Abstract Circular Badge</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 4 }}>Automatically generated brand mark based on active identity settings. Use in mockup editor.</div>
                    </div>
                  </div>
                </div>

                {/* Color Codes Detail */}
                <div>
                  <h4 style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)' }}>Color Coordinates & Palette</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                    <div style={{ border: '1px solid var(--glass-border)', padding: 12, borderRadius: 'var(--radius-sm)', background: 'var(--void-3)' }}>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 600 }}>Primary Accent</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-md)', color: activeBrand.primaryColor, margin: '4px 0', fontWeight: 700 }}>{activeBrand.primaryColor}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Hex color notation. Active ratio: 60% weight.</div>
                    </div>
                    <div style={{ border: '1px solid var(--glass-border)', padding: 12, borderRadius: 'var(--radius-sm)', background: 'var(--void-3)' }}>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 600 }}>Secondary Accent</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-md)', color: activeBrand.secondaryColor, margin: '4px 0', fontWeight: 700 }}>{activeBrand.secondaryColor}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Hex color notation. Active ratio: 30% weight.</div>
                    </div>
                  </div>
                </div>

                {/* Typography System */}
                <div>
                  <h4 style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)' }}>Typography Styles Scale</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, border: '1px solid var(--glass-border)', padding: 'var(--space-4)', borderRadius: 'var(--radius-sm)', background: 'var(--void-3)' }}>
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Header Font Family: {activeBrand.font || 'Clash Display'}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: '#ffffff' }}>The Quick Brown Fox Jumps</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Body Typography: Inter/Sans</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Standard layout copies optimize for readability at 15px/1.6 line height.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Mini SVG templates mapping (Stitch AI previews) */}
              <div>
                <h4 style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)' }}>Real-time Mockups Guideline Previews</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  
                  {/* Business Card Preview */}
                  <div style={{ border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: 12, background: 'var(--void-2)' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginBottom: 8, textTransform: 'uppercase' }}>Asset 1: Corporate Business Card</div>
                    <div style={{ width: '100%', height: 100, borderRadius: 8, background: '#0e0e12', border: '1px solid rgba(255,255,255,0.06)', position: 'relative', display: 'flex', alignItems: 'center', padding: '0 var(--space-4)', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', right: -20, bottom: -20, width: 90, height: 90, borderRadius: '50%', background: `radial-gradient(circle, ${activeBrand.primaryColor}20, transparent)` }} />
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <svg width="32" height="32" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="42" fill="none" stroke={activeBrand.primaryColor} strokeWidth="4" />
                          <circle cx="50" cy="50" r="32" fill="none" stroke={activeBrand.secondaryColor} strokeWidth="2" strokeDasharray="3 3" />
                        </svg>
                        <div>
                          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: '#ffffff' }}>{activeBrand.name || 'Brand Name'}</div>
                          <div style={{ fontSize: '9px', color: 'var(--text-dim)' }}>{activeBrand.tagline || 'Tagline text'}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notebook Preview */}
                  <div style={{ border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: 12, background: 'var(--void-2)' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginBottom: 8, textTransform: 'uppercase' }}>Asset 2: Hardcover Journal Notebook</div>
                    <div style={{ width: '100%', height: 100, borderRadius: 8, background: `linear-gradient(135deg, ${activeBrand.secondaryColor}40, #09090b)`, border: '1px solid rgba(255,255,255,0.06)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 8, height: '100%', background: '#09090b', position: 'absolute', left: 0, top: 0, borderRight: '1px solid rgba(255,255,255,0.1)' }} />
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                        <svg width="24" height="24" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="42" fill="none" stroke={activeBrand.primaryColor} strokeWidth="6" />
                        </svg>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: '#ffffff' }}>{activeBrand.name || 'Brand Name'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Ceramic Mug Preview */}
                  <div style={{ border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: 12, background: 'var(--void-2)' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginBottom: 8, textTransform: 'uppercase' }}>Asset 3: Ceramic Mug Placement</div>
                    <div style={{ width: '100%', height: 100, borderRadius: 8, background: '#0e0e12', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="120" height="70" viewBox="0 0 120 70" fill="none">
                        <rect x="30" y="5" width="50" height="60" rx="6" fill="#222" stroke={activeBrand.primaryColor} strokeWidth="2" />
                        <path d="M80,20 C95,20 95,50 80,50" stroke={activeBrand.primaryColor} strokeWidth="3" />
                        <circle cx="55" cy="35" r="14" fill="none" stroke={activeBrand.secondaryColor} strokeWidth="1.5" />
                        <text x="55" y="38" fontSize="8" fill="#ffffff" text-anchor="middle" fontWeight="bold">
                          {(activeBrand.name || 'GBK').slice(0, 3).toUpperCase()}
                        </text>
                      </svg>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </GlassCard>
        </motion.div>
      )}

      <Modal
        id="brand-modal"
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingBrand(null) }}
        title={editingBrand ? 'Edit Brand' : 'Create Brand Kit'}
        size="sm"
      >
        <BrandForm
          brand={editingBrand}
          onSave={handleSave}
          onCancel={() => { setShowModal(false); setEditingBrand(null) }}
        />
      </Modal>
    </motion.div>
  )
}
