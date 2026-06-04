import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, Plus, Edit, Trash, BarChart2, Users, Download, Star, DollarSign } from 'lucide-react'
import { GlassCard } from '@/components/ui/Card.jsx'
import { GlowButton, GhostButton } from '@/components/ui/Button.jsx'
import { FloatLabelInput } from '@/components/ui/Input.jsx'
import { notify } from '@/components/ui/Toast.jsx'
import { PRODUCTS } from '@/constants/products.js'
import { supabase, isSupabaseConfigured } from '@/supabase.js'

export default function CreatorDashboard() {
  const [activeTab, setActiveTab] = useState('uploads') // 'uploads' | 'analytics'
  const [templates, setTemplates] = useState(PRODUCTS.slice(0, 5))
  
  // Upload form states
  const [form, setForm] = useState({
    assetType: 'mockup', // 'mockup' | 'vector' | 'font' | 'icon' | 'template'
    name: '',
    category: 'apparel',
    description: '',
    tags: '',
    placementX: 200,
    placementY: 200,
    placementW: 300,
    placementH: 300,
    isPremium: false,
    price: 10
  })
  
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState(null)

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUploadAsset = async (e) => {
    e.preventDefault()
    if (!form.name || !file) {
      notify.error('Missing fields', 'Please enter a name and select a file to upload.')
      return
    }
    setUploading(true)

    const tagsArray = form.tags.split(',').map(t => t.trim()).filter(Boolean)
    const fileToBase64 = (fileObj) => new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(fileObj)
      reader.onload = () => resolve(reader.result)
      reader.onerror = error => reject(error)
    })

    try {
      const base64Data = await fileToBase64(file)
      let endpoint = 'http://localhost:4000/mockups/create'
      let bodyData = {}

      if (form.assetType === 'mockup') {
        const placementData = {
          x: Number(form.placementX),
          y: Number(form.placementY),
          width: Number(form.placementW),
          height: Number(form.placementH),
          rotation: 0,
          blend_mode: 'multiply'
        }
        endpoint = 'http://localhost:4000/mockups/create'
        bodyData = {
          name: form.name,
          category: form.category,
          description: form.description,
          tags: tagsArray,
          placement_data: placementData,
          image_url: base64Data,
          is_premium: form.isPremium,
          price: Number(form.price)
        }
      } else if (form.assetType === 'vector') {
        endpoint = 'http://localhost:4000/vectors/create'
        bodyData = {
          name: form.name,
          filename: file.name,
          fileData: base64Data
        }
      } else if (form.assetType === 'font') {
        endpoint = 'http://localhost:4000/fonts/create'
        bodyData = {
          name: form.name,
          filename: file.name,
          fileData: base64Data
        }
      } else if (form.assetType === 'icon') {
        endpoint = 'http://localhost:4000/icons/create'
        bodyData = {
          name: form.name,
          description: form.description,
          tags: tagsArray,
          image_url: base64Data,
          is_premium: form.isPremium,
          price: Number(form.price)
        }
      } else if (form.assetType === 'template') {
        endpoint = 'http://localhost:4000/templates/create'
        bodyData = {
          name: form.name,
          description: form.description,
          tags: tagsArray,
          image_url: base64Data,
          is_premium: form.isPremium,
          price: Number(form.price)
        }
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      })
      const data = await res.json()
      if (data.success) {
        notify.success('Asset uploaded successfully!', `Your ${form.assetType} is now live on the marketplace.`)
        // Reset form
        setForm({
          assetType: 'mockup',
          name: '',
          category: 'apparel',
          description: '',
          tags: '',
          placementX: 200,
          placementY: 200,
          placementW: 300,
          placementH: 300,
          isPremium: false,
          price: 10
        })
        setFile(null)
      } else {
        throw new Error(data.message || 'Failed to upload asset')
      }
    } catch (err) {
      console.error(err)
      notify.error('Upload Failed', err.message)
    }

    setUploading(false)
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 'var(--space-12)' }}>
      {/* Creator Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)' }}>Creator Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Manage your catalog, review analytics, and publish assets.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            onClick={() => setActiveTab('uploads')}
            style={{ 
              padding: '8px 16px', borderRadius: 'var(--radius-md)', 
              background: activeTab === 'uploads' ? 'var(--void-3)' : 'transparent',
              border: '1px solid', borderColor: activeTab === 'uploads' ? 'var(--glass-border-hover)' : 'transparent',
              color: activeTab === 'uploads' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: 500
            }}
          >
            Upload Asset
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            style={{ 
              padding: '8px 16px', borderRadius: 'var(--radius-md)', 
              background: activeTab === 'analytics' ? 'var(--void-3)' : 'transparent',
              border: '1px solid', borderColor: activeTab === 'analytics' ? 'var(--glass-border-hover)' : 'transparent',
              color: activeTab === 'analytics' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: 500
            }}
          >
            Analytics
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'uploads' && (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <GlassCard style={{ padding: 'var(--space-8)' }}>
            <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>Publish New Asset</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-6)' }}>
              Select the asset type and fill in the metadata. Uploaded assets immediately populate the marketplace catalog.
            </p>
            <form onSubmit={handleUploadAsset} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              
              {/* Asset Type Selector */}
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 8 }}>Asset Type</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {[
                    { id: 'mockup', label: 'Mockup Template' },
                    { id: 'vector', label: 'Vector Asset (EPS)' },
                    { id: 'font', label: 'Font Typography (TTF/OTF)' },
                    { id: 'icon', label: 'Icon Pack' },
                    { id: 'template', label: 'Print Templates' }
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, assetType: type.id }))}
                      style={{
                        padding: '10px 16px', borderRadius: 'var(--radius-md)',
                        background: form.assetType === type.id ? 'var(--lime-ghost)' : 'var(--void-3)',
                        border: '1px solid', borderColor: form.assetType === type.id ? 'var(--lime)' : 'var(--glass-border)',
                        color: form.assetType === type.id ? 'var(--lime)' : 'var(--text-secondary)',
                        fontSize: 'var(--text-xs)', cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* File Upload Area */}
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 8 }}>
                  {form.assetType === 'mockup' && 'Clean Mockup Backdrop Image'}
                  {form.assetType === 'vector' && 'Vector File (.eps)'}
                  {form.assetType === 'font' && 'Font File (.ttf, .otf)'}
                  {form.assetType === 'icon' && 'Icon Preview Image or Pack (.png, .svg)'}
                  {form.assetType === 'template' && 'Print Template File or Preview'}
                </label>
                <div style={{
                  border: '1px dashed var(--glass-border)', borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-8)', textAlign: 'center', background: 'var(--void-2)',
                  cursor: 'pointer', position: 'relative'
                }}>
                  <input 
                    type="file" 
                    onChange={handleFileChange} 
                    accept={
                      form.assetType === 'mockup' ? '.png,.jpg,.jpeg' :
                      form.assetType === 'vector' ? '.eps' :
                      form.assetType === 'font' ? '.ttf,.otf' :
                      form.assetType === 'icon' ? '.png,.svg' :
                      '.png,.jpg,.jpeg,.pdf'
                    }
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                  />
                  <Upload size={32} style={{ color: 'var(--text-dim)', marginBottom: 'var(--space-2)' }} />
                  {file ? (
                    <p style={{ color: 'var(--lime)', fontWeight: 600, fontSize: 'var(--text-sm)' }}>Selected: {file.name}</p>
                  ) : (
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                      Drag & drop or click to select your file
                    </p>
                  )}
                </div>
              </div>

              {/* Text metadata fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <FloatLabelInput 
                  id="template-name" 
                  label="Asset Name" 
                  value={form.name} 
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                />
                
                {form.assetType === 'mockup' ? (
                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-dim)', marginBottom: 4 }}>Category</label>
                    <select 
                      value={form.category} 
                      onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                      style={{
                        width: '100%', padding: '12px var(--space-4)', borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--glass-border)', background: 'var(--void-2)',
                        color: 'var(--text-primary)', fontSize: 'var(--text-sm)'
                      }}
                    >
                      <option value="apparel">Apparel</option>
                      <option value="print">Print & Posters</option>
                      <option value="stationery">Stationery</option>
                      <option value="packaging">Packaging</option>
                      <option value="accessories">Accessories</option>
                      <option value="merchandise">Merchandise</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-dim)', marginBottom: 4 }}>Price (INR)</label>
                    <select 
                      value={form.price} 
                      onChange={(e) => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                      style={{
                        width: '100%', padding: '12px var(--space-4)', borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--glass-border)', background: 'var(--void-2)',
                        color: 'var(--text-primary)', fontSize: 'var(--text-sm)'
                      }}
                    >
                      <option value={0}>Free (₹0)</option>
                      <option value={10}>₹10 (Cheap/Default)</option>
                      <option value={20}>₹20</option>
                      <option value={50}>₹50</option>
                      <option value={100}>₹100</option>
                      <option value={200}>₹200</option>
                    </select>
                  </div>
                )}
              </div>

              <FloatLabelInput 
                id="template-desc" 
                label="Description" 
                value={form.description} 
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              />

              <FloatLabelInput 
                id="template-tags" 
                label="Tags (comma-separated, e.g. bold, modern, poster)" 
                value={form.tags} 
                onChange={(e) => setForm(f => ({ ...f, tags: e.target.value }))}
              />

              {/* Printable Zone Mapping Coordinates (only for mockup) */}
              {form.assetType === 'mockup' && (
                <div>
                  <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>Mapping Placement Zone (Konva Canvas Bounds)</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-3)' }}>
                    <FloatLabelInput 
                      id="zone-x" label="X offset" type="number" 
                      value={form.placementX} onChange={(e) => setForm(f => ({ ...f, placementX: e.target.value }))}
                    />
                    <FloatLabelInput 
                      id="zone-y" label="Y offset" type="number" 
                      value={form.placementY} onChange={(e) => setForm(f => ({ ...f, placementY: e.target.value }))}
                    />
                    <FloatLabelInput 
                      id="zone-w" label="Width" type="number" 
                      value={form.placementW} onChange={(e) => setForm(f => ({ ...f, placementW: e.target.value }))}
                    />
                    <FloatLabelInput 
                      id="zone-h" label="Height" type="number" 
                      value={form.placementH} onChange={(e) => setForm(f => ({ ...f, placementH: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                <GlowButton type="submit" disabled={uploading} style={{ flex: 1, justifyContent: 'center' }}>
                  {uploading ? 'Publishing...' : 'Publish Asset'}
                </GlowButton>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Stats Summary Widgets */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)' }}>
            <GlassCard style={{ padding: 'var(--space-5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Total Revenue</span>
                <DollarSign size={20} color="var(--lime)" />
              </div>
              <h3 style={{ fontSize: 'var(--text-2xl)' }}>$1,424.00</h3>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--green)' }}>+14.5% vs last month</span>
            </GlassCard>

            <GlassCard style={{ padding: 'var(--space-5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Downloads</span>
                <Download size={20} color="var(--cryo)" />
              </div>
              <h3 style={{ fontSize: 'var(--text-2xl)' }}>4,821</h3>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--green)' }}>+8.2% vs last week</span>
            </GlassCard>

            <GlassCard style={{ padding: 'var(--space-5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Product Rating</span>
                <Star size={20} color="orange" />
              </div>
              <h3 style={{ fontSize: 'var(--text-2xl)' }}>4.92 / 5.0</h3>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Based on 88 ratings</span>
            </GlassCard>

            <GlassCard style={{ padding: 'var(--space-5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Active Buyers</span>
                <Users size={20} color="var(--violet)" />
              </div>
              <h3 style={{ fontSize: 'var(--text-2xl)' }}>912</h3>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--green)' }}>+18% growth</span>
            </GlassCard>
          </div>

          {/* Revenue Analytics Details */}
          <GlassCard style={{ padding: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart2 size={16} /> Asset Downloads Distribution
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', marginBottom: 4 }}>
                  <span>T-shirt templates</span>
                  <span>42% of downloads</span>
                </div>
                <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'var(--void-3)' }}>
                  <div style={{ width: '42%', height: '100%', borderRadius: 3, background: 'var(--lime)' }} />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', marginBottom: 4 }}>
                  <span>Flyer and Poster Print templates</span>
                  <span>35% of downloads</span>
                </div>
                <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'var(--void-3)' }}>
                  <div style={{ width: '35%', height: '100%', borderRadius: 3, background: 'var(--cryo)' }} />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', marginBottom: 4 }}>
                  <span>Brand Stationery templates</span>
                  <span>23% of downloads</span>
                </div>
                <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'var(--void-3)' }}>
                  <div style={{ width: '23%', height: '100%', borderRadius: 3, background: 'var(--violet)' }} />
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  )
}
