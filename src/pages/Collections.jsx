import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, FolderPlus, Trash2, ArrowRight, Star, Folder } from 'lucide-react'
import { useCollectionStore } from '@/store/index.js'
import { GlassCard } from '@/components/ui/Card.jsx'
import { GlowButton, GhostButton, IconButton } from '@/components/ui/Button.jsx'
import { FloatLabelInput } from '@/components/ui/Input.jsx'
import { PRODUCTS } from '@/constants/products.js'
import { notify } from '@/components/ui/Toast.jsx'
import { useNavigate } from 'react-router-dom'

export default function Collections() {
  const navigate = useNavigate()
  const { favorites, collections, createCollection, toggleFavorite, removeFromCollection } = useCollectionStore()
  
  const [newCollName, setNewCollName] = useState('')
  const [newCollDesc, setNewCollDesc] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [selectedCollection, setSelectedCollection] = useState(null) // null means favorites, or a collection object

  const handleCreateCollection = (e) => {
    e.preventDefault()
    if (!newCollName.trim()) return
    createCollection(newCollName, newCollDesc)
    setNewCollName('')
    setNewCollDesc('')
    setShowCreate(false)
  }

  // Resolve assets mapped to favorites/collections
  const getAssetDetails = (id) => {
    return PRODUCTS.find(p => p.id === id) || {
      id,
      name: 'Vector Asset',
      category: 'vector',
      description: 'Shutterstock vector file asset.',
      previewAsset: 'Artboard 1.jpg',
      tags: []
    }
  }

  const activeAssets = selectedCollection 
    ? selectedCollection.assets.map(id => getAssetDetails(id))
    : favorites.map(id => getAssetDetails(id))

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
            Saved & Collections
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Curate moodboards, bookmarks, and custom asset collections for your projects.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <GlowButton onClick={() => setShowCreate(!showCreate)} icon={<FolderPlus size={16} />}>
            Create Moodboard
          </GlowButton>
        </div>
      </div>

      {/* Create Modal Form */}
      {showCreate && (
        <GlassCard style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)', maxWidth: 500 }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>Create New Collection</h3>
          <form onSubmit={handleCreateCollection} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <FloatLabelInput id="coll-name" label="Collection Name" value={newCollName} onChange={e => setNewCollName(e.target.value)} />
            <FloatLabelInput id="coll-desc" label="Description (Optional)" value={newCollDesc} onChange={e => setNewCollDesc(e.target.value)} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <GhostButton size="sm" onClick={() => setShowCreate(false)}>Cancel</GhostButton>
              <GlowButton size="sm" type="submit">Create</GlowButton>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Layout Tabs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 'var(--space-6)', alignItems: 'flex-start' }}>
        
        {/* Left Nav Menu: Collections & Favorites */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {/* Favorites */}
          <button
            onClick={() => setSelectedCollection(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', borderRadius: 'var(--radius-md)',
              background: selectedCollection === null ? 'rgba(200,255,0,0.08)' : 'transparent',
              border: `1px solid ${selectedCollection === null ? 'rgba(200,255,0,0.18)' : 'transparent'}`,
              color: selectedCollection === null ? 'var(--lime)' : 'var(--text-secondary)',
              fontWeight: selectedCollection === null ? 600 : 400,
              cursor: 'pointer', textAlign: 'left', fontSize: 'var(--text-sm)'
            }}
          >
            <Heart size={16} fill={selectedCollection === null ? 'var(--lime)' : 'none'} />
            Favorites ({favorites.length})
          </button>
          
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '8px 0' }} />
          
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', paddingLeft: 12, marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' }}>
            My Moodboards
          </div>

          {/* User Collections */}
          {collections.length === 0 ? (
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', paddingLeft: 12 }}>No collections created.</span>
          ) : (
            collections.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCollection(c)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', borderRadius: 'var(--radius-md)',
                  background: selectedCollection?.id === c.id ? 'rgba(200,255,0,0.08)' : 'transparent',
                  border: `1px solid ${selectedCollection?.id === c.id ? 'rgba(200,255,0,0.18)' : 'transparent'}`,
                  color: selectedCollection?.id === c.id ? 'var(--lime)' : 'var(--text-secondary)',
                  fontWeight: selectedCollection?.id === c.id ? 600 : 400,
                  cursor: 'pointer', textAlign: 'left', fontSize: 'var(--text-sm)',
                  justifyContent: 'space-between'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <Folder size={16} />
                  {c.name}
                </span>
                <span style={{ fontSize: 10, opacity: 0.6 }}>({c.assets.length})</span>
              </button>
            ))
          )}
        </div>

        {/* Right Active Grid View */}
        <div>
          <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 10 }}>
            {selectedCollection ? `${selectedCollection.name}` : 'Favorites'} 
            {selectedCollection && <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-dim)', fontWeight: 400 }}> — {selectedCollection.description}</span>}
          </h2>

          <AnimatePresence mode="wait">
            {activeAssets.length === 0 ? (
              <GlassCard style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>📂</div>
                <h3 style={{ marginBottom: 8, fontSize: 'var(--text-base)' }}>Collection is empty</h3>
                <p style={{ color: 'var(--text-dim)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-5)' }}>
                  Add assets to your moodboards by clicking the heart button on marketplace elements.
                </p>
                <GhostButton onClick={() => navigate('/dashboard')}>Search Assets →</GhostButton>
              </GlassCard>
            ) : (
              <motion.div
                key={selectedCollection ? selectedCollection.id : 'favs'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-6)' }}
              >
                {activeAssets.map((asset) => {
                  const preview = asset.previewAsset ? `/assets/${asset.previewAsset}` : '/assets/Artboard 1.jpg'
                  return (
                    <GlassCard
                      key={asset.id}
                      style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                    >
                      <div style={{ aspectRatio: '4/3', overflow: 'hidden', background: 'var(--void-2)' }}>
                        <img src={preview} alt={asset.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ padding: 'var(--space-4)', flex: 1, display: 'flex', flexDirection: 'column', justify: 'between' }}>
                        <div>
                          <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{asset.name}</h4>
                          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>{asset.description}</p>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 'var(--space-3)' }}>
                          <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>{asset.category}</span>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {selectedCollection ? (
                              <Tooltip content="Remove from Moodboard">
                                <IconButton size={24} onClick={() => removeFromCollection(selectedCollection.id, asset.id)}>
                                  <Trash2 size={12} style={{ color: 'var(--red)' }} />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <Tooltip content="Remove Favorite">
                                <IconButton size={24} onClick={() => toggleFavorite(asset.id)}>
                                  <Trash2 size={12} style={{ color: 'var(--red)' }} />
                                </IconButton>
                              </Tooltip>
                            )}
                            <GhostButton size="xs" color="lime" onClick={() => navigate(`/mockup/${asset.id}`)}>
                              View →
                            </GhostButton>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </motion.div>
  )
}
