import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Search, Grid3x3, List, Plus, Download, Copy, Trash2, Edit2 } from 'lucide-react'
import { SearchInput } from '@/components/ui/Input.jsx'
import { GlowButton, GhostButton, IconButton } from '@/components/ui/Button.jsx'
import { StatusBadge, CategoryBadge } from '@/components/ui/Badge.jsx'
import { GlassCard } from '@/components/ui/Card.jsx'
import Tooltip from '@/components/ui/Tooltip.jsx'
import { notify } from '@/components/ui/Toast.jsx'
import { useProjectStore } from '@/store/index.js'
import { PRODUCTS } from '@/constants/products.js'

const FILTERS = ['All', 'Apparel', 'Print', 'Packaging', 'Merchandise']

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } }
}
const cardVariants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 22 } }
}

export default function Projects() {
  const navigate = useNavigate()
  const projects = useProjectStore((s) => s.projects)
  const fetchProjects = useProjectStore((s) => s.fetchProjects)
  const deleteProject = useProjectStore((s) => s.deleteProject)
  const addProject = useProjectStore((s) => s.addProject)

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [viewMode, setViewMode] = useState('grid')
  const [creatorMockups, setCreatorMockups] = useState([])

  useEffect(() => {
    fetchProjects()
    fetch('http://localhost:4000/mockups/list')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.mockups) {
          setCreatorMockups(data.mockups)
        }
      })
      .catch(err => console.error(err))
  }, [fetchProjects])

  const handleEdit = (project) => {
    const mockupId = project.mockup_id || project.mockupId
    const productObj = [...PRODUCTS, ...creatorMockups].find(p => p.id === mockupId)
    navigate('/editor', {
      state: {
        artworkUrl: project.artwork_url || project.artworkUrl,
        mockupId: mockupId,
        product: productObj,
        initialCanvasState: project.canvas_state || project.canvasState
      }
    })
  }

  const handleDelete = async (id) => {
    await deleteProject(id)
    notify.info('Project Deleted', 'The design project was removed.')
  }

  const handleDuplicate = async (project) => {
    notify.success('Duplicating project...')
    const duplicated = await addProject({
      name: `${project.name} (Copy)`,
      mockupId: project.mockup_id || project.mockupId,
      artworkUrl: project.artwork_url || project.artworkUrl,
      canvasState: project.canvas_state || project.canvasState
    })
    if (duplicated) {
      notify.success('Project Duplicated!')
    }
  }

  const getProductImage = (project) => {
    const mockupId = project.mockup_id || project.mockupId
    const product = [...PRODUCTS, ...creatorMockups].find(p => p.id === mockupId)
    if (!product) return `${import.meta.env.BASE_URL}assets/Artboard 1.jpg`
    return product.previewAsset.startsWith('http') || product.previewAsset.startsWith('data:')
      ? product.previewAsset
      : `${import.meta.env.BASE_URL}assets/${product.previewAsset}`
  }

  const getProductCategory = (project) => {
    const mockupId = project.mockup_id || project.mockupId
    const product = [...PRODUCTS, ...creatorMockups].find(p => p.id === mockupId)
    return product ? product.category : 'mockup'
  }

  const filtered = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const pCategory = getProductCategory(p)
    const matchFilter = filter === 'All' || pCategory.toLowerCase() === filter.toLowerCase()
    return matchSearch && matchFilter
  })

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 'var(--space-12)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 6 }}>
            Project Library
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Manage, duplicate, edit, or download your custom design compilations.
          </p>
        </div>
        <GlowButton id="projects-new-btn" onClick={() => navigate('/upload')} icon={<Plus size={16} />}>
          Create Design
        </GlowButton>
      </div>

      {/* Filters + Search */}
      <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-6)', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 200, maxWidth: 300 }}>
          <SearchInput
            id="projects-search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects..."
          />
        </div>

        <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid',
                borderColor: filter === f ? 'var(--lime)' : 'var(--glass-border)',
                background: filter === f ? 'var(--lime-ghost)' : 'var(--void-3)',
                color: filter === f ? 'var(--lime)' : 'var(--text-secondary)',
                fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s', whiteSpace: 'nowrap'
              }}
            >
              {f}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
          <IconButton size={34} active={viewMode === 'grid'} onClick={() => setViewMode('grid')} tooltip="Grid view">
            <Grid3x3 size={14} />
          </IconButton>
          <IconButton size={34} active={viewMode === 'list'} onClick={() => setViewMode('list')} tooltip="List view">
            <List size={14} />
          </IconButton>
        </div>
      </div>

      {/* Projects Grid */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <GlassCard style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>🗂️</div>
            <h3 style={{ marginBottom: 8, fontSize: 'var(--text-base)' }}>No design projects found</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-5)' }}>Create a mockup design or adjust filters to begin.</p>
            <GhostButton onClick={() => navigate('/upload')}>Create Mockup Design →</GhostButton>
          </GlassCard>
        ) : (
          <motion.div
            key={`${viewMode}-${filter}`}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            style={{
              display: viewMode === 'grid' ? 'grid' : 'flex',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              flexDirection: 'column',
              gap: 'var(--space-6)',
            }}
          >
            {filtered.map((project) => {
              const bgImg = getProductImage(project)
              const cat = getProductCategory(project)

              return viewMode === 'grid' ? (
                <motion.div
                  key={project.id}
                  variants={cardVariants}
                  whileHover={{ y: -6 }}
                  style={{
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    border: '1px solid var(--glass-border)',
                    background: 'var(--glass)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onClick={() => handleEdit(project)}
                >
                  {/* Image Preview */}
                  <div style={{ aspectRatio: '4/3', overflow: 'hidden', background: 'var(--void-2)', position: 'relative' }}>
                    <img
                      src={bgImg}
                      alt={project.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    
                    {/* Actions overlay */}
                    <div style={{ position: 'absolute', bottom: 8, right: 8, display: 'flex', gap: 6 }}>
                      <Tooltip content="Edit Design">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEdit(project) }}
                          style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(8,8,12,0.9)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        >
                          <Edit2 size={12} color="var(--text-secondary)" />
                        </button>
                      </Tooltip>
                      <Tooltip content="Duplicate">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDuplicate(project) }}
                          style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(8,8,12,0.9)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        >
                          <Copy size={12} color="var(--text-secondary)" />
                        </button>
                      </Tooltip>
                      <Tooltip content="Delete">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(project.id) }}
                          style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(8,8,12,0.9)', border: '1px solid rgba(255,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        >
                          <Trash2 size={12} color="var(--red)" />
                        </button>
                      </Tooltip>
                    </div>
                  </div>

                  {/* Description Box */}
                  <div style={{ padding: 'var(--space-4)', flex: 1, display: 'flex', flexDirection: 'column', justify: 'between' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {project.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 'var(--space-2)' }}>
                      <CategoryBadge icon="📐">{cat}</CategoryBadge>
                      <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>
                        {project.created_at ? new Date(project.created_at).toLocaleDateString() : 'Draft'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                // List view item
                <motion.div
                  key={project.id}
                  variants={cardVariants}
                  whileHover={{ x: 4 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
                    padding: 'var(--space-3) var(--space-4)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--glass-border)',
                    background: 'var(--glass)',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleEdit(project)}
                >
                  <div style={{ width: 64, height: 48, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: 'var(--void-2)' }}>
                    <img src={bgImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontWeight: 600, fontSize: 'var(--text-sm)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.name}</h3>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', marginTop: 2 }}>{cat}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <IconButton size={28} onClick={(e) => { e.stopPropagation(); handleEdit(project) }}><Edit2 size={12} /></IconButton>
                    <IconButton size={28} onClick={(e) => { e.stopPropagation(); handleDuplicate(project) }}><Copy size={12} /></IconButton>
                    <IconButton size={28} onClick={(e) => { e.stopPropagation(); handleDelete(project.id) }}><Trash2 size={12} style={{ color: 'var(--red)' }} /></IconButton>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
