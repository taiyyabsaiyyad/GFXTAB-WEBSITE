import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { Sparkles, ArrowRight, Check, Copy, RefreshCw } from 'lucide-react'
import UploadZone from '@/components/upload/UploadZone.jsx'
import { GlassCard } from '@/components/ui/Card.jsx'
import { GlowButton, GhostButton } from '@/components/ui/Button.jsx'
import { StatusBadge } from '@/components/ui/Badge.jsx'
import { PRODUCTS } from '@/constants/products.js'
import { notify } from '@/components/ui/Toast.jsx'
import { useMarketplaceStore } from '@/store/index.js'

export default function Upload() {
  const navigate = useNavigate()
  const location = useLocation()

  // Track pre-selected mockup if coming from details page
  const preSelectedMockupId = location.state?.selectedMockupId || null
  const preSelectedMockup = PRODUCTS.find(p => p.id === preSelectedMockupId)

  const [uploadData, setUploadData] = useState(null)
  const [copiedHex, setCopiedHex] = useState(null)
  const [creatorMockups, setCreatorMockups] = useState([])
  const [fetchingMockups, setFetchingMockups] = useState(false)

  // AI Prompt design states
  const [activeUploadTab, setActiveUploadTab] = useState('file') // 'file' | 'ai'
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiGenerating, setAiGenerating] = useState(false)
  
  // Advanced AI workbench states
  const [attachments, setAttachments] = useState([])
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraStream, setCameraStream] = useState(null)
  const [deepThinking, setDeepThinking] = useState(true)
  const [thinkingLogs, setThinkingLogs] = useState([])
  const [generatedOptions, setGeneratedOptions] = useState([])
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', content: "Hello! I am GFXTAB's custom design assistant. Describe the realistic design visual or logo you want to generate today (e.g., 'A metallic chrome logo for a fintech brand')." }
  ])
  const [userInput, setUserInput] = useState('')

  // Scroll chat messages to bottom
  useEffect(() => {
    const el = document.getElementById('chat-messages-container')
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [chatMessages, activeUploadTab])

  // Client side SVG -> PNG / JPEG conversion helper
  const downloadAsset = (svgDataUrl, name, format) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 1000
      canvas.height = 1000
      const ctx = canvas.getContext('2d')
      if (format === 'jpeg') {
        ctx.fillStyle = '#090910'
        ctx.fillRect(0, 0, 1000, 1000)
      } else {
        ctx.clearRect(0, 0, 1000, 1000)
      }
      ctx.drawImage(img, 0, 0, 1000, 1000)
      const downloadUrl = canvas.toDataURL(format === 'jpeg' ? 'image/jpeg' : 'image/png')
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `${name.replace(/\s+/g, '_')}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      notify.success(`${format.toUpperCase()} downloaded successfully!`)
    }
    img.src = svgDataUrl
  }

  // Helper to generate dynamic classy SVG base64 strings with custom colors
  const generateSvgDesign = (promptText, primaryColor = '#c8ff00', secondaryColor = '#ffffff') => {
    const lower = promptText.toLowerCase()
    let innerSvg = ''
    if (lower.includes('astronaut') || lower.includes('space') || lower.includes('galaxy')) {
      innerSvg = `<circle cx="100" cy="100" r="50" fill="none" stroke="${primaryColor}" stroke-width="4"/>
                  <path d="M70,120 Q100,160 130,120" fill="none" stroke="${primaryColor}" stroke-width="4"/>
                  <circle cx="90" cy="90" r="6" fill="${primaryColor}"/>
                  <circle cx="110" cy="90" r="6" fill="${primaryColor}"/>
                  <path d="M100,20 L100,50" stroke="${primaryColor}" stroke-width="4"/>
                  <circle cx="100" cy="15" r="10" fill="${primaryColor}"/>
                  <path d="M50,100 L30,100" stroke="${primaryColor}" stroke-width="4"/>
                  <path d="M150,100 L170,100" stroke="${primaryColor}" stroke-width="4"/>`
    } else if (lower.includes('camera') || lower.includes('photo') || lower.includes('retro')) {
      innerSvg = `<rect x="50" y="70" width="100" height="70" rx="10" fill="none" stroke="${primaryColor}" stroke-width="4"/>
                  <circle cx="100" cy="105" r="22" fill="none" stroke="${primaryColor}" stroke-width="4"/>
                  <circle cx="100" cy="105" r="10" fill="${primaryColor}"/>
                  <rect x="70" y="50" width="30" height="20" rx="4" fill="none" stroke="${primaryColor}" stroke-width="4"/>
                  <circle cx="132" cy="85" r="6" fill="${primaryColor}"/>`
    } else if (lower.includes('flower') || lower.includes('plant') || lower.includes('nature') || lower.includes('botanical')) {
      innerSvg = `<path d="M100,160 Q100,80 120,40" fill="none" stroke="${primaryColor}" stroke-width="4"/>
                  <path d="M100,120 Q70,90 100,70" fill="none" stroke="${primaryColor}" stroke-width="4"/>
                  <path d="M100,90 Q130,60 100,40" fill="none" stroke="${primaryColor}" stroke-width="4"/>
                  <circle cx="120" cy="40" r="12" fill="none" stroke="${secondaryColor}" stroke-width="3"/>
                  <circle cx="70" cy="90" r="8" fill="none" stroke="${secondaryColor}" stroke-width="3"/>`
    } else {
      const text = promptText.slice(0, 12).toUpperCase() || "GFXTAB DESIGN"
      innerSvg = `<circle cx="100" cy="100" r="70" fill="none" stroke="${primaryColor}" stroke-width="4"/>
                  <circle cx="100" cy="100" r="55" fill="none" stroke="${secondaryColor}" stroke-dasharray="8 6" stroke-width="2"/>
                  <text x="100" y="106" font-family="system-ui, sans-serif" font-weight="bold" font-size="16" fill="${secondaryColor}" text-anchor="middle">${text}</text>
                  <polygon points="100,42 108,58 126,58 112,68 118,86 100,75 82,86 88,68 74,58 92,58" fill="${primaryColor}"/>`
    }
    const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="500" height="500">
      <rect width="100%" height="100%" fill="none"/>
      ${innerSvg}
    </svg>`
    return `data:image/svg+xml;base64,${btoa(fullSvg)}`
  }

  // Webcam actions
  const startCamera = async () => {
    setCameraOpen(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      setCameraStream(stream)
      setTimeout(() => {
        const videoEl = document.getElementById('webcam-video')
        if (videoEl) videoEl.srcObject = stream
      }, 300)
    } catch (err) {
      console.warn('Webcam access denied or unavailable, showing fallback capture mock.', err)
    }
  }

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }
    setCameraOpen(false)
  }

  const captureSnapshot = () => {
    const videoEl = document.getElementById('webcam-video')
    if (videoEl && cameraStream) {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = videoEl.videoWidth || 640
        canvas.height = videoEl.videoHeight || 480
        const ctx = canvas.getContext('2d')
        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg')
        setAttachments(prev => [...prev, { name: `webcam_snap_${Date.now()}.jpg`, url: dataUrl, type: 'image/jpeg' }])
        notify.success('Camera snapshot captured!', 'Attached to prompt workspace.')
      } catch (err) {
        console.error(err)
      }
    } else {
      const simulatedUrl = `data:image/svg+xml;base64,${btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
          <rect width="100%" height="100%" fill="#1e1b4b"/>
          <circle cx="100" cy="100" r="40" fill="none" stroke="#c8ff00" stroke-width="4"/>
          <text x="100" y="105" font-family="system-ui" font-size="12" fill="#fff" text-anchor="middle">SNAP</text>
        </svg>
      `)}`
      setAttachments(prev => [...prev, { name: `simulated_camera_snap_${Date.now()}.jpg`, url: simulatedUrl, type: 'image/jpeg' }])
      notify.success('Simulated snapshot captured!', 'Attached to prompt workspace.')
    }
    stopCamera()
  }

  // File attach action
  const handleFileAttach = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setAttachments(prev => [...prev, { name: file.name, url: event.target.result, type: file.type }])
        notify.success('File attached', `${file.name} attached to prompt.`)
      }
      reader.readAsDataURL(file)
    }
  }

  // Gemini assistant chat message send
  const handleSendMessage = () => {
    if (!userInput.trim()) return
    const userMsg = userInput.trim()
    const newMsgs = [...chatMessages, { role: 'user', content: userMsg }]
    setChatMessages(newMsgs)
    setUserInput('')
    
    // Automatically prepare input prompt
    setAiPrompt(userMsg)

    setTimeout(() => {
      let aiResponse = `I've registered your design requirement: "${userMsg}". I can formulate transparent vector path layers and matching color keys for this prompt. You can attach references (+) or snap webcam files (📷) to feed the layout. Ready to generate whenever you click "Generate Design"!`
      
      const lower = userMsg.toLowerCase()
      if (lower.includes('metallic') || lower.includes('chrome') || lower.includes('logo')) {
        aiResponse = `Analyzing metallic chrome logo layout. I will construct glowing chrome reflections, high-definition coordinates, and high contrast specular values. Let's run the generator to synthesize 4 realistic variants!`
      } else if (lower.includes('astronaut') || lower.includes('space') || lower.includes('galaxy')) {
        aiResponse = `Registered astronaut space theme. I will prepare cosmic outline parameters, planetary geometries, and vector spacesuits. Click "Generate Design" to begin deep reasoning.`
      } else if (lower.includes('flower') || lower.includes('plant') || lower.includes('nature') || lower.includes('botanical')) {
        aiResponse = `Registered botanical foliage theme. I will compile natural organic leaves outlines and clean flora paths. Let's run the generator.`
      } else if (lower.includes('hello') || lower.includes('hi')) {
        aiResponse = `Hello! I am GFXTAB's custom design assistant, connected to Google Gemini. What realistic graphic designs or assets should we build today?`
      }

      setChatMessages(prev => [...prev, { role: 'ai', content: aiResponse }])
    }, 600)
  }

  // Prompt workbench variant execution
  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) {
      notify.error('Empty prompt', 'Please enter a design prompt first.')
      return
    }
    setAiGenerating(true)
    setGeneratedOptions([])
    setThinkingLogs([])
    setSelectedVariant(null) // Reset detail view

    if (deepThinking) {
      const logs = [
        'Connecting to GFXTAB deep reasoning model (o1)...',
        'Deconstructing prompt tokens & semantic layout directives...',
        'Resolving geometry layers and grid placements...',
        'Matching dominant palette values with high contrast nodes...',
        'Isolating silhouettes and creating transparent vector masks...',
        'Compiling 4 high-quality design variants...'
      ]
      for (let i = 0; i < logs.length; i++) {
        setThinkingLogs(prev => [...prev, logs[i]])
        await new Promise(r => setTimeout(r, 600))
      }
    } else {
      await new Promise(r => setTimeout(r, 1000))
    }

    // Generate 4 distinct style variations of the design
    const variants = [
      {
        id: 'var-1',
        name: `${aiPrompt} (Lime Glow)`,
        url: generateSvgDesign(aiPrompt, '#c8ff00', '#ffffff'),
        palette: [{ hex: '#c8ff00' }, { hex: '#ffffff' }]
      },
      {
        id: 'var-2',
        name: `${aiPrompt} (Neon Cyan)`,
        url: generateSvgDesign(aiPrompt, '#00ffff', '#ffffff'),
        palette: [{ hex: '#00ffff' }, { hex: '#ffffff' }]
      },
      {
        id: 'var-3',
        name: `${aiPrompt} (Duo Violet)`,
        url: generateSvgDesign(aiPrompt, '#c8ff00', '#8b5cf6'),
        palette: [{ hex: '#c8ff00' }, { hex: '#8b5cf6' }]
      },
      {
        id: 'var-4',
        name: `${aiPrompt} (Minimal White)`,
        url: generateSvgDesign(aiPrompt, '#ffffff', '#888888'),
        palette: [{ hex: '#ffffff' }, { hex: '#888888' }]
      }
    ]

    setGeneratedOptions(variants)
    setAiGenerating(false)
    notify.success('AI Design generated!', 'Select one of the 4 variations to proceed.')
  }

  const handleSelectVariant = (variant) => {
    setSelectedVariant(variant)
  }

  const handleAddToCatalog = (categoryName) => {
    if (!selectedVariant) return
    const newAsset = {
      id: `ai-gen-${Date.now()}`,
      name: selectedVariant.name,
      category: categoryName,
      description: `AI Generated graphic using GFXTAB Prompt: "${aiPrompt}"`,
      previewAsset: selectedVariant.url,
      isPremium: false,
      price: 0,
      isAi: true,
      tags: ['ai-generated', 'custom', categoryName]
    }
    
    // Save to store
    useMarketplaceStore.getState().addCustomAsset(newAsset)
    notify.success('Published to Marketplace!', `Your design has been added to GFXTAB's public ${categoryName.replace('_', ' ')} catalog.`)
    navigate('/dashboard', { state: { category: categoryName } })
  }

  useEffect(() => {
    setFetchingMockups(true)
    fetch('http://localhost:4000/mockups/list')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.mockups) {
          setCreatorMockups(data.mockups)
        }
      })
      .catch(err => console.error(err))
      .finally(() => setFetchingMockups(false))
  }, [])

  const handleComplete = ({ file, fileUrl, result }) => {
    setUploadData({ file, fileUrl, result })
  }

  // If a mockup was preselected, once upload completes we automatically direct them to the editor with auto placement!
  useEffect(() => {
    if (uploadData && preSelectedMockupId) {
      notify.success('Auto-placing artwork...', `Fitting artwork to printable zone on ${preSelectedMockup?.name}`)
      navigate('/editor', { 
        state: { 
          artworkUrl: uploadData.fileUrl, 
          mockupId: preSelectedMockupId,
          product: preSelectedMockup
        } 
      })
    }
  }, [uploadData, preSelectedMockupId, navigate, preSelectedMockup, preSelectedMockup?.name])

  const copyToClipboard = (hex) => {
    navigator.clipboard.writeText(hex)
    setCopiedHex(hex)
    notify.success('Copied color code', `${hex} copied to clipboard.`)
    setTimeout(() => setCopiedHex(null), 2000)
  }

  const handleSelectMockup = (mockupId) => {
    if (!uploadData) return
    const selectedProd = recommendedMockups.find(m => m.id === mockupId)
    navigate('/editor', { 
      state: { 
        artworkUrl: uploadData.fileUrl, 
        mockupId,
        product: selectedProd
      } 
    })
  }

  // Combine AI suggested default products and creator-uploaded mockups
  const recommendedMockups = uploadData
    ? [
        ...PRODUCTS.filter(p => 
          uploadData.result.suggestions?.some(s => s.product === p.id) || false
        ),
        ...creatorMockups
      ]
    : []

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 'var(--space-12)' }}>
      <AnimatePresence mode="wait">
        {!uploadData ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
          >
            {/* Page Header */}
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-4)' }}>
                <StatusBadge status="processing" dot>GFXTAB Engine</StatusBadge>
              </div>
              <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, marginBottom: 12 }}>
                {preSelectedMockup ? `Upload artwork for ${preSelectedMockup.name}` : 'Upload your artwork'}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-md)', maxWidth: 500, margin: '0 auto' }}>
                {preSelectedMockup 
                  ? 'Select your PNG or JPG design file. GFXTAB will automatically map and place it on the canvas.'
                  : 'Drop your design asset. Our system will analyze colors and recommend ideal templates.'}
              </p>
            </div>

            {/* Tab Switcher */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 'var(--space-6)' }}>
              {[
                { id: 'file', label: 'Upload Local Design', icon: '📁' },
                { id: 'ai', label: 'GFXTAB AI Studio', icon: '🤖' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveUploadTab(t.id)}
                  style={{
                    padding: '10px 18px', borderRadius: 'var(--radius-md)',
                    background: activeUploadTab === t.id ? 'rgba(200, 255, 0, 0.15)' : 'var(--void-3)',
                    border: '1px solid', borderColor: activeUploadTab === t.id ? 'var(--lime)' : 'var(--glass-border)',
                    color: activeUploadTab === t.id ? 'var(--lime)' : '#e4e4e7',
                    fontSize: 'var(--text-sm)', cursor: 'pointer', transition: 'all 0.2s',
                    fontWeight: activeUploadTab === t.id ? 600 : 400
                  }}
                >
                  <span style={{ marginRight: 6 }}>{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Conditionally Render Upload or AI Prompt */}
            {activeUploadTab === 'file' ? (
              <UploadZone onComplete={handleComplete} />
            ) : (
              <div style={{ display: 'flex', gap: 'var(--space-6)', width: '100%', alignItems: 'stretch', minHeight: 650, flexWrap: 'wrap' }}>
                {/* Left Column: Chat Assistant */}
                <div style={{
                  flex: '1 1 360px',
                  maxWidth: '420px',
                  background: 'var(--glass)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '650px',
                  position: 'relative',
                  boxShadow: 'var(--glow-card)'
                }}>
                  {/* Chat Header */}
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1.2rem' }}>🤖</span>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: '#ffffff' }}>GFXTAB Assistant</span>
                      <span style={{ fontSize: 9, color: 'var(--lime)', fontWeight: 600, letterSpacing: '0.05em' }}>POWERED BY GEMINI PRO</span>
                    </div>
                  </div>
                  
                  {/* Chat Messages */}
                  <div id="chat-messages-container" style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 12, scrollbarWidth: 'thin' }}>
                    {chatMessages.map((msg, index) => (
                      <div key={index} style={{
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        padding: '10px 14px',
                        borderRadius: msg.role === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                        background: msg.role === 'user' ? 'var(--lime)' : 'var(--void-3)',
                        border: msg.role === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
                        color: msg.role === 'user' ? '#020208' : 'var(--text-primary)',
                        fontSize: 'var(--text-xs)',
                        lineHeight: 1.4,
                        textAlign: 'left'
                      }}>
                        {msg.content}
                      </div>
                    ))}
                  </div>

                  {/* Bottom Input Area */}
                  <div style={{ padding: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', flexDirection: 'column', gap: 10, background: 'var(--void-3)' }}>
                    {/* Deep Thinking switch */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 9, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Deep Thinking (o1)</span>
                        <button
                          type="button"
                          onClick={() => setDeepThinking(!deepThinking)}
                          style={{
                            width: 28, height: 14, borderRadius: 7,
                            background: deepThinking ? 'var(--lime)' : 'rgba(255,255,255,0.1)',
                            position: 'relative', border: 'none', cursor: 'pointer',
                            transition: 'background 0.2s',
                          }}
                        >
                          <motion.div
                            animate={{ x: deepThinking ? 14 : 2 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            style={{ width: 10, height: 10, borderRadius: 5, background: '#020208', position: 'absolute', top: 2 }}
                          />
                        </button>
                      </div>
                      <span style={{ fontSize: 8, color: 'var(--text-dim)' }}>4 Variations generated free</span>
                    </div>

                    {/* Suggestion Chips */}
                    <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
                      {['Cyberpunk astronaut', 'Geometric tech logo', 'Botanical foliage badge', 'Retro Monoline badge'].map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            setAiPrompt(s)
                            setUserInput(s)
                          }}
                          style={{
                            padding: '4px 8px', borderRadius: 'var(--radius-full)',
                            background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)',
                            color: 'var(--text-secondary)', fontSize: 9, cursor: 'pointer',
                            whiteSpace: 'nowrap', transition: 'all 0.2s'
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>

                    {/* Input bar */}
                    <div style={{
                      position: 'relative', background: 'var(--void-2)', border: '1px solid var(--glass-border)',
                      borderRadius: 'var(--radius-md)', padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 6
                    }}>
                      <textarea
                        placeholder="Describe your design design..."
                        value={userInput}
                        onChange={(e) => {
                          setUserInput(e.target.value)
                          setAiPrompt(e.target.value)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                        rows={2}
                        style={{
                          width: '100%', padding: '4px 0', background: 'none', border: 'none',
                          color: '#ffffff', fontSize: 'var(--text-xs)', resize: 'none', outline: 'none',
                          fontFamily: 'inherit', lineHeight: 1.4
                        }}
                      />

                      {/* Attached files row */}
                      {attachments.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, paddingBottom: 4 }}>
                          {attachments.map((att, idx) => (
                            <div key={idx} style={{
                              display: 'flex', alignItems: 'center', gap: 4, padding: '2px 6px',
                              borderRadius: 'var(--radius-sm)', background: 'var(--void-3)',
                              border: '1px solid rgba(255,255,255,0.08)', fontSize: 9, color: 'var(--text-secondary)'
                            }}>
                              <span>📎</span>
                              <span style={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{att.name}</span>
                              <button
                                type="button"
                                onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                                style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', padding: 0, fontWeight: 700 }}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Action buttons footer */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 6 }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <label style={{
                            width: 26, height: 26, borderRadius: 'var(--radius-sm)',
                            background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                            fontSize: '12px', color: 'var(--text-secondary)'
                          }} title="Attach Reference File">
                            <input type="file" onChange={handleFileAttach} style={{ display: 'none' }} />
                            <span>+</span>
                          </label>

                          <button
                            type="button"
                            onClick={startCamera}
                            style={{
                              width: 26, height: 26, borderRadius: 'var(--radius-sm)',
                              background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                              color: 'var(--text-secondary)', fontSize: 10
                            }} title="Capture Webcam Snapshot"
                          >
                            📷
                          </button>
                        </div>

                        <div style={{ display: 'flex', gap: 6 }}>
                          <GhostButton onClick={handleSendMessage} size="sm" style={{ padding: '0 10px', height: 26, minHeight: 26, fontSize: 10 }}>
                            Send Prompt
                          </GhostButton>
                          <GlowButton onClick={handleAiGenerate} disabled={aiGenerating} style={{ padding: '0 12px', height: 26, minHeight: 26, fontSize: 10 }}>
                            {aiGenerating ? 'Generating...' : 'Generate 4 Variants'}
                          </GlowButton>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Generation workspace & Asset Detail View */}
                <div style={{
                  flex: '1 1 500px',
                  background: 'var(--glass)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-5)',
                  height: '650px',
                  overflowY: 'auto',
                  position: 'relative',
                  boxShadow: 'var(--glow-card)',
                  scrollbarWidth: 'thin'
                }}>
                  {aiGenerating ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%', justifyContent: 'center' }}>
                      <div style={{
                        textAlign: 'left', background: '#090910', border: '1px solid var(--glass-border)',
                        borderRadius: 'var(--radius-md)', padding: 'var(--space-5)',
                        fontFamily: 'Courier New, monospace', fontSize: '11px', color: '#a1a1aa',
                        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.8)', flex: 1, display: 'flex', flexDirection: 'column'
                      }}>
                        <div style={{ color: 'var(--lime)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 8, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>o1-Thinking Reasoning Logs:</span>
                          <span className="pulse" style={{ color: 'var(--lime)' }}>Active</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', flex: 1 }}>
                          {thinkingLogs.map((log, index) => (
                            <div key={index} className="typewriter-log" style={{ whiteSpace: 'pre-wrap' }}>
                              &gt; {log}
                            </div>
                          ))}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--lime)', marginTop: 8 }}>
                            <span className="spin" style={{ width: 12, height: 12, border: '2px solid var(--lime)', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block' }} />
                            <span>Synthesizing vectors and shaders...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : generatedOptions.length > 0 ? (
                    selectedVariant ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left' }}>
                        {/* Detail Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: 10 }}>
                          <button
                            type="button"
                            onClick={() => setSelectedVariant(null)}
                            style={{
                              background: 'none', border: 'none', color: 'var(--lime)', cursor: 'pointer',
                              fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600
                            }}
                          >
                            ← Back to variations
                          </button>
                          <span style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>AI Asset Detail View</span>
                        </div>

                        {/* Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
                          {/* Large Preview */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <GlassCard style={{
                              aspectRatio: '1/1', background: 'var(--void-3)', borderRadius: 'var(--radius-md)',
                              overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              border: '1px solid rgba(255,255,255,0.06)', padding: 24, position: 'relative'
                            }}>
                              <div style={{
                                position: 'absolute', inset: 0, opacity: 0.1, zIndex: 0,
                                backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px), radial-gradient(#ffffff 1px, transparent 1px)',
                                backgroundSize: '16px 16px', backgroundPosition: '0 0, 8px 8px'
                              }} />
                              <img src={selectedVariant.url} alt={selectedVariant.name} style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'relative', zIndex: 1 }} />
                            </GlassCard>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#ffffff' }}>{selectedVariant.name}</div>
                          </div>

                          {/* Controls */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <GlassCard style={{ padding: 12, background: 'var(--void-2)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                <span style={{ fontSize: 9, color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Original Prompt</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(aiPrompt)
                                    notify.success('Prompt copied!')
                                  }}
                                  style={{
                                    background: 'none', border: 'none', color: 'var(--lime)', cursor: 'pointer',
                                    fontSize: 9, display: 'flex', alignItems: 'center', gap: 4
                                  }}
                                >
                                  <Copy size={10} /> Copy Prompt
                                </button>
                              </div>
                              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-primary)', margin: 0, lineHeight: 1.4, wordBreak: 'break-word' }}>
                                "{aiPrompt}"
                              </p>
                            </GlassCard>

                            <div>
                              <span style={{ fontSize: 9, color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: 6 }}>Extracted Palette (Click to Copy)</span>
                              <div style={{ display: 'flex', gap: 10 }}>
                                {selectedVariant.palette.map((color, idx) => (
                                  <div
                                    key={idx}
                                    onClick={() => copyToClipboard(color.hex)}
                                    style={{
                                      flex: 1, cursor: 'pointer', padding: '6px', background: 'var(--void-2)',
                                      borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.04)',
                                      display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', transition: 'all 0.2s'
                                    }}
                                    className="hover-card"
                                  >
                                    <div style={{ width: '100%', height: 24, borderRadius: 'var(--radius-sm)', background: color.hex, border: '1px solid rgba(255,255,255,0.2)' }} />
                                    <span style={{ fontSize: 8, color: 'var(--text-primary)', fontWeight: 600 }}>{color.hex}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <span style={{ fontSize: 9, color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: 6 }}>Direct Downloads</span>
                              <div style={{ display: 'flex', gap: 10 }}>
                                <GlowButton onClick={() => downloadAsset(selectedVariant.url, selectedVariant.name, 'png')} style={{ flex: 1, fontSize: 11, justifyContent: 'center', height: 36, minHeight: 36 }}>
                                  Download PNG
                                </GlowButton>
                                <GhostButton onClick={() => downloadAsset(selectedVariant.url, selectedVariant.name, 'jpeg')} style={{ flex: 1, fontSize: 11, justifyContent: 'center', height: 36, minHeight: 36 }}>
                                  Download JPEG
                                </GhostButton>
                              </div>
                            </div>

                            <GlassCard style={{ padding: 12, border: '1px solid rgba(200, 255, 0, 0.15)', background: 'rgba(200, 255, 0, 0.02)' }}>
                              <span style={{ fontSize: 9, color: 'var(--lime)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: 8, letterSpacing: '0.05em' }}>Publish to Catalog</span>
                              
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div>
                                  <label style={{ fontSize: 9, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>Select Target Category:</label>
                                  <select
                                    id="target-catalog-category"
                                    defaultValue="photos"
                                    style={{
                                      width: '100%', padding: '6px 10px', background: 'var(--void-3)',
                                      border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)',
                                      color: 'var(--text-primary)', fontSize: 'var(--text-xs)', outline: 'none'
                                    }}
                                  >
                                    <option value="web_ui">Web & UI</option>
                                    <option value="vectors">Vectors (EPS)</option>
                                    <option value="icons">Icons</option>
                                    <option value="photos">Photos & Images</option>
                                    <option value="mailers">Mailers & Invites</option>
                                    <option value="logos">Logos</option>
                                    <option value="social_posts">Social Media Posts</option>
                                    <option value="artworks">Our Artworks</option>
                                  </select>
                                </div>

                                <GlowButton
                                  onClick={() => {
                                    const catSelect = document.getElementById('target-catalog-category')
                                    const catVal = catSelect ? catSelect.value : 'photos'
                                    handleAddToCatalog(catVal)
                                  }}
                                  style={{ width: '100%', justifyContent: 'center', height: 36, minHeight: 36, fontSize: 11, boxShadow: '0 0 15px rgba(200, 255, 0, 0.25)' }}
                                >
                                  Publish to Catalog
                                </GlowButton>
                              </div>
                            </GlassCard>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
                        <div style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 10 }}>
                          <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 700, margin: 0 }}>Design Variations (4 Styles)</h3>
                          <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>Select a variation to open the Showcase Detail & Publishing panel.</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, flex: 1 }}>
                          {generatedOptions.map((opt) => (
                            <GlassCard
                              key={opt.id}
                              onClick={() => handleSelectVariant(opt)}
                              style={{
                                overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column',
                                border: '1px solid var(--glass-border)', transition: 'all 0.2s', padding: 12,
                                background: 'var(--void-3)', justifyContent: 'center'
                              }}
                              className="hover-card"
                            >
                              <div style={{
                                aspectRatio: '1/1', background: 'var(--void-2)', borderRadius: 'var(--radius-sm)',
                                overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '1px solid rgba(255,255,255,0.04)', padding: 16, position: 'relative'
                              }}>
                                <img src={opt.url} alt={opt.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                
                                <span style={{
                                  position: 'absolute', bottom: 8, right: 8, background: 'rgba(2,2,8,0.7)',
                                  color: 'var(--lime)', fontSize: 8, fontWeight: 700, padding: '2px 6px',
                                  borderRadius: 'var(--radius-full)', border: '1px solid rgba(200, 255, 0, 0.2)'
                                }}>
                                  View Showcase
                                </span>
                              </div>
                              <div style={{ marginTop: 10, textAlign: 'left' }}>
                                <div style={{ fontSize: 11, fontWeight: 600, color: '#ffffff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{opt.name}</div>
                                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                                  {opt.palette.map((p, pIdx) => (
                                    <div key={pIdx} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.hex, border: '1px solid rgba(255,255,255,0.2)' }} />
                                      <span style={{ fontSize: 8, color: 'var(--text-dim)' }}>{p.hex}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </GlassCard>
                          ))}
                        </div>
                      </div>
                    )
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%', justifyContent: 'center', alignItems: 'center', padding: '40px 20px', textAlign: 'center' }}>
                      <div style={{
                        width: 100, height: 100, borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(200, 255, 0, 0.2), transparent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1px solid rgba(200, 255, 0, 0.1)', marginBottom: 12,
                        boxShadow: '0 0 30px rgba(200, 255, 0, 0.1)'
                      }}>
                        <Sparkles size={40} color="var(--lime)" className="pulse" />
                      </div>
                      <h3 style={{ fontSize: 'var(--text-lg)', color: '#ffffff', fontFamily: 'var(--font-display)', margin: 0 }}>GFXTAB AI Generation Workspace</h3>
                      <p style={{ color: 'var(--text-dim)', fontSize: 'var(--text-sm)', maxWidth: 360, margin: '0 auto', lineHeight: 1.6 }}>
                        Your generated assets and vector mockups will appear here. Submit a prompt or discuss with the Gemini assistant on the left.
                      </p>
                    </div>
                  )}
                </div>

                {/* Webcam capture workbench modal */}
                {cameraOpen && (
                  <div style={{
                    position: 'fixed', inset: 0, zIndex: 100,
                    background: 'rgba(2,2,8,0.85)', backdropFilter: 'blur(10px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 'var(--space-4)'
                  }}>
                    <GlassCard style={{ width: '100%', maxWidth: 500, padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <h3 style={{ fontSize: 'var(--text-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: 0 }}>
                        <span>Webcam Capture Workbench</span>
                        <GhostButton size="sm" onClick={stopCamera}>Close</GhostButton>
                      </h3>
                      
                      <div style={{
                        width: '100%', aspectRatio: '4/3', background: '#000', borderRadius: 'var(--radius-md)',
                        overflow: 'hidden', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        position: 'relative'
                      }}>
                        {cameraStream ? (
                          <video id="webcam-video" autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
                            <span style={{ fontSize: '2rem', display: 'block', marginBottom: 12 }}>📷</span>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', marginBottom: 16 }}>Webcam access is unavailable or denied.</p>
                            <GlowButton size="sm" onClick={captureSnapshot}>Simulate Camera Snapshot</GlowButton>
                          </div>
                        )}
                      </div>

                      {cameraStream && (
                        <GlowButton onClick={captureSnapshot} style={{ justifyContent: 'center' }}>
                          Capture Snapshot
                        </GlowButton>
                      )}
                    </GlassCard>
                  </div>
                )}
              </div>
            )}

            {/* Features Info */}
            {!preSelectedMockup && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--space-4)',
                marginTop: 'var(--space-8)',
              }}>
                {[
                  { icon: '🎨', title: 'Dominant Color Extraction', desc: 'Auto-detect color coordinates using ColorThief' },
                  { icon: '🤖', title: 'Content Analysis', desc: 'Identify vector logos vs photographic canvases' },
                  { icon: '📐', title: 'Automatic Smart Placement', desc: 'Fits your design to the template canvas coordinates' },
                ].map((f, i) => (
                  <div
                    key={i}
                    style={{
                      padding: 'var(--space-5)',
                      background: 'var(--glass)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div style={{ fontSize: '1.4rem', marginBottom: 8 }}>{f.icon}</div>
                    <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>{f.title}</h3>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{f.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="suggestions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}
          >
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: 'var(--space-4)' }}>
              <div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--lime)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  ✓ Asset Analyzed
                </span>
                <h1 style={{ fontSize: 'var(--text-2xl)', marginTop: 4 }}>
                  Detected format: <span style={{ color: 'var(--lime)', textTransform: 'capitalize' }}>{uploadData.result.imageType}</span>
                </h1>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 4 }}>
                  Transparent PNG: <strong style={{ color: uploadData.result.isTransparent ? 'var(--green)' : 'var(--orange)' }}>{uploadData.result.isTransparent ? 'Yes (Detected)' : 'No (JPEG/Non-transparent - Blending recommended)'}</strong>
                </div>
              </div>
              <GhostButton onClick={() => setUploadData(null)}>
                <RefreshCw size={14} style={{ marginRight: 6 }} /> Upload Different File
              </GhostButton>
            </div>

            {/* Color Palette Display */}
            <GlassCard style={{ padding: 'var(--space-6)' }}>
              <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>Extracted Dominant Color Palette</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
                {uploadData.result.palette.map((color, idx) => (
                  <div 
                    key={idx}
                    onClick={() => copyToClipboard(color.hex)}
                    style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 6 }}
                  >
                    <div style={{
                      height: 52, borderRadius: 'var(--radius-sm)',
                      background: color.hex, border: '1px solid rgba(255,255,255,0.06)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {copiedHex === color.hex && <Check size={16} color={idx === 4 ? '#000' : '#fff'} />}
                    </div>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-primary)', textAlign: 'center', fontWeight: 600 }}>{color.hex}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-dim)', textAlign: 'center' }}>{color.name}</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Recommendation Grid */}
            <div>
              <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>Choose a template to apply your artwork</h2>
              {recommendedMockups.length === 0 ? (
                <GlassCard style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-dim)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
                    No unbranded mockup templates have been uploaded by creators yet.
                  </p>
                  <GlowButton onClick={() => navigate('/creator')} style={{ margin: '0 auto' }}>
                    Go to Creator Panel & Upload Templates
                  </GlowButton>
                </GlassCard>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-6)' }}>
                  {recommendedMockups.map((m) => (
                    <GlassCard
                      key={m.id}
                      onClick={() => handleSelectMockup(m.id)}
                      style={{ overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                    >
                      <div style={{ aspectRatio: '4/3', overflow: 'hidden', background: 'var(--void-2)' }}>
                        <img 
                          src={m.previewAsset.startsWith('http') || m.previewAsset.startsWith('data:') ? m.previewAsset : `/assets/${m.previewAsset}`} 
                          alt={m.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      </div>
                      <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', flex: 1, justify: 'between' }}>
                        <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{m.name}</h4>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>{m.description}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 'var(--space-2)' }}>
                          <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>{m.category}</span>
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--lime)', fontWeight: 600 }}>Apply</span>
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              )}
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
