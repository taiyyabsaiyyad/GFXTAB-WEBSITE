import { useReducer, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { Upload, X, CheckCircle, ImageIcon, Cpu, Camera } from 'lucide-react'
import { GhostButton } from '@/components/ui/Button.jsx'

// State machine
const STATES = { IDLE: 'idle', HOVERING: 'hovering', UPLOADING: 'uploading', PROCESSING: 'processing', COMPLETE: 'complete', ERROR: 'error' }

const reducer = (state, action) => {
  switch (action.type) {
    case 'HOVER_ENTER': return { ...state, status: STATES.HOVERING }
    case 'HOVER_LEAVE': return { ...state, status: STATES.IDLE }
    case 'UPLOAD_START': return { ...state, status: STATES.UPLOADING, file: action.file, fileUrl: action.fileUrl, progress: 0 }
    case 'UPLOAD_PROGRESS': return { ...state, progress: action.progress }
    case 'PROCESSING_START': return { ...state, status: STATES.PROCESSING, progress: 100, processingStep: 0 }
    case 'PROCESSING_STEP': return { ...state, processingStep: action.step }
    case 'COMPLETE': return { ...state, status: STATES.COMPLETE, analysisResult: action.result }
    case 'ERROR': return { ...state, status: STATES.ERROR, error: action.error }
    case 'RESET': return initialState
    default: return state
  }
}

const initialState = {
  status: STATES.IDLE,
  file: null,
  fileUrl: null,
  progress: 0,
  processingStep: 0,
  analysisResult: null,
  error: null,
}

const PROCESSING_STEPS = [
  'Detecting image type...',
  'Extracting color palette...',
  'Removing background...',
  'Analyzing composition...',
  'Finding best products...',
]

async function checkTransparency(fileUrl) {
  return new Promise((res) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = Math.min(img.width, 100)
      canvas.height = Math.min(img.height, 100)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      try {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data
        for (let i = 3; i < imgData.length; i += 4) {
          if (imgData[i] < 250) {
            res(true)
            return
          }
        }
      } catch (e) {
        // Cross-origin fallback
      }
      res(false)
    }
    img.onerror = () => res(false)
    img.src = fileUrl
  })
}

// Mock AI analysis with client-side ColorThief
async function runClientAIAnalysis(file, fileUrl) {
  // Simulate network delays for each step
  await new Promise(r => setTimeout(r, 400))
  const isTransparent = await checkTransparency(fileUrl)


  // Extract colors using ColorThief if available
  let palette = []
  try {
    const { default: ColorThief } = await import('colorthief')
    const ct = new ColorThief()
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = fileUrl
    await new Promise((res, rej) => {
      img.onload = res; img.onerror = rej
      setTimeout(res, 2000) // fallback
    })
    const colors = ct.getPalette(img, 5)
    palette = colors.map(([r, g, b]) => ({
      rgb: { r, g, b },
      hex: `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`,
      name: getColorName(r, g, b),
      weight: Math.random() * 0.5 + 0.1,
    }))
  } catch {
    // Fallback palette
    palette = [
      { hex: '#C8FF00', rgb: { r: 200, g: 255, b: 0 }, name: 'Electric Lime', weight: 0.45 },
      { hex: '#7B2FFF', rgb: { r: 123, g: 47, b: 255 }, name: 'Deep Violet', weight: 0.3 },
      { hex: '#00D4FF', rgb: { r: 0, g: 212, b: 255 }, name: 'Cryo Blue', weight: 0.15 },
      { hex: '#020208', rgb: { r: 2, g: 2, b: 8 }, name: 'Void Black', weight: 0.08 },
      { hex: '#F0F0F0', rgb: { r: 240, g: 240, b: 240 }, name: 'Cloud White', weight: 0.02 },
    ]
  }

  // Detect image type (mock CLIP)
  const fileType = file.type
  const imageName = file.name.toLowerCase()
  let imageType = 'logo'
  let confidence = 0.87
  if (imageName.includes('photo') || fileType === 'image/jpeg') { imageType = 'photograph'; confidence = 0.91 }
  else if (imageName.includes('illus') || imageName.includes('art')) { imageType = 'illustration'; confidence = 0.84 }
  else if (imageName.includes('pattern') || imageName.includes('tex')) { imageType = 'pattern'; confidence = 0.78 }

  // Product suggestions
  const suggestions = [
    { product: 'tshirt-crew', score: 0.95, reason: 'Perfect for apparel branding' },
    { product: 'book-cover', score: 0.88, reason: 'Great visual impact on print' },
    { product: 'mug-ceramic', score: 0.82, reason: 'High contrast merchandise' },
    { product: 'poster-a3', score: 0.91, reason: 'Scales beautifully to large format' },
    { product: 'business-card', score: 0.79, reason: 'Professional branding asset' },
  ].sort((a, b) => b.score - a.score)

  return {
    imageType,
    confidence,
    palette,
    suggestions,
    dominantColor: palette[0]?.hex || '#C8FF00',
    bgRemoved: fileUrl,
    placementZone: { x: 0.25, y: 0.2, w: 0.5, h: 0.45 },
    contrastScore: 0.78,
    isTransparent,
  }
}

