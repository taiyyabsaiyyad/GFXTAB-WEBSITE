import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, UploadCloud, RefreshCw, Copy, CheckCircle, Image as ImageIcon, Video, FileText, Sparkles, Download, Layers, Box, Cpu } from 'lucide-react'
import { GlassCard } from '@/components/ui/Card.jsx'
import { GlowButton, GhostButton } from '@/components/ui/Button.jsx'
import { notify } from '@/components/ui/Toast.jsx'
import { useAuthStore } from '@/store/index.js'

const AI_MODES = [
  'Chat', 'Logo', 'Branding', 'Social Media Post', 'Website Layout', 
  'Motion Idea', 'Mockup', 'Creative Brief', 'Multi-Agent Plan'
]

// Simple markdown renderer for AI text
function parseMarkdown(text) {
  if (!text) return null
  return text.split('\n').map((line, idx) => {
    if (line.startsWith('### ')) return <h3 key={idx} style={{ marginTop: 12, marginBottom: 8, color: 'var(--lime)', fontSize: 16 }}>{line.replace('### ', '')}</h3>
    if (line.startsWith('## ')) return <h2 key={idx} style={{ marginTop: 16, marginBottom: 8, color: '#fff', fontSize: 18 }}>{line.replace('## ', '')}</h2>
    if (line.startsWith('> ')) return <blockquote key={idx} style={{ borderLeft: '3px solid var(--lime)', paddingLeft: 12, color: 'var(--text-dim)', fontStyle: 'italic', margin: '8px 0' }}>{line.replace('> ', '')}</blockquote>
    if (line.startsWith('- ') || line.startsWith('• ')) return <li key={idx} style={{ marginLeft: 20, marginBottom: 4 }}>{renderInline(line.slice(2))}</li>
    
    // Empty line
    if (!line.trim()) return <div key={idx} style={{ height: 8 }} />
    
    return <p key={idx} style={{ marginBottom: 8, lineHeight: 1.6 }}>{renderInline(line)}</p>
  })
}

function renderInline(text) {
  // Bold
  const parts = text.split(/(\*\*.*?\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: '#fff', fontWeight: 600 }}>{part.slice(2, -2)}</strong>
    }
    // Inline code
    const codeParts = part.split(/(`.*?`)/g)
    return codeParts.map((cp, j) => {
      if (cp.startsWith('`') && cp.endsWith('`')) {
        return <span key={`${i}-${j}`} style={{ background: 'var(--void-3)', padding: '2px 6px', borderRadius: 4, color: 'var(--lime)', fontFamily: 'monospace', fontSize: '0.9em' }}>{cp.slice(1, -1)}</span>
      }
      return cp
    })
  })
}

