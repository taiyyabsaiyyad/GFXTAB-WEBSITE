import { useRef, useEffect, useState } from 'react'
import { Stage, Layer, Image as KonvaImage, Transformer, Rect, Line } from 'react-konva'
import { motion, AnimatePresence } from 'framer-motion'
import { Move, RotateCcw, FlipHorizontal, FlipVertical, Trash2, Layers, ZoomIn, ZoomOut, Grid, Paintbrush, Eraser } from 'lucide-react'
import { GlassCard } from '@/components/ui/Card.jsx'
import { IconButton, GlowButton, GhostButton } from '@/components/ui/Button.jsx'
import Tooltip from '@/components/ui/Tooltip.jsx'
import { useEditorStore, useProjectStore } from '@/store/index.js'
import { notify } from '@/components/ui/Toast.jsx'
import useImage from './useImage.js'

const CANVAS_WIDTH  = 600
const CANVAS_HEIGHT = 600

function ProductBackground({ src }) {
  const [image] = useImage(src)
  return image ? (
    <KonvaImage image={image} x={0} y={0} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
  ) : (
    <Rect x={0} y={0} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="#0d0d1a" />
  )
}

function ArtworkLayer({ artwork, product, isSelected, onSelect, onChange }) {
  const [image] = useImage(artwork?.url)
  const shapeRef = useRef()
  const trRef = useRef()

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current])
      trRef.current.getLayer().batchDraw()
    }
  }, [isSelected])

  if (!image || !artwork) return null

  // Extract dimensions
  const w = image.width
  const h = image.height

  // Resolve printable zone from product template (defaulting to A3 layout box if missing)
  const printZone = product?.printZone || { x: 0.25, y: 0.2, w: 0.5, h: 0.45 }
  
  const zoneX = printZone.x * CANVAS_WIDTH
  const zoneY = printZone.y * CANVAS_HEIGHT
  const zoneW = printZone.w * CANVAS_WIDTH
  const zoneH = printZone.h * CANVAS_HEIGHT

  const imgRatio = w / h
  const zoneRatio = zoneW / zoneH

  let fitW, fitH
  if (imgRatio > zoneRatio) {
    fitW = zoneW
    fitH = zoneW / imgRatio
  } else {
    fitH = zoneH
    fitW = zoneH * imgRatio
  }

  // Centered defaults
  const defaultX = zoneX + (zoneW - fitW) / 2
  const defaultY = zoneY + (zoneH - fitH) / 2

  const posX = artwork.x !== null && artwork.x !== undefined ? artwork.x : defaultX
  const posY = artwork.y !== null && artwork.y !== undefined ? artwork.y : defaultY

  const finalW = fitW * (artwork.scale ?? 1)
  const finalH = fitH * (artwork.scale ?? 1)

  return (
    <>
      <KonvaImage
        ref={shapeRef}
        image={image}
        x={posX}
        y={posY}
        width={finalW}
        height={finalH}
        rotation={artwork.rotation ?? 0}
        opacity={artwork.opacity ?? 1}
        globalCompositeOperation={artwork.blendMode ?? 'source-over'}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
        onTransformEnd={(e) => {
          const node = shapeRef.current
          const scaleX = node.scaleX()
          onChange({
            x: node.x(),
            y: node.y(),
            scale: (artwork.scale ?? 1) * scaleX,
            rotation: node.rotation(),
          })
          node.scaleX(1)
          node.scaleY(1)
        }}
        shadowBlur={artwork.showShadow ? 20 : 0}
        shadowColor="rgba(0,0,0,0.4)"
        shadowOffset={{ x: 4, y: 4 }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          borderStroke="#c8ff00"
          borderStrokeWidth={1.5}
          anchorFill="#020208"
          anchorStroke="#c8ff00"
          anchorSize={9}
          rotateAnchorOffset={30}
          enabledAnchors={['top-left','top-right','bottom-left','bottom-right']}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 20 || newBox.height < 20) return oldBox
            return newBox
          }}
        />
      )}
    </>
  )
}