function getColorName(r, g, b) {
  if (r > 200 && g > 200 && b < 50) return 'Yellow'
  if (r > 200 && g < 100 && b < 100) return 'Red'
  if (r < 100 && g > 150 && b < 100) return 'Green'
  if (r < 100 && g < 100 && b > 180) return 'Blue'
  if (r > 180 && g < 100 && b > 180) return 'Violet'
  if (r < 60 && g < 60 && b < 60) return 'Dark'
  if (r > 200 && g > 200 && b > 200) return 'Light'
  return 'Neutral'
}

// Particle burst component
function ParticleBurst({ active }) {
  if (!active) return null
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', borderRadius: 'inherit' }}>
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * 360
        const tx = `${Math.cos((angle * Math.PI) / 180) * 80}px`
        const ty = `${Math.sin((angle * Math.PI) / 180) * 80}px`
        return (
          <motion.div
            key={i}
            initial={{ x: '50%', y: '50%', scale: 1, opacity: 1 }}
            animate={{ x: `calc(50% + ${tx})`, y: `calc(50% + ${ty})`, scale: 0, opacity: 0 }}
            transition={{ duration: 0.7, delay: i * 0.03, ease: 'easeOut' }}
            style={{
              position: 'absolute', top: 0, left: 0,
              width: 8, height: 8, borderRadius: '50%',
              background: i % 2 === 0 ? 'var(--lime)' : 'var(--cryo)',
              boxShadow: `0 0 8px ${i % 2 === 0 ? 'var(--lime)' : 'var(--cryo)'}`,
            }}
          />
        )
      })}
    </div>
  )
}

