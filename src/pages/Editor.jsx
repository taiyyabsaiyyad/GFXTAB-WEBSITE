import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import MockupEditor from '@/components/mockup/MockupEditor.jsx'
import { useEditorStore } from '@/store/index.js'
import { GhostButton } from '@/components/ui/Button.jsx'
import { StatusBadge } from '@/components/ui/Badge.jsx'
import { PRODUCTS } from '@/constants/products.js'

export default function Editor() {
  const location = useLocation()
  const navigate = useNavigate()
  const setProduct = useEditorStore((s) => s.setProduct)
  const setArtwork = useEditorStore((s) => s.setArtwork)
  
  const { product, artwork } = useEditorStore()

  useEffect(() => {
    if (location.state?.artworkUrl && location.state?.mockupId) {
      const selectedProduct = location.state.product || PRODUCTS.find((p) => p.id === location.state.mockupId)
      if (selectedProduct) {
        setProduct(selectedProduct)
        const initialState = location.state.initialCanvasState
        setArtwork({
          url: location.state.artworkUrl,
          x: initialState?.x !== undefined ? initialState.x : null,
          y: initialState?.y !== undefined ? initialState.y : null,
          scale: initialState?.scale !== undefined ? initialState.scale : 1,
          rotation: initialState?.rotation !== undefined ? initialState.rotation : 0,
          opacity: initialState?.opacity !== undefined ? initialState.opacity : 1,
          blendMode: initialState?.blendMode || 'source-over',
          showShadow: initialState?.showShadow || false
        })
      }
    }
  }, [location.state, setProduct, setArtwork])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 22 }}
      style={{ maxWidth: 1100 }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <GhostButton size="sm" color="white" onClick={() => navigate('/upload')}>
              ← Back
            </GhostButton>
            {product && <StatusBadge status="active" dot>{product.name}</StatusBadge>}
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)' }}>
            Mockup <span className="gradient-lime">Editor</span>
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <GhostButton
            size="sm"
            color="lime"
            onClick={() => {
              const canvas = useEditorStore.getState().canvasRef
              if (canvas) {
                try {
                  const dataUrl = canvas.toDataURL({ pixelRatio: 2 })
                  useEditorStore.getState().setGeneratedPreviewUrl(dataUrl)
                } catch (e) {
                  console.error('Failed to export canvas:', e)
                }
              }
              navigate('/preview')
            }}
          >
            Preview Full Screen →
          </GhostButton>
        </div>
      </div>

      {!artwork && !product ? (
        <div style={{
          textAlign: 'center', padding: 'var(--space-16)',
          border: '1px dashed rgba(200,255,0,0.15)',
          borderRadius: 'var(--radius-xl)',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>🎨</div>
          <h3 style={{ marginBottom: 8 }}>No mockup loaded</h3>
          <p style={{ color: 'var(--text-dim)', marginBottom: 'var(--space-5)' }}>Upload your artwork first and select a product to begin editing</p>
          <GhostButton onClick={() => navigate('/upload')}>Go to Upload →</GhostButton>
        </div>
      ) : (
        <MockupEditor />
      )}
    </motion.div>
  )
}