// Color switcher pill
function ColorSwitcher({ colors, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {colors.map((c) => (
        <Tooltip key={c.id} content={c.name}>
          <motion.button
            onClick={() => onChange(c.hex)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            style={{
              width: 24, height: 24, borderRadius: 6,
              background: c.hex,
              border: `2px solid ${value === c.hex ? 'var(--lime)' : 'rgba(255,255,255,0.1)'}`,
              cursor: 'pointer',
              boxShadow: value === c.hex ? '0 0 10px rgba(200,255,0,0.4)' : 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
          />
        </Tooltip>
      ))}
    </div>
  )
}

export default function MockupEditor() {
  const { artwork, product, showGrid, snapEnabled, updateArtwork, pushHistory, undo, setProduct, setCanvasRef } = useEditorStore()
  const [isArtworkSelected, setIsArtworkSelected] = useState(false)
  const [stageScale, setStageScale] = useState(1)
  const [productColor, setProductColor] = useState(product?.colorVariant || '#FFFFFF')
  const [blendMode, setBlendMode] = useState('source-over')
  const [opacity, setOpacity] = useState(100)
  const stageRef = useRef()
  const containerRef = useRef()

  // Drawing tools state
  const [drawMode, setDrawMode] = useState('none') // 'none' | 'brush' | 'eraser'
  const [brushColor, setBrushColor] = useState('#c8ff00')
  const [brushSize, setBrushSize] = useState(10)
  const [lines, setLines] = useState([])
  const [isDrawing, setIsDrawing] = useState(false)

  const handleMouseDown = (e) => {
    if (drawMode === 'none') return
    const stage = e.target.getStage()
    const pos = stage.getPointerPosition()
    const x = pos.x / stageScale
    const y = pos.y / stageScale

    setIsDrawing(true)
    setLines([...lines, { tool: drawMode, points: [x, y], color: brushColor, strokeWidth: brushSize }])
  }

  const handleMouseMove = (e) => {
    if (!isDrawing || drawMode === 'none') return
    const stage = e.target.getStage()
    const pos = stage.getPointerPosition()
    const x = pos.x / stageScale
    const y = pos.y / stageScale

    const lastLine = { ...lines[lines.length - 1] }
    lastLine.points = lastLine.points.concat([x, y])

    const nextLines = [...lines]
    nextLines[nextLines.length - 1] = lastLine
    setLines(nextLines)
  }

  const handleMouseUp = () => {
    setIsDrawing(false)
  }

  useEffect(() => {
    if (stageRef.current) {
      setCanvasRef(stageRef.current)
    }
    return () => setCanvasRef(null)
  }, [stageRef, setCanvasRef])

  useEffect(() => {
    if (artwork) {
      if (artwork.blendMode) setBlendMode(artwork.blendMode)
      if (artwork.opacity !== undefined) setOpacity(Math.round(artwork.opacity * 100))
    }
  }, [artwork])

  const [saving, setSaving] = useState(false)

  const handleSaveProject = async () => {
    if (!product || !artwork) return
    setSaving(true)
    try {
      const saved = await useProjectStore.getState().addProject({
        name: `${product.name} Design`,
        mockupId: product.id,
        artworkUrl: artwork.url,
        canvasState: {
          x: artwork.x,
          y: artwork.y,
          scale: artwork.scale,
          rotation: artwork.rotation,
          opacity: artwork.opacity,
          blendMode: artwork.blendMode || blendMode
        }
      })
      if (saved) {
        notify.success('Project Saved!', 'Your project is preserved in GFXTAB AI Studio.')
      }
    } catch (e) {
      notify.error('Save Failed', e.message)
    }
    setSaving(false)
  }

  const handleArtworkChange = (patch) => {
    pushHistory()
    updateArtwork(patch)
  }

  const handleFlipH = () => {
    // Flip horizontally via scaleX negation
    pushHistory()
    const node = stageRef.current?.findOne('.artwork')
    if (node) {
      node.scaleX(node.scaleX() * -1)
      stageRef.current?.batchDraw()
    }
  }

  const handleDelete = () => {
    updateArtwork(null)
    setIsArtworkSelected(false)
    notify.info('Artwork removed', 'Add a new artwork to continue.')
  }

  const handleExport = () => {
    if (!stageRef.current) return
    const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2 })
    const link = document.createElement('a')
    link.download = `gfxtab_${product?.id || 'mockup'}_${Date.now()}.png`
    link.href = dataUrl
    link.click()
    notify.success('Exported!', 'Your mockup has been downloaded.')
  }

  const PRODUCT_COLORS = [
    { id: 'white', name: 'White', hex: '#FFFFFF' },
    { id: 'black', name: 'Black', hex: '#111111' },
    { id: 'navy', name: 'Navy', hex: '#1B2A4A' },
    { id: 'lime', name: 'Lime', hex: '#C8FF00' },
    { id: 'violet', name: 'Violet', hex: '#4B0082' },
    { id: 'red', name: 'Red', hex: '#C41E3A' },
    { id: 'sand', name: 'Sand', hex: '#D4B896' },
    { id: 'forest', name: 'Forest', hex: '#2D5016' },
  ]

  return (
    <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
      {/* Canvas area */}
      <div style={{ flex: '1 1 500px' }}>
        {/* Floating toolbar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(8,8,18,0.9)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(200,255,0,0.1)',
          borderRadius: 'var(--radius-full)',
          padding: '6px 12px',
          marginBottom: 'var(--space-4)',
          width: 'fit-content',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}>
          <Tooltip content="Selection Tool">
            <IconButton size={34} onClick={() => setDrawMode('none')} active={drawMode === 'none'} tooltip="Select">
              <Move size={14} />
            </IconButton>
          </Tooltip>
          <Tooltip content="Brush Draw">
            <IconButton size={34} onClick={() => setDrawMode('brush')} active={drawMode === 'brush'} tooltip="Brush">
              <Paintbrush size={14} />
            </IconButton>
          </Tooltip>
          <Tooltip content="Erase Canvas">
            <IconButton size={34} onClick={() => setDrawMode('eraser')} active={drawMode === 'eraser'} tooltip="Eraser">
              <Eraser size={14} />
            </IconButton>
          </Tooltip>
          {lines.length > 0 && (
            <Tooltip content="Clear Drawing Overlay">
              <IconButton size={34} onClick={() => { setLines([]); notify.info('Drawings cleared') }} tooltip="Clear">
                <Trash2 size={14} style={{ color: 'var(--orange)' }} />
              </IconButton>
            </Tooltip>
          )}
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)', margin: '0 2px' }} />
          <Tooltip content="Undo (Ctrl+Z)">
            <IconButton size={34} onClick={undo} tooltip="Undo">
              <RotateCcw size={14} />
            </IconButton>
          </Tooltip>
          <Tooltip content="Flip Horizontal">
            <IconButton size={34} onClick={handleFlipH} tooltip="Flip H">
              <FlipHorizontal size={14} />
            </IconButton>
          </Tooltip>
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)', margin: '0 2px' }} />
          <Tooltip content="Toggle Grid">
            <IconButton size={34} active={showGrid} onClick={() => useEditorStore.getState().toggleGrid()} tooltip="Grid">
              <Grid size={14} />
            </IconButton>
          </Tooltip>
          <Tooltip content="Zoom In">
            <IconButton size={34} onClick={() => setStageScale(s => Math.min(s + 0.1, 2))} tooltip="Zoom In">
              <ZoomIn size={14} />
            </IconButton>
          </Tooltip>
          <Tooltip content="Zoom Out">
            <IconButton size={34} onClick={() => setStageScale(s => Math.max(s - 0.1, 0.5))} tooltip="Zoom Out">
              <ZoomOut size={14} />
            </IconButton>
          </Tooltip>
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)', margin: '0 2px' }} />
          <Tooltip content="Delete Artwork">
            <IconButton size={34} onClick={handleDelete} tooltip="Delete">
              <Trash2 size={14} style={{ color: 'var(--red)' }} />
            </IconButton>
          </Tooltip>
        </div>

        {/* Canvas */}
        <div
          ref={containerRef}
          onClick={(e) => { if (e.target === e.currentTarget) setIsArtworkSelected(false) }}
          style={{
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            border: '1px solid rgba(200,255,0,0.08)',
            boxShadow: 'var(--glow-card)',
            background: '#0d0d1a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <Stage
            ref={stageRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            scaleX={stageScale}
            scaleY={stageScale}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{ display: 'block' }}
          >
            <Layer>
              {/* Background product template image */}
              <ProductBackground src={product?.previewAsset ? (product.previewAsset.startsWith('data:') || product.previewAsset.startsWith('http') ? product.previewAsset : `${import.meta.env.BASE_URL}assets/${product.previewAsset}`) : null} />

              {/* Grid */}
              {showGrid && Array.from({ length: 12 }, (_, i) => (
                <Line key={`v${i}`} points={[i * 50, 0, i * 50, CANVAS_HEIGHT]} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
              ))}
              {showGrid && Array.from({ length: 12 }, (_, i) => (
                <Line key={`h${i}`} points={[0, i * 50, CANVAS_WIDTH, i * 50]} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
              ))}

              {/* Artwork */}
              {artwork && (
                <ArtworkLayer
                  artwork={artwork}
                  product={product}
                  isSelected={isArtworkSelected}
                  onSelect={() => setIsArtworkSelected(true)}
                  onChange={handleArtworkChange}
                />
              )}

              {/* Custom freehand drawings/brush/eraser layer */}
              {lines.map((line, i) => (
                <Line
                  key={i}
                  points={line.points}
                  stroke={line.tool === 'eraser' ? '#0d0d1a' : line.color}
                  strokeWidth={line.strokeWidth || 10}
                  tension={0.5}
                  lineCap="round"
                  lineJoin="round"
                  globalCompositeOperation={
                    line.tool === 'eraser' ? 'destination-out' : 'source-over'
                  }
                />
              ))}
            </Layer>
          </Stage>

          {/* No artwork prompt */}
          {!artwork && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'none', gap: 12,
            }}>
              <div style={{ fontSize: '3rem', opacity: 0.3 }}>🎨</div>
              <p style={{ color: 'var(--text-dim)', fontSize: 'var(--text-sm)' }}>
                No artwork loaded — go to Upload to get started
              </p>
            </div>
          )}
        </div>

        {/* Scale display */}
        <div style={{ textAlign: 'center', marginTop: 8, fontSize: 'var(--text-xs)', color: 'var(--text-dim)' }}>
          {Math.round(stageScale * 100)}% · {CANVAS_WIDTH}×{CANVAS_HEIGHT}px
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: '0 0 260px', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Product info */}
        <GlassCard hoverable={false} padding="var(--space-4)">
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', marginBottom: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Product
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-md)', marginBottom: 4 }}>
            {product?.name || 'No product selected'}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', marginBottom: 'var(--space-4)' }}>
            {product?.category || '—'}
          </div>

          {/* Color switcher */}
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', marginBottom: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Color
          </div>
          <ColorSwitcher colors={PRODUCT_COLORS} value={productColor} onChange={setProductColor} />
        </GlassCard>

        {/* Drawing Config Panel */}
        {drawMode !== 'none' && (
          <GlassCard hoverable={false} padding="var(--space-4)" style={{ border: '1px solid rgba(200, 255, 0, 0.25)' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--lime)', marginBottom: 'var(--space-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {drawMode === 'eraser' ? 'Eraser Settings' : 'Brush Settings'}
            </div>

            {/* Brush size slider */}
            <div style={{ marginBottom: drawMode === 'brush' ? 'var(--space-4)' : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Size</span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--lime)', fontWeight: 700 }}>{brushSize}px</span>
              </div>
              <input
                type="range" min={2} max={50} value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                style={{
                  width: '100%', accentColor: 'var(--lime)',
                  background: 'none', cursor: 'pointer',
                }}
              />
            </div>

            {/* Brush color */}
            {drawMode === 'brush' && (
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 6 }}>Brush Color</div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input
                    type="color"
                    value={brushColor}
                    onChange={(e) => setBrushColor(e.target.value)}
                    style={{ width: 34, height: 34, borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', background: 'none' }}
                  />
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {brushColor.toUpperCase()}
                  </span>
                </div>
              </div>
            )}
          </GlassCard>
        )}

        {/* Artwork controls */}
        {artwork && (
          <GlassCard hoverable={false} padding="var(--space-4)">
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', marginBottom: 'var(--space-3)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Artwork
            </div>

            {/* Opacity slider */}
            <div style={{ marginBottom: 'var(--space-3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Opacity</span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--lime)', fontWeight: 700 }}>{opacity}%</span>
              </div>
              <input
                type="range" min={10} max={100} value={opacity}
                onChange={(e) => { setOpacity(Number(e.target.value)); updateArtwork({ opacity: Number(e.target.value) / 100 }) }}
                style={{
                  width: '100%', accentColor: 'var(--lime)',
                  background: 'none', cursor: 'pointer',
                }}
              />
            </div>

            {/* Blend mode */}
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 4 }}>Blend Mode</div>
              <select
                value={blendMode}
                onChange={(e) => { setBlendMode(e.target.value); updateArtwork({ blendMode: e.target.value }) }}
                style={{
                  width: '100%', background: 'var(--void-2)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                  padding: '6px 10px', fontSize: 'var(--text-xs)', cursor: 'pointer',
                }}
              >
                <option value="source-over">Normal</option>
                <option value="multiply">Multiply</option>
                <option value="screen">Screen</option>
                <option value="overlay">Overlay</option>
                <option value="darken">Darken</option>
                <option value="lighten">Lighten</option>
              </select>
            </div>
          </GlassCard>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 'var(--space-2)' }}>
          <GlowButton
            id="editor-save-btn"
            onClick={handleSaveProject}
            disabled={saving}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {saving ? 'Saving...' : 'Save Design'}
          </GlowButton>

          <GhostButton
            id="editor-export-btn"
            onClick={handleExport}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            ↓ Export PNG
          </GhostButton>
        </div>
      </div>
    </div>
  )
}