export default function UploadZone({ onComplete }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const stepTimerRef = useRef(null)
  const analysisRunning = useRef(false)

  // Typewriter processing steps
  useEffect(() => {
    if (state.status !== STATES.PROCESSING) return
    let step = 0

    const advance = () => {
      if (step >= PROCESSING_STEPS.length - 1) return
      step++
      dispatch({ type: 'PROCESSING_STEP', step })
      stepTimerRef.current = setTimeout(advance, 700)
    }
    stepTimerRef.current = setTimeout(advance, 700)
    return () => clearTimeout(stepTimerRef.current)
  }, [state.status])

  const processFile = useCallback(async (file) => {
    if (analysisRunning.current) return
    analysisRunning.current = true

    const fileUrl = URL.createObjectURL(file)
    dispatch({ type: 'UPLOAD_START', file, fileUrl })

    // Simulate upload progress
    for (let p = 0; p <= 100; p += 12) {
      await new Promise(r => setTimeout(r, 80))
      dispatch({ type: 'UPLOAD_PROGRESS', progress: Math.min(p, 100) })
    }

    dispatch({ type: 'PROCESSING_START' })

    try {
      const result = await runClientAIAnalysis(file, fileUrl)
      await new Promise(r => setTimeout(r, 800)) // let last step display

      dispatch({ type: 'COMPLETE', result })
      onComplete?.({ file, fileUrl, result })
    } catch (err) {
      dispatch({ type: 'ERROR', error: err.message || 'Analysis failed' })
    } finally {
      analysisRunning.current = false
    }
  }, [onComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (accepted) => { if (accepted[0]) processFile(accepted[0]) },
    onDragEnter: () => dispatch({ type: 'HOVER_ENTER' }),
    onDragLeave: () => dispatch({ type: 'HOVER_LEAVE' }),
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'] },
    maxSize: 25 * 1024 * 1024,
    disabled: state.status !== STATES.IDLE && state.status !== STATES.HOVERING,
    multiple: false,
  })

  const { status, file, fileUrl, progress, processingStep, error } = state
  const isHovering = isDragActive || status === STATES.HOVERING
  const isComplete = status === STATES.COMPLETE
  const isProcessing = status === STATES.PROCESSING
  const isUploading = status === STATES.UPLOADING

  const borderColor = isComplete ? 'var(--green)' :
    isHovering ? 'var(--lime)' :
    isProcessing ? 'var(--violet)' :
    isUploading ? 'var(--cryo)' :
    status === STATES.ERROR ? 'var(--red)' :
    'rgba(200,255,0,0.2)'

  const glowColor = isComplete ? 'rgba(0,255,136,0.2)' :
    isHovering ? 'rgba(200,255,0,0.25)' :
    isProcessing ? 'rgba(123,47,255,0.25)' :
    isUploading ? 'rgba(0,212,255,0.2)' :
    'transparent'

  return (
    <motion.div
      {...(status === STATES.IDLE || status === STATES.HOVERING ? getRootProps() : {})}
      animate={{
        scale: isHovering ? 1.02 : 1,
        borderColor,
        boxShadow: `0 0 60px ${glowColor}, 0 8px 32px rgba(0,0,0,0.4)`,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        position: 'relative',
        minHeight: 280,
        borderRadius: 'var(--radius-xl)',
        border: `2px ${isUploading || isProcessing ? 'solid' : 'dashed'} ${borderColor}`,
        background: isHovering
          ? 'rgba(200,255,0,0.04)'
          : isProcessing ? 'rgba(123,47,255,0.04)'
          : 'rgba(255,255,255,0.02)',
        backdropFilter: 'blur(24px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        transition: 'background 0.3s',
        cursor: status === STATES.IDLE || status === STATES.HOVERING ? 'pointer' : 'default',
      }}
    >
      <input {...(status === STATES.IDLE || status === STATES.HOVERING ? getInputProps() : {})} />
      <ParticleBurst active={isComplete} />

      {/* ---- IDLE STATE ---- */}
      <AnimatePresence mode="wait">
        {(status === STATES.IDLE || status === STATES.HOVERING) && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ textAlign: 'center', padding: 'var(--space-8)' }}
          >
            {/* Animated upload icon */}
            <motion.div
              animate={{ y: isHovering ? -12 : [0, -8, 0] }}
              transition={isHovering ? { type: 'spring', stiffness: 300 } : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: 80, height: 80, borderRadius: 'var(--radius-lg)',
                background: isHovering ? 'rgba(200,255,0,0.15)' : 'rgba(200,255,0,0.06)',
                border: `1px solid ${isHovering ? 'rgba(200,255,0,0.4)' : 'rgba(200,255,0,0.15)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto var(--space-5)',
                boxShadow: isHovering ? 'var(--glow-lime)' : 'none',
                transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
              }}
            >
              <Upload size={32} color={isHovering ? 'var(--lime)' : 'var(--text-secondary)'} />
            </motion.div>

            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-xl)',
              marginBottom: 'var(--space-2)',
              color: isHovering ? 'var(--lime)' : 'var(--text-primary)',
              transition: 'color 0.2s',
            }}>
              {isHovering ? 'Drop it here!' : 'Drop your artwork'}
            </h3>
            <p style={{ color: 'var(--text-dim)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-5)' }}>
              PNG, JPG, SVG, WebP · Max 25MB · Logo, photo, illustration
            </p>

            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <GhostButton id="upload-browse-btn" size="sm" color="lime">
                <ImageIcon size={14} /> Browse Files
              </GhostButton>
              <GhostButton id="upload-camera-btn" size="sm" color="white">
                <Camera size={14} /> Camera
              </GhostButton>
            </div>

            {/* Floating decorative icons */}
            {['👕','📚','☕','🗒️','🪪'].map((icon, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -10 - i * 2, 0],
                  rotate: [0, i % 2 === 0 ? 8 : -8, 0],
                  opacity: [0.15, 0.3, 0.15],
                }}
                transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
                style={{
                  position: 'absolute',
                  fontSize: '1.4rem',
                  pointerEvents: 'none',
                  left: `${10 + i * 19}%`,
                  top: `${15 + (i % 2) * 55}%`,
                }}
              >
                {icon}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ---- UPLOADING STATE ---- */}
        {status === STATES.UPLOADING && (
          <motion.div
            key="uploading"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            style={{ textAlign: 'center', padding: 'var(--space-8)' }}
          >
            {/* SVG progress ring */}
            <div style={{ position: 'relative', width: 90, height: 90, margin: '0 auto var(--space-5)' }}>
              <svg width="90" height="90" viewBox="0 0 90 90" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="45" cy="45" r="38" fill="none" stroke="rgba(0,212,255,0.12)" strokeWidth="4" />
                <motion.circle
                  cx="45" cy="45" r="38" fill="none"
                  stroke="var(--cryo)" strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 38}`}
                  animate={{ strokeDashoffset: `${2 * Math.PI * 38 * (1 - progress / 100)}` }}
                  transition={{ duration: 0.2 }}
                  style={{ filter: 'drop-shadow(0 0 8px var(--cryo))' }}
                />
              </svg>
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--cryo)',
              }}>
                {progress}%
              </div>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', marginBottom: 6 }}>
              Uploading...
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', marginBottom: 'var(--space-5)' }}>
              {file?.name} · {(file?.size / 1024 / 1024).toFixed(1)}MB
            </div>
            <GhostButton size="sm" color="white" onClick={() => dispatch({ type: 'RESET' })} icon={<X size={14} />}>
              Cancel
            </GhostButton>
          </motion.div>
        )}

        {/* ---- PROCESSING STATE ---- */}
        {status === STATES.PROCESSING && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            style={{ textAlign: 'center', padding: 'var(--space-8)', width: '100%', maxWidth: 400 }}
          >
            {/* Pulsing violet orb */}
            <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto var(--space-5)' }}>
              {[1, 2, 3].map(i => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.8 + i * 0.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3, ease: 'easeOut' }}
                  style={{
                    position: 'absolute', inset: 0,
                    borderRadius: '50%',
                    border: '1px solid var(--violet)',
                  }}
                />
              ))}
              <div style={{
                position: 'absolute', inset: 0,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(123,47,255,0.4), rgba(123,47,255,0.1))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Cpu size={28} color="var(--violet)" />
              </div>
            </div>

            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-3)' }}>
              AI is analyzing...
            </div>

            {/* Typewriter step text */}
            <AnimatePresence mode="wait">
              <motion.div
                key={processingStep}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                style={{ color: 'var(--violet)', fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: 'var(--space-5)' }}
              >
                {PROCESSING_STEPS[processingStep]}
              </motion.div>
            </AnimatePresence>

            {/* Step progress bars */}
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
              {PROCESSING_STEPS.map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    background: i <= processingStep ? 'var(--violet)' : 'rgba(123,47,255,0.15)',
                    width: i === processingStep ? 24 : 8,
                  }}
                  style={{ height: 4, borderRadius: 2, transition: 'all 0.3s var(--spring)' }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* ---- COMPLETE STATE ---- */}
        {status === STATES.COMPLETE && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 20 }}
            style={{ textAlign: 'center', padding: 'var(--space-8)', width: '100%' }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 16 }}
              style={{
                width: 64, height: 64,
                borderRadius: '50%',
                background: 'rgba(0,255,136,0.15)',
                border: '2px solid var(--green)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto var(--space-4)',
                boxShadow: '0 0 30px rgba(0,255,136,0.3)',
              }}
            >
              <CheckCircle size={28} color="var(--green)" />
            </motion.div>

            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', marginBottom: 6, color: 'var(--green)' }}>
              Analysis Complete!
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-dim)', marginBottom: 'var(--space-4)' }}>
              Detected: <strong style={{ color: 'var(--text-primary)' }}>{state.analysisResult?.imageType}</strong> ·
              {' '}{(state.analysisResult?.confidence * 100).toFixed(0)}% confidence
            </p>

            {fileUrl && (
              <div style={{
                width: 80, height: 80, borderRadius: 'var(--radius-md)',
                overflow: 'hidden', margin: '0 auto var(--space-4)',
                border: '2px solid rgba(0,255,136,0.3)',
              }}>
                <img src={fileUrl} alt="uploaded" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}

            <GhostButton size="sm" onClick={() => dispatch({ type: 'RESET' })} color="white">
              Upload Different File
            </GhostButton>
          </motion.div>
        )}

        {/* ---- ERROR STATE ---- */}
        {status === STATES.ERROR && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', padding: 'var(--space-8)' }}
          >
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>⚠️</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--red)', marginBottom: 6 }}>
              Upload Failed
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-dim)', marginBottom: 'var(--space-5)' }}>
              {error}
            </p>
            <GhostButton size="sm" color="white" onClick={() => dispatch({ type: 'RESET' })}>
              Try Again
            </GhostButton>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
