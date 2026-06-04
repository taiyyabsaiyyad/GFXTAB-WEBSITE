import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { ORBIT_PRODUCTS } from '@/constants/products.js'
import { useEditorStore } from '@/store/index.js'
import FloatWrapper from '@/components/animations/FloatWrapper.jsx'

// Product icon mapping
const PRODUCT_ICONS = {
  'tshirt-crew': '👕',
  'book-cover': '📚',
  'mug-ceramic': '☕',
  'poster-a3': '🗒️',
  'business-card': '🪪',
}

const PRODUCT_COLORS = {
  'tshirt-crew': '#C8FF00',
  'book-cover': '#00D4FF',
  'mug-ceramic': '#FF8C00',
  'poster-a3': '#7B2FFF',
  'business-card': '#FF4444',
}

const ORBIT_RADIUS = 220 // px
const CARD_SIZE = 100   // px

export default function SuggestionOrbit({ artworkUrl, analysisResult, visible }) {
  const navigate = useNavigate()
  const setProduct = useEditorStore((s) => s.setProduct)
  const setArtwork = useEditorStore((s) => s.setArtwork)

  const [hoveredId, setHoveredId] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [orbitPaused, setOrbitPaused] = useState(false)
  const [orbitAngle, setOrbitAngle] = useState(0)
  const rafRef = useRef(null)
  const angleRef = useRef(0)
  const lastTimeRef = useRef(null)

  // Manual orbit animation using RAF (for pause-on-hover)
  useEffect(() => {
    if (!visible) return

    const animate = (time) => {
      if (!lastTimeRef.current) lastTimeRef.current = time
      const dt = time - lastTimeRef.current
      lastTimeRef.current = time

      if (!orbitPaused) {
        angleRef.current = (angleRef.current + dt * 0.018) % 360
        setOrbitAngle(angleRef.current)
      }
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [visible, orbitPaused])

  const handleSelect = (product) => {
    setSelectedId(product.id)
    setProduct({
      id: product.id,
      name: product.name,
      category: product.category,
      colorVariant: product.defaultColor,
    })
    if (artworkUrl) {
      setArtwork({
        url: artworkUrl,
        x: 150, y: 150,
        scale: 0.6, rotation: 0, opacity: 1, blendMode: 'normal',
      })
    }
    // Fly to editor
    setTimeout(() => navigate('/editor'), 500)
  }

  if (!visible) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ type: 'spring', stiffness: 180, damping: 22, delay: 0.2 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-8)',
        padding: 'var(--space-8) 0',
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        style={{ textAlign: 'center' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 8 }}>
          <Sparkles size={16} color="var(--lime)" />
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--lime)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            AI Detected · {(analysisResult?.confidence * 100 || 87).toFixed(0)}% Confidence
          </span>
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 6 }}>
          Select a product to generate
        </h2>
        <p style={{ color: 'var(--text-dim)', fontSize: 'var(--text-sm)' }}>
          Click any orbiting product to land it and open the editor
        </p>
      </motion.div>

      {/* 3D Orbit Stage */}
      <div
        style={{
          position: 'relative',
          width: ORBIT_RADIUS * 2 + CARD_SIZE + 40,
          height: ORBIT_RADIUS * 2 + CARD_SIZE + 40,
          perspective: '1000px',
          perspectiveOrigin: '50% 50%',
        }}
        onMouseEnter={() => setOrbitPaused(true)}
        onMouseLeave={() => { setOrbitPaused(false); setHoveredId(null) }}
      >
        {/* Center artwork */}
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
        }}>
          <FloatWrapper amplitude={10} duration={4}>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.5 }}
              style={{
                width: 110, height: 110,
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                border: '2px solid rgba(200,255,0,0.4)',
                boxShadow: 'var(--glow-lime-strong), 0 0 0 6px rgba(200,255,0,0.06), 0 0 0 12px rgba(200,255,0,0.03)',
                background: 'var(--void-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {artworkUrl ? (
                <img src={artworkUrl} alt="Your artwork" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '2.5rem' }}>🎨</span>
              )}
            </motion.div>
          </FloatWrapper>

          {/* Orbit rings (decorative) */}
          {[1, 2].map(i => (
            <div key={i} style={{
              position: 'absolute',
              top: '50%', left: '50%',
              width: ORBIT_RADIUS * 2 * i * 0.55,
              height: ORBIT_RADIUS * 2 * i * 0.55 * 0.35,
              transform: 'translate(-50%, -50%)',
              border: `1px solid rgba(200,255,0,${0.06 - i * 0.02})`,
              borderRadius: '50%',
              pointerEvents: 'none',
            }} />
          ))}
        </div>

        {/* Orbiting product cards */}
        {ORBIT_PRODUCTS.map((product, i) => {
          const baseAngle = (i / ORBIT_PRODUCTS.length) * 360
          const angle = (baseAngle + orbitAngle) * (Math.PI / 180)

          // 3D elliptical orbit (depth with Y compression)
          const x = Math.cos(angle) * ORBIT_RADIUS
          const y = Math.sin(angle) * ORBIT_RADIUS * 0.38
          const depth = Math.sin(angle) // -1 (behind) to 1 (front)
          const scale = 0.78 + depth * 0.22
          const zIndex = Math.round(50 + depth * 30)
          const opacity = 0.5 + depth * 0.5

          const isHovered = hoveredId === product.id
          const color = PRODUCT_COLORS[product.id] || 'var(--lime)'
          const isTopProduct = analysisResult?.suggestions?.[0]?.product === product.id

          return (
            <motion.div
              key={product.id}
              style={{
                position: 'absolute',
                top: '50%', left: '50%',
                zIndex,
                cursor: 'pointer',
              }}
              animate={{
                x: x - CARD_SIZE / 2,
                y: y - CARD_SIZE / 2,
                scale: isHovered ? scale * 1.25 : scale,
                opacity: isHovered ? 1 : opacity,
              }}
              transition={{
                x: { duration: 0 }, // instant position (RAF-driven)
                y: { duration: 0 },
                scale: { type: 'spring', stiffness: 400, damping: 22 },
                opacity: { duration: 0.2 },
              }}
              onHoverStart={() => setHoveredId(product.id)}
              onHoverEnd={() => setHoveredId(null)}
              onClick={() => handleSelect(product)}
            >
              <motion.div
                style={{
                  width: CARD_SIZE,
                  height: CARD_SIZE,
                  borderRadius: 'var(--radius-lg)',
                  background: isHovered
                    ? `radial-gradient(circle at center, ${color}18, rgba(8,8,18,0.95))`
                    : 'rgba(8,8,18,0.8)',
                  backdropFilter: 'blur(16px)',
                  border: `1px solid ${isHovered ? color + '60' : 'rgba(255,255,255,0.08)'}`,
                  boxShadow: isHovered
                    ? `0 0 30px ${color}40, 0 12px 40px rgba(0,0,0,0.6)`
                    : '0 8px 24px rgba(0,0,0,0.5)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {/* Product icon */}
                <div style={{ fontSize: '2.4rem', lineHeight: 1 }}>
                  {PRODUCT_ICONS[product.id] || '📦'}
                </div>

                {/* Name */}
                <div style={{
                  fontSize: 9, fontWeight: 700, color: isHovered ? color : 'var(--text-secondary)',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  textAlign: 'center', padding: '0 6px',
                  lineHeight: 1.2, transition: 'color 0.2s',
                }}>
                  {product.name.split(' ').slice(0, 2).join(' ')}
                </div>

                {/* Confidence score */}
                {analysisResult?.suggestions && (
                  <div style={{
                    position: 'absolute', bottom: 4, right: 4,
                    fontSize: 8, color: color, fontWeight: 700,
                    opacity: isHovered ? 1 : 0.5,
                  }}>
                    {((analysisResult.suggestions.find(s => s.product === product.id)?.score || 0.7) * 100).toFixed(0)}%
                  </div>
                )}

                {/* Top pick badge */}
                {isTopProduct && (
                  <div style={{
                    position: 'absolute', top: 5, left: 5,
                    background: 'var(--lime)', color: '#020208',
                    fontSize: 7, fontWeight: 800,
                    padding: '1px 5px', borderRadius: 3,
                    letterSpacing: '0.05em',
                  }}>
                    #1 PICK
                  </div>
                )}

                {/* Hover glow overlay */}
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      position: 'absolute', inset: 0,
                      background: `radial-gradient(circle at center, ${color}08, transparent)`,
                      pointerEvents: 'none',
                    }}
                  />
                )}
              </motion.div>

              {/* Tooltip on hover */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: 'absolute',
                      bottom: -44,
                      left: '50%', transform: 'translateX(-50%)',
                      background: 'rgba(8,8,18,0.96)',
                      border: `1px solid ${color}40`,
                      borderRadius: 'var(--radius-sm)',
                      padding: '6px 12px',
                      whiteSpace: 'nowrap',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-primary)',
                      boxShadow: `0 4px 20px rgba(0,0,0,0.5)`,
                      zIndex: 99,
                    }}
                  >
                    <span style={{ color }}>{product.name}</span>
                    {' '}— Click to generate
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {/* Color palette preview */}
      {analysisResult?.palette && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          style={{ textAlign: 'center' }}
        >
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', marginBottom: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Extracted Palette
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            {analysisResult.palette.map((color, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.9 + i * 0.1, type: 'spring', stiffness: 300 }}
                title={`${color.name} · ${color.hex}`}
                style={{
                  width: 32, height: 32,
                  borderRadius: 8,
                  background: color.hex,
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: `0 0 12px ${color.hex}40`,
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                }}
                whileHover={{ scale: 1.3 }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