export default function AIWorkspace() {
  const { user } = useAuthStore()
  
  // Left Panel State
  const [activeMode, setActiveMode] = useState('Logo')
  const [messages, setMessages] = useState([
    { role: 'model', content: 'Welcome to GFXTAB AI Studio ✨' }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [attachments, setAttachments] = useState([]) // base64 strings
  const chatEndRef = useRef(null)

  // Right Panel State (Structured Output)
  const [structuredData, setStructuredData] = useState(null)
  const [generatedOptions, setGeneratedOptions] = useState([])
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [isGeneratingAssets, setIsGeneratingAssets] = useState(false)

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Handle mode change
  useEffect(() => {
    if (messages.length <= 1) {
      setMessages([{ role: 'model', content: 'Welcome to GFXTAB AI Studio ✨' }])
    }
    setStructuredData(null)
    setGeneratedOptions([])
  }, [activeMode])

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + attachments.length > 3) {
      notify.error('Maximum 3 attachments allowed per prompt.')
      return
    }

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        notify.error(`${file.name} is too large (max 5MB).`)
        return
      }
      
      const reader = new FileReader()
      reader.onload = (event) => {
        setAttachments(prev => [...prev, { name: file.name, type: file.type, data: event.target.result }])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() && attachments.length === 0) return

    const userMsg = inputValue.trim()
    const currentAttachments = [...attachments]
    
    setMessages(prev => [...prev, { role: 'user', content: userMsg, attachments: currentAttachments }])
    setInputValue('')
    setAttachments([])
    setIsTyping(true)

    // Add empty model message to be streamed into
    setMessages(prev => [...prev, { role: 'model', content: '' }])

    try {
      const sessionId = user?.id || 'guest-session'
      const response = await fetch('http://localhost:4000/studio/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMsg, 
          sessionId, 
          aiMode: activeMode,
          attachments: currentAttachments.map(a => a.data) 
        })
      })

      if (!response.ok) throw new Error('Failed to connect to AI')

      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let aiText = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (data.type === 'meta') {
                if (data.engineeredPrompt) {
                  setStructuredData(prev => ({
                    ...prev,
                    intent: data.intent,
                    prompt: data.engineeredPrompt
                  }))
                }
              } else if (data.type === 'token') {
                aiText += data.text
                setMessages(prev => {
                  const newMsgs = [...prev]
                  newMsgs[newMsgs.length - 1].content = aiText
                  return newMsgs
                })
              }
            } catch (e) {
              // Ignore parse errors on partial chunks
            }
          }
        }
      }
    } catch (err) {
      console.error(err)
      notify.error('AI connection failed.')
      setMessages(prev => {
        const newMsgs = [...prev]
        newMsgs[newMsgs.length - 1].content = 'Sorry, the AI connection was interrupted. Please try again.'
        return newMsgs
      })
    } finally {
      setIsTyping(false)
      // Check if we should auto-generate assets based on intent
      if (structuredData?.prompt && !isGeneratingAssets && generatedOptions.length === 0) {
        // Show the prompt to user to optionally click "Generate Visuals"
      }
    }
  }

  const handleGenerateAssets = async () => {
    if (!structuredData?.prompt) return
    
    setIsGeneratingAssets(true)
    setGeneratedOptions([])
    setSelectedVariant(null)

    // Simulate backend generation pipeline
    setTimeout(() => {
      const mockVars = [
        { id: 1, name: 'Minimal Core', image: 'Photo from GFXTAB(1).jpg', rationale: 'Clean, typography-led direction focusing on stark contrast.' },
        { id: 2, name: 'Cyber Neon', image: 'Photo from GFXTAB(5).jpg', rationale: 'High-energy layout using deep blacks and bright neon accents.' },
        { id: 3, name: 'Organic Premium', image: 'Photo from GFXTAB(32).jpg', rationale: 'Soft textures and elegant serif integrations.' },
        { id: 4, name: 'Brutalist Structural', image: 'Photo from GFXTAB(28).jpg', rationale: 'Grid-heavy, technical, and highly structured presentation.' },
      ]
      setGeneratedOptions(mockVars)
      setSelectedVariant(mockVars[0])
      
      // Update structured data with fake extracted palette
      setStructuredData(prev => ({
        ...prev,
        title: `${activeMode} Design Brief`,
        colors: ['#090910', '#C8FF00', '#FFFFFF', '#1A1A24'],
        fonts: ['Inter', 'Clash Display']
      }))
      
      setIsGeneratingAssets(false)
      notify.success('Assets Generated Successfully')
    }, 4000)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    notify.success('Copied to clipboard')
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 180px)', minHeight: 500, gap: 'var(--space-8)', width: '100%', overflow: 'hidden', paddingBottom: 'var(--space-4)' }}>
      
      {/* LEFT PANEL: AI Chat Workspace */}
      <GlassCard style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        
        {/* Header & Modes */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--glass-border)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Cpu size={20} color="var(--lime)" /> GFXTAB AI Workspace
          </h2>
          
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, className: 'no-scrollbar' }}>
            {AI_MODES.map(mode => (
              <button
                key={mode}
                onClick={() => setActiveMode(mode)}
                style={{
                  padding: '6px 14px', borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap',
                  background: activeMode === mode ? 'rgba(200,255,0,0.1)' : 'transparent',
                  color: activeMode === mode ? 'var(--lime)' : 'var(--text-secondary)',
                  border: `1px solid ${activeMode === mode ? 'var(--lime)' : 'var(--glass-border)'}`,
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Chat History */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
              
              {/* Avatar */}
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: msg.role === 'user' ? 'var(--void-3)' : 'rgba(200,255,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {msg.role === 'user' ? <span style={{ fontSize: 14, fontWeight: 700 }}>{user?.name?.[0] || 'U'}</span> : <Sparkles size={18} color="var(--lime)" />}
              </div>

              {/* Message Bubble */}
              <div style={{ maxWidth: '85%', display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ 
                  background: msg.role === 'user' ? 'var(--void-2)' : 'transparent',
                  padding: msg.role === 'user' ? '12px 16px' : '0',
                  borderRadius: 'var(--radius-lg)',
                  border: msg.role === 'user' ? '1px solid var(--glass-border)' : 'none',
                  color: 'var(--text-primary)', fontSize: 15
                }}>
                  
                  {/* Render Attachments */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                      {msg.attachments.map((att, i) => (
                        <div key={i} style={{ width: 60, height: 60, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                          {att.type.startsWith('image/') ? (
                            <img src={att.data} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="attachment" />
                          ) : (
                            <div style={{ width: '100%', height: '100%', background: 'var(--void-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={20} color="var(--text-dim)" /></div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.role === 'user' ? (
                    <p style={{ lineHeight: 1.5 }}>{msg.content}</p>
                  ) : (
                    <div>{parseMarkdown(msg.content)}</div>
                  )}
                </div>

                {/* AI Action Buttons */}
                {msg.role === 'model' && msg.content && idx !== 0 && (
                  <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                    <button onClick={() => copyToClipboard(msg.content)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }} className="hover-text-primary">
                      <Copy size={14} /> Copy
                    </button>
                    {idx === messages.length - 1 && structuredData?.prompt && !generatedOptions.length && (
                      <button onClick={handleGenerateAssets} style={{ background: 'none', border: 'none', color: 'var(--lime)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600 }}>
                        <Layers size={14} /> Generate Visual Assets
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(200,255,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={18} color="var(--lime)" />
              </div>
              <div style={{ padding: '12px 0', color: 'var(--lime)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }} className="pulsing-text">
                <div className="spin" style={{ width: 14, height: 14, border: '2px solid var(--lime)', borderTopColor: 'transparent', borderRadius: '50%' }} /> Thinking...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ padding: 24, borderTop: '1px solid var(--glass-border)', background: 'rgba(9,9,16,0.5)' }}>
          
          {/* Staged Attachments */}
          {attachments.length > 0 && (
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              {attachments.map((att, idx) => (
                <div key={idx} style={{ position: 'relative', width: 48, height: 48, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--lime)' }}>
                  {att.type.startsWith('image/') ? (
                    <img src={att.data} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="staging" />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'var(--void-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={16} /></div>
                  )}
                  <button onClick={() => removeAttachment(idx)} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', borderRadius: '50%', width: 16, height: 16, fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: '50%', background: 'var(--void-3)', color: 'var(--text-secondary)' }} className="hover-card">
              <UploadCloud size={20} />
              <input type="file" multiple accept="image/*,video/mp4,application/pdf" style={{ display: 'none' }} onChange={handleFileUpload} />
            </label>
            
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={`Send a message to ${activeMode} Agent...`}
              style={{ flex: 1, background: 'var(--void-2)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-full)', padding: '14px 20px', color: '#fff', fontSize: 15 }}
            />
            
            <GlowButton onClick={handleSendMessage} disabled={isTyping || (!inputValue.trim() && attachments.length === 0)} style={{ padding: '0 20px', height: 44 }}>
              <Send size={18} />
            </GlowButton>
          </div>
        </div>
      </GlassCard>

      {/* RIGHT PANEL: Creative Output Workspace */}
      <AnimatePresence>
        {(structuredData || isGeneratingAssets || generatedOptions.length > 0) ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', overflowY: 'auto', paddingRight: 8 }}
            className="no-scrollbar"
          >
            {/* Project Overview Card */}
            {structuredData && (
              <GlassCard>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <span style={{ color: 'var(--lime)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{activeMode} Brief</span>
                    <h2 style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>{structuredData.title || 'Creative Strategy'}</h2>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <GhostButton><Download size={16} /></GhostButton>
                  </div>
                </div>

                {structuredData.colors && (
                  <div style={{ marginBottom: 20 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>Extracted Palette</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {structuredData.colors.map(hex => (
                        <div key={hex} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--void-2)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--glass-border)' }}>
                          <div style={{ width: 14, height: 14, borderRadius: '50%', background: hex }} />
                          <span style={{ fontSize: 12, fontFamily: 'monospace' }}>{hex}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </GlassCard>
            )}

            {/* Visual Output Section */}
            {isGeneratingAssets ? (
              <GlassCard style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
                <div className="spin" style={{ width: 50, height: 50, border: '3px solid var(--lime)', borderTopColor: 'transparent', borderRadius: '50%', marginBottom: 24 }} />
                <h3 style={{ fontSize: 18, fontWeight: 600 }}>Synthesizing Visuals</h3>
                <p style={{ color: 'var(--text-dim)', marginTop: 8 }}>Applying style context and rendering variations...</p>
              </GlassCard>
            ) : generatedOptions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                {/* Main Preview */}
                {selectedVariant && (
                  <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
                      <img src={`${import.meta.env.BASE_URL}assets/IMG/${selectedVariant.image}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Selected" />
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, background: 'linear-gradient(to top, rgba(9,9,16,0.9), transparent)' }}>
                        <h3 style={{ fontSize: 24, fontWeight: 800 }}>{selectedVariant.name}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>{selectedVariant.rationale}</p>
                      </div>
                    </div>
                  </GlassCard>
                )}

                {/* Variations Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                  {generatedOptions.map(opt => (
                    <div 
                      key={opt.id}
                      onClick={() => setSelectedVariant(opt)}
                      style={{ 
                        aspectRatio: '1', borderRadius: 'var(--radius-md)', overflow: 'hidden', cursor: 'pointer',
                        border: `2px solid ${selectedVariant?.id === opt.id ? 'var(--lime)' : 'transparent'}`,
                        transition: 'all 0.2s'
                      }}
                    >
                      <img src={`${import.meta.env.BASE_URL}assets/IMG/${opt.image}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={opt.name} />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

          </motion.div>
        ) : (
          <div style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--glass-border)', borderRadius: 'var(--radius-xl)', padding: 40, textAlign: 'center' }}>
            <Box size={48} color="var(--void-3)" style={{ marginBottom: 16 }} />
            <h3 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-secondary)' }}>Creative Output Workspace</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: 14, maxWidth: 300, marginTop: 8 }}>Chat with the AI on the left to build a creative brief. Your generated assets and structured data will appear here.</p>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
