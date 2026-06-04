/**
 * GFXTAB AI Studio — Production-Grade AI Creative Assistant
 * ChatGPT-style interface · Streaming · Memory · Intent · Image Generation
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'

const uuid = () => crypto.randomUUID()


// ── Icons (inline SVG for zero-dep) ──────────────────────────────
const Icon = ({ d, size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)
const SendIcon = () => <Icon d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
const SparkleIcon = () => <Icon d="M9.937 15.5A2 2 0 008.5 14.063l-6.135-1.582a.5.5 0 010-.962L8.5 9.936A2 2 0 009.937 8.5l1.582-6.135a.5.5 0 01.963 0L14.063 8.5A2 2 0 0015.5 9.937l6.135 1.581a.5.5 0 010 .964L15.5 14.063a2 2 0 00-1.437 1.437l-1.582 6.135a.5.5 0 01-.963 0z" />
const ImageIcon = () => <Icon d="M15 8h.01M2 9.5L2 17a2 2 0 002 2h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v2.5" />
const DownloadIcon = () => <Icon d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
const RefreshIcon = () => <Icon d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15" />
const TrashIcon = () => <Icon d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
const BrainIcon = () => <Icon d="M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-4.96-.44 2.5 2.5 0 01-2.96-3.08 3 3 0 01-.34-5.58 2.5 2.5 0 011.32-4.24 2.5 2.5 0 011.44-4.66A2.5 2.5 0 019.5 2M14.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 004.96-.44 2.5 2.5 0 002.96-3.08 3 3 0 00.34-5.58 2.5 2.5 0 00-1.32-4.24 2.5 2.5 0 00-1.44-4.66A2.5 2.5 0 0014.5 2" />
const HistoryIcon = () => <Icon d="M3 3v5h5M3.05 13A9 9 0 1011 2.95" />
const GalleryIcon = () => <Icon d="M18 3H6a3 3 0 00-3 3v12a3 3 0 003 3h12a3 3 0 003-3V6a3 3 0 00-3-3zM8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM21 15l-5-5L5 21" />
const CopyIcon = () => <Icon d="M20 9H11a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-9a2 2 0 00-2-2zM5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
const PublishIcon = () => <Icon d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
const CloseIcon = () => <Icon d="M18 6L6 18M6 6l12 12" />

// ── Session ID (per-tab persistent) ──────────────────────────────
const SESSION_ID = (() => {
  const k = 'gfxtab_studio_session'
  let id = sessionStorage.getItem(k)
  if (!id) { id = uuid(); sessionStorage.setItem(k, id) }
  return id
})()

const API_BASE = 'http://localhost:4000/studio'

// ── Thinking Indicator ────────────────────────────────────────────
function ThinkingDots() {
  return (
    <div className="studio-thinking">
      <SparkleIcon />
      <span>GFXTAB AI is thinking</span>
      <div className="dots">
        <span /><span /><span />
      </div>
    </div>
  )
}

// ── Markdown Message Bubble ────────────────────────────────────────
function MessageBubble({ msg, onCopy }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content)
    setCopied(true)
    onCopy?.()
    setTimeout(() => setCopied(false), 2000)
  }

  const isAssistant = msg.role === 'assistant'

  return (
    <div className={`studio-msg ${isAssistant ? 'studio-msg--ai' : 'studio-msg--user'}`}>
      {isAssistant && (
        <div className="studio-msg__avatar">
          <SparkleIcon />
        </div>
      )}
      <div className="studio-msg__body">
        {msg.intent && msg.intent !== 'chat' && (
          <div className="studio-msg__intent-badge">
            <span className="intent-pill">{msg.intent.toUpperCase()}</span>
            {msg.needsImage && <span className="intent-pill intent-pill--img">🖼 IMAGE</span>}
          </div>
        )}
        <div className="studio-msg__content">
          {isAssistant ? (
            <ReactMarkdown
              components={{
                strong: ({ children }) => <strong style={{ color: 'var(--lime)' }}>{children}</strong>,
                blockquote: ({ children }) => <blockquote className="md-quote">{children}</blockquote>,
                code: ({ children }) => <code className="md-code">{children}</code>,
                ul: ({ children }) => <ul className="md-ul">{children}</ul>,
                li: ({ children }) => <li className="md-li">{children}</li>,
                h1: ({ children }) => <h1 className="md-h1">{children}</h1>,
                h2: ({ children }) => <h2 className="md-h2">{children}</h2>,
              }}
            >
              {msg.content}
            </ReactMarkdown>
          ) : (
            <p>{msg.content}</p>
          )}
        </div>

        {/* Engineered Prompt pill */}
        {msg.engineeredPrompt && (
          <details className="studio-prompt-detail">
            <summary>🔧 View Engineered Prompt</summary>
            <div className="studio-prompt-box">{msg.engineeredPrompt}</div>
          </details>
        )}

        {/* Action row */}
        {isAssistant && (
          <div className="studio-msg__actions">
            <button className="msg-action-btn" onClick={handleCopy} title="Copy">
              <CopyIcon />{copied ? 'Copied!' : 'Copy'}
            </button>
            {msg.needsImage && msg.isComplete && (
              <button className="msg-action-btn msg-action-btn--lime" onClick={() => msg.onGenerate?.(msg.content)}>
                <ImageIcon />Generate Image
              </button>
            )}
          </div>
        )}
      </div>
      {!isAssistant && <div className="studio-msg__user-avatar">U</div>}
    </div>
  )
}

// ── Image Variant Card ─────────────────────────────────────────────
function VariantCard({ variant, onSelect, isSelected, onDownload, onPublish }) {
  return (
    <div className={`variant-card ${isSelected ? 'variant-card--selected' : ''}`} onClick={() => onSelect(variant)}>
      <div className="variant-card__img-wrap">
        <img src={variant.url} alt={variant.name} loading="lazy" />
        <div className="variant-card__overlay">
          <button className="variant-overlay-btn" onClick={e => { e.stopPropagation(); onDownload(variant) }}>
            <DownloadIcon />
          </button>
          <button className="variant-overlay-btn" onClick={e => { e.stopPropagation(); onPublish(variant) }}>
            <PublishIcon />
          </button>
        </div>
      </div>
      <div className="variant-card__meta">
        <span className="variant-card__name">{variant.name}</span>
        {variant.palette?.length > 0 && (
          <div className="variant-card__palette">
            {variant.palette.map((c, i) => (
              <span key={i} className="palette-dot" style={{ background: c }} title={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Gallery Modal ──────────────────────────────────────────────────
function GalleryModal({ items, onClose }) {
  return (
    <div className="studio-modal-overlay" onClick={onClose}>
      <div className="studio-modal" onClick={e => e.stopPropagation()}>
        <div className="studio-modal__header">
          <h2>🖼 Generated Gallery</h2>
          <button className="modal-close-btn" onClick={onClose}><CloseIcon /></button>
        </div>
        <div className="studio-modal__gallery">
          {items.map(item => (
            <div key={item.id} className="gallery-item">
              <img src={item.url} alt={item.name} />
              <div className="gallery-item__label">{item.name}</div>
              <div className="gallery-item__actions">
                <button className="gallery-action-btn" onClick={() => {
                  const a = document.createElement('a')
                  a.href = item.url
                  a.download = `${item.name}.png`
                  a.click()
                }}>
                  <DownloadIcon /> Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Sidebar Panel ──────────────────────────────────────────────────
function SidePanel({ memory, chatHistory, allImages, onClearSession, onViewGallery }) {
  const [tab, setTab] = useState('memory')
  const intentCounts = useMemo(() => {
    const counts = {}
    chatHistory.filter(m => m.role === 'user').forEach(m => {
      const i = m.intent || 'chat'
      counts[i] = (counts[i] || 0) + 1
    })
    return counts
  }, [chatHistory])

  return (
    <aside className="studio-side-panel">
      <div className="side-panel-tabs">
        <button className={tab === 'memory' ? 'spt--active' : ''} onClick={() => setTab('memory')}>
          <BrainIcon />Memory
        </button>
        <button className={tab === 'history' ? 'spt--active' : ''} onClick={() => setTab('history')}>
          <HistoryIcon />History
        </button>
        <button className={tab === 'gallery' ? 'spt--active' : ''} onClick={() => setTab('gallery')}>
          <GalleryIcon />Gallery
        </button>
      </div>

      {tab === 'memory' && (
        <div className="side-panel-content">
          <div className="spc-title">Session Memory</div>
          {Object.keys(memory).length === 0 ? (
            <p className="spc-empty">No memory captured yet. Start chatting — I'll remember your brand, style, and preferences.</p>
          ) : (
            <div className="memory-items">
              {Object.entries(memory).map(([k, v]) => (
                <div key={k} className="memory-item">
                  <span className="memory-key">{k}</span>
                  <span className="memory-val">{String(v)}</span>
                </div>
              ))}
            </div>
          )}
          <div className="spc-title" style={{ marginTop: '24px' }}>Intent Breakdown</div>
          {Object.keys(intentCounts).length === 0 ? (
            <p className="spc-empty">No intents detected yet.</p>
          ) : (
            <div className="intent-items">
              {Object.entries(intentCounts).map(([intent, count]) => (
                <div key={intent} className="intent-row">
                  <span className="intent-label">{intent}</span>
                  <span className="intent-count">{count}x</span>
                </div>
              ))}
            </div>
          )}
          <button className="danger-btn" onClick={onClearSession}>
            <TrashIcon />Clear Session
          </button>
        </div>
      )}

      {tab === 'history' && (
        <div className="side-panel-content">
          <div className="spc-title">Prompt History</div>
          {chatHistory.filter(m => m.role === 'user').length === 0 ? (
            <p className="spc-empty">Your messages will appear here.</p>
          ) : (
            <div className="history-list">
              {chatHistory.filter(m => m.role === 'user').map((m, i) => (
                <div key={i} className="history-item">
                  <span className="history-index">#{chatHistory.filter(x => x.role === 'user').indexOf(m) + 1}</span>
                  <span className="history-text">{m.content.slice(0, 60)}{m.content.length > 60 ? '…' : ''}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'gallery' && (
        <div className="side-panel-content">
          <div className="spc-title">Generated Assets ({allImages.length})</div>
          {allImages.length === 0 ? (
            <p className="spc-empty">No images generated yet. Ask me to create a logo, thumbnail, or any visual asset.</p>
          ) : (
            <>
              <div className="side-gallery-grid">
                {allImages.slice(-6).map(img => (
                  <div key={img.id} className="side-gallery-item">
                    <img src={img.url} alt={img.name} />
                  </div>
                ))}
              </div>
              {allImages.length > 4 && (
                <button className="view-all-btn" onClick={onViewGallery}>
                  <GalleryIcon />View All ({allImages.length})
                </button>
              )}
            </>
          )}
        </div>
      )}
    </aside>
  )
}

// ── Main AIStudio Component ────────────────────────────────────────
export default function AIStudio() {
  const [messages, setMessages] = useState([]) // { id, role, content, intent, needsImage, engineeredPrompt, isComplete }
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [memory, setMemory] = useState({})
  const [variants, setVariants] = useState([]) // current generation set
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [allImages, setAllImages] = useState([]) // gallery
  const [showGallery, setShowGallery] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [notification, setNotification] = useState(null)

  const chatEndRef = useRef(null)
  const inputRef = useRef(null)
  const abortRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load history from backend
  useEffect(() => {
    fetch(`${API_BASE}/chat/history/${SESSION_ID}`)
      .then(r => r.json())
      .then(data => {
        if (data.memory) setMemory(data.memory)
        if (data.history?.length > 0) {
          const restored = []
          for (let i = 0; i < data.history.length; i += 2) {
            if (data.history[i]) restored.push({ id: uuid(), role: 'user', content: data.history[i].content, isComplete: true })
            if (data.history[i + 1]) restored.push({ id: uuid(), role: 'assistant', content: data.history[i + 1].content, isComplete: true })
          }
          setMessages(restored)
        } else {
          // Welcome message
          setMessages([{
            id: uuid(),
            role: 'assistant',
            content: `**Welcome to GFXTAB AI Studio** 🎨\n\nI'm your dedicated creative AI — built for designers, creators, and brand builders.\n\n**What can I help you create?**\n• Logos & brand identities\n• YouTube thumbnails\n• Social media visuals\n• UI/UX design concepts\n• Color palettes & typography\n• Scripts & creative copy\n\n*Start by describing what you want to build. The more context, the better the output.*`,
            isComplete: true
          }])
        }
      })
      .catch(() => {
        setMessages([{
          id: uuid(),
          role: 'assistant',
          content: `**Welcome to GFXTAB AI Studio** 🎨\n\nI'm your dedicated AI creative partner. Tell me what you want to create and I'll make it happen.`,
          isComplete: true
        }])
      })
  }, [])

  const notify = (text, type = 'success') => {
    setNotification({ text, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const generateImage = useCallback(async (prompt) => {
    if (isGeneratingImage) return
    setIsGeneratingImage(true)
    setVariants([])

    try {
      const res = await fetch(`${API_BASE}/generate/image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, sessionId: SESSION_ID })
      })
      const data = await res.json()
      if (data.variants?.length > 0) {
        setVariants(data.variants)
        setSelectedVariant(data.variants[0])
        setAllImages(prev => [...prev, ...data.variants])
        notify(`✨ ${data.variants.length} variants generated!`)
      }
    } catch (err) {
      notify('Image generation failed. Check backend.', 'error')
    } finally {
      setIsGeneratingImage(false)
    }
  }, [isGeneratingImage])

  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || isStreaming) return

    const userMsgId = uuid()
    const aiMsgId = uuid()
    setInput('')
    setIsStreaming(true)

    const userMsg = { id: userMsgId, role: 'user', content: text, isComplete: true }
    setMessages(prev => [...prev, userMsg])

    // Placeholder AI message
    const aiMsg = {
      id: aiMsgId, role: 'assistant', content: '', intent: null,
      needsImage: false, engineeredPrompt: null, isComplete: false
    }
    setMessages(prev => [...prev, aiMsg])

    try {
      const res = await fetch(`${API_BASE}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId: SESSION_ID }),
        signal: abortRef.current?.signal
      })

      if (!res.body) throw new Error('No stream body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let accText = ''
      let meta = {}

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const event = JSON.parse(line.slice(6))

            if (event.type === 'meta') {
              meta = event
              setMessages(prev => prev.map(m =>
                m.id === aiMsgId ? { ...m, intent: event.intent, needsImage: event.needsImage, engineeredPrompt: event.engineeredPrompt } : m
              ))
            } else if (event.type === 'token') {
              accText += event.text
              const snapshot = accText
              setMessages(prev => prev.map(m =>
                m.id === aiMsgId ? { ...m, content: snapshot } : m
              ))
            } else if (event.type === 'done') {
              if (event.memory) setMemory(event.memory)
              setMessages(prev => prev.map(m =>
                m.id === aiMsgId
                  ? {
                      ...m, isComplete: true,
                      onGenerate: meta.needsImage ? () => generateImage(text) : undefined
                    }
                  : m
              ))
              // Auto-generate image if intent detected
              if (meta.needsImage) {
                setTimeout(() => generateImage(text), 500)
              }
            }
          } catch (_) {}
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages(prev => prev.map(m =>
          m.id === aiMsgId
            ? { ...m, content: 'Connection error. Please ensure the backend is running on port 4000.', isComplete: true }
            : m
        ))
      }
    } finally {
      setIsStreaming(false)
    }
  }, [input, isStreaming, generateImage])

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearSession = async () => {
    try {
      await fetch(`${API_BASE}/chat/session/${SESSION_ID}`, { method: 'DELETE' })
    } catch (_) {}
    setMessages([{
      id: uuid(),
      role: 'assistant',
      content: `**Session cleared.** Fresh start! What are we creating today?`,
      isComplete: true
    }])
    setMemory({})
    setVariants([])
    setSelectedVariant(null)
    notify('Session cleared')
  }

  const downloadVariant = (variant) => {
    const a = document.createElement('a')
    a.href = variant.url
    a.download = `${variant.name.replace(/[^a-z0-9]/gi, '_')}.png`
    a.click()
    notify('Download started ✓')
  }

  const publishVariant = (variant) => {
    notify(`"${variant.name}" published to Marketplace ✓`)
  }

  const quickPrompts = [
    '🎨 Create a luxury logo for my brand',
    '📸 Design a YouTube thumbnail',
    '🎯 Build a social media banner',
    '🖥️ Design a dark mode UI concept',
    '🎬 Write a reel script',
    '🌈 Generate a brand color palette',
  ]

  return (
    <>
      <style>{STUDIO_CSS}</style>

      {/* Notification Toast */}
      {notification && (
        <div className={`studio-toast studio-toast--${notification.type}`}>
          {notification.text}
        </div>
      )}

      {/* Gallery Modal */}
      {showGallery && <GalleryModal items={allImages} onClose={() => setShowGallery(false)} />}

      <div className="studio-root">
        {/* ── Left: Chat Panel ── */}
        <div className="studio-chat-panel">
          {/* Header */}
          <div className="studio-chat-header">
            <div className="studio-chat-header__brand">
              <div className="studio-logo-badge">
                <SparkleIcon />
              </div>
              <div>
                <h1 className="studio-chat-title">GFXTAB AI Studio</h1>
                <p className="studio-chat-sub">Creative Intelligence · Always On</p>
              </div>
            </div>
            <div className="studio-chat-header__status">
              <span className="status-dot" />
              <span>Online</span>
            </div>
          </div>

          {/* Messages */}
          <div className="studio-chat-feed">
            {messages.map(msg => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                onCopy={() => notify('Copied!')}
              />
            ))}
            {isStreaming && messages[messages.length - 1]?.content === '' && <ThinkingDots />}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length <= 1 && (
            <div className="studio-quick-prompts">
              {quickPrompts.map((p, i) => (
                <button key={i} className="quick-prompt-btn" onClick={() => { setInput(p.replace(/^[^\s]+ /, '')); inputRef.current?.focus() }}>
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <div className="studio-input-bar">
            <div className="studio-input-wrap">
              <textarea
                ref={inputRef}
                className="studio-textarea"
                placeholder="Describe what you want to create… (Shift+Enter for new line)"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                rows={1}
                style={{ height: 'auto' }}
                onInput={e => {
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px'
                }}
              />
              <button
                className={`studio-send-btn ${isStreaming ? 'studio-send-btn--streaming' : ''}`}
                onClick={sendMessage}
                disabled={isStreaming || !input.trim()}
                id="ai-studio-send-btn"
              >
                {isStreaming ? <div className="btn-spinner" /> : <SendIcon />}
              </button>
            </div>
            <div className="studio-input-footer">
              <span>GFXTAB AI Studio · Gemini 2.0 Flash</span>
              {isStreaming && <span className="streaming-label">● Streaming response…</span>}
            </div>
          </div>
        </div>

        {/* ── Center: Workspace ── */}
        <div className="studio-workspace">
          <div className="studio-workspace-header">
            <h2>Creative Workspace</h2>
            {variants.length > 0 && (
              <div className="workspace-actions">
                <button className="ws-action-btn" onClick={() => selectedVariant && generateImage(messages.filter(m => m.role === 'user').slice(-1)[0]?.content || 'regenerate')}>
                  <RefreshIcon />Regenerate
                </button>
                <button className="ws-action-btn ws-action-btn--lime" onClick={() => selectedVariant && downloadVariant(selectedVariant)}>
                  <DownloadIcon />Download
                </button>
              </div>
            )}
          </div>

          {/* Workspace content */}
          {isGeneratingImage ? (
            <div className="workspace-generating">
              <div className="gen-spinner" />
              <p>Generating 4 AI variants…</p>
              <span>Engineering the perfect prompt</span>
            </div>
          ) : variants.length > 0 ? (
            <div className="workspace-content">
              {/* Selected preview */}
              {selectedVariant && (
                <div className="workspace-preview">
                  <img src={selectedVariant.url} alt={selectedVariant.name} />
                  <div className="workspace-preview__meta">
                    <h3>{selectedVariant.name}</h3>
                    {selectedVariant.engineeredPrompt && (
                      <details className="ws-prompt-detail">
                        <summary>🔧 Engineered Prompt</summary>
                        <p>{selectedVariant.engineeredPrompt}</p>
                      </details>
                    )}
                    <div className="ws-action-row">
                      <button className="ws-primary-btn" onClick={() => downloadVariant(selectedVariant)}>
                        <DownloadIcon />Download
                      </button>
                      <button className="ws-secondary-btn" onClick={() => publishVariant(selectedVariant)}>
                        <PublishIcon />Publish
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Variants grid */}
              <div className="variants-label">
                <span>4 AI Variations</span>
                <button className="ws-ghost-btn" onClick={() => setShowGallery(true)}>View Gallery</button>
              </div>
              <div className="variants-grid">
                {variants.map(v => (
                  <VariantCard
                    key={v.id}
                    variant={v}
                    isSelected={selectedVariant?.id === v.id}
                    onSelect={setSelectedVariant}
                    onDownload={downloadVariant}
                    onPublish={publishVariant}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="workspace-empty">
              <div className="workspace-empty__icon">
                <SparkleIcon />
              </div>
              <h3>Your canvas awaits</h3>
              <p>Ask me to create any visual asset — logos, thumbnails, banners, UI mockups — and they'll appear here in 4 unique AI-generated variations.</p>
              <div className="workspace-empty__features">
                <div className="ws-feature"><ImageIcon /><span>4 Variants</span></div>
                <div className="ws-feature"><DownloadIcon /><span>Download</span></div>
                <div className="ws-feature"><PublishIcon /><span>Publish</span></div>
                <div className="ws-feature"><RefreshIcon /><span>Regenerate</span></div>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Side Panel ── */}
        <SidePanel
          memory={memory}
          chatHistory={messages}
          allImages={allImages}
          onClearSession={clearSession}
          onViewGallery={() => setShowGallery(true)}
        />
      </div>
    </>
  )
}

// ── Styles ─────────────────────────────────────────────────────────
const STUDIO_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

/* Root */
.studio-root {
  display: grid;
  grid-template-columns: 520px 1fr 300px;
  height: calc(100vh - 64px);
  background: #09090b;
  font-family: 'Inter', sans-serif;
  overflow: hidden;
  position: relative;
}

/* ── Chat Panel ── */
.studio-chat-panel {
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255,255,255,0.06);
  background: #0d0d10;
  height: 100%;
  overflow: hidden;
}

.studio-chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.02);
  flex-shrink: 0;
}

.studio-chat-header__brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.studio-logo-badge {
  width: 38px; height: 38px;
  background: linear-gradient(135deg, #c8ff00 0%, #8b5cf6 100%);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  color: #000;
  flex-shrink: 0;
  box-shadow: 0 0 20px rgba(200,255,0,0.3);
}

.studio-chat-title {
  font-size: 15px; font-weight: 700;
  color: #fafafa; margin: 0;
}

.studio-chat-sub {
  font-size: 11px; color: #71717a; margin: 0;
}

.studio-chat-header__status {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: #71717a;
}

.status-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #22c55e;
  animation: pulse-green 2s infinite;
}

@keyframes pulse-green {
  0%,100%{ box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
  50%{ box-shadow: 0 0 0 4px rgba(34,197,94,0); }
}

/* Chat feed */
.studio-chat-feed {
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  scroll-behavior: smooth;
}

.studio-chat-feed::-webkit-scrollbar { width: 4px; }
.studio-chat-feed::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }

/* Message bubbles */
.studio-msg {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  animation: fadeSlideIn 0.25s ease;
}

@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.studio-msg--user {
  flex-direction: row-reverse;
}

.studio-msg__avatar {
  width: 32px; height: 32px;
  background: linear-gradient(135deg, #c8ff0022, #8b5cf622);
  border: 1px solid rgba(200,255,0,0.2);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: #c8ff00;
  flex-shrink: 0;
}

.studio-msg__user-avatar {
  width: 32px; height: 32px;
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700; color: #fff;
  flex-shrink: 0;
}

.studio-msg__body {
  max-width: calc(100% - 50px);
  display: flex; flex-direction: column; gap: 6px;
}

.studio-msg__intent-badge {
  display: flex; gap: 6px; margin-bottom: 4px;
}

.intent-pill {
  font-size: 9px; font-weight: 700; letter-spacing: 1px;
  padding: 2px 8px; border-radius: 20px;
  background: rgba(200,255,0,0.1);
  color: #c8ff00;
  border: 1px solid rgba(200,255,0,0.2);
}

.intent-pill--img {
  background: rgba(139,92,246,0.1);
  color: #a78bfa;
  border-color: rgba(139,92,246,0.2);
}

.studio-msg__content {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px 12px 12px 3px;
  padding: 12px 14px;
  color: #e4e4e7;
  font-size: 14px;
  line-height: 1.7;
}

.studio-msg--user .studio-msg__content {
  background: linear-gradient(135deg, rgba(200,255,0,0.1), rgba(139,92,246,0.08));
  border: 1px solid rgba(200,255,0,0.15);
  border-radius: 12px 12px 3px 12px;
  color: #fafafa;
}

/* Markdown elements */
.md-quote {
  border-left: 3px solid #c8ff00;
  padding-left: 12px;
  color: #a1a1aa;
  margin: 8px 0;
  font-style: italic;
}
.md-code {
  background: rgba(200,255,0,0.08);
  color: #c8ff00;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
}
.md-ul { padding-left: 16px; margin: 6px 0; }
.md-li { margin: 3px 0; color: #d4d4d8; }
.md-h1 { font-size: 18px; font-weight: 700; color: #c8ff00; margin-bottom: 8px; }
.md-h2 { font-size: 15px; font-weight: 600; color: #fafafa; margin-bottom: 6px; }

/* Engineered prompt */
.studio-prompt-detail {
  background: rgba(139,92,246,0.05);
  border: 1px solid rgba(139,92,246,0.15);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
}
.studio-prompt-detail summary {
  cursor: pointer; color: #a78bfa; font-weight: 600;
}
.studio-prompt-box {
  margin-top: 8px;
  font-size: 11px;
  color: #71717a;
  line-height: 1.6;
  font-family: monospace;
}

/* Message actions */
.studio-msg__actions {
  display: flex; gap: 6px; margin-top: 4px;
}

.msg-action-btn {
  display: flex; align-items: center; gap: 4px;
  padding: 4px 10px; border-radius: 6px;
  background: transparent; border: 1px solid rgba(255,255,255,0.08);
  color: #71717a; font-size: 11px; cursor: pointer;
  transition: all 0.2s;
}
.msg-action-btn:hover { border-color: rgba(255,255,255,0.15); color: #a1a1aa; }
.msg-action-btn--lime {
  border-color: rgba(200,255,0,0.3);
  color: #c8ff00;
  background: rgba(200,255,0,0.05);
}
.msg-action-btn--lime:hover { background: rgba(200,255,0,0.1); }

/* Thinking */
.studio-thinking {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px;
  background: rgba(200,255,0,0.04);
  border: 1px solid rgba(200,255,0,0.1);
  border-radius: 10px;
  color: #c8ff00; font-size: 13px;
  width: fit-content;
  animation: fadeSlideIn 0.2s ease;
}
.dots { display: flex; gap: 4px; }
.dots span {
  width: 5px; height: 5px; border-radius: 50%;
  background: #c8ff00; opacity: 0.4;
  animation: dotBounce 1.2s infinite;
}
.dots span:nth-child(2) { animation-delay: 0.2s; }
.dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes dotBounce {
  0%,80%,100%{ transform: translateY(0); opacity: 0.4; }
  40%{ transform: translateY(-4px); opacity: 1; }
}

/* Quick prompts */
.studio-quick-prompts {
  display: flex; flex-wrap: wrap; gap: 6px;
  padding: 12px 16px;
  border-top: 1px solid rgba(255,255,255,0.05);
}

.quick-prompt-btn {
  padding: 6px 12px; border-radius: 20px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  color: #a1a1aa; font-size: 12px; cursor: pointer;
  transition: all 0.2s; white-space: nowrap;
}
.quick-prompt-btn:hover {
  border-color: rgba(200,255,0,0.3);
  color: #c8ff00;
  background: rgba(200,255,0,0.05);
}

/* Input bar */
.studio-input-bar {
  padding: 12px 16px 16px;
  border-top: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
  background: #0d0d10;
}

.studio-input-wrap {
  display: flex; gap: 8px; align-items: flex-end;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 14px;
  padding: 8px 8px 8px 14px;
  transition: border-color 0.2s;
}
.studio-input-wrap:focus-within {
  border-color: rgba(200,255,0,0.3);
  box-shadow: 0 0 0 3px rgba(200,255,0,0.05);
}

.studio-textarea {
  flex: 1;
  background: transparent;
  border: none; outline: none;
  color: #fafafa;
  font-size: 14px; line-height: 1.5;
  resize: none;
  font-family: 'Inter', sans-serif;
  min-height: 20px; max-height: 140px;
}
.studio-textarea::placeholder { color: #52525b; }

.studio-send-btn {
  width: 38px; height: 38px; flex-shrink: 0;
  background: linear-gradient(135deg, #c8ff00, #a8d400);
  border: none; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #000;
  transition: all 0.2s;
}
.studio-send-btn:hover:not(:disabled) { transform: scale(1.05); box-shadow: 0 0 16px rgba(200,255,0,0.4); }
.studio-send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
.studio-send-btn--streaming { background: linear-gradient(135deg, #8b5cf6, #6d28d9); }

.btn-spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.studio-input-footer {
  display: flex; justify-content: space-between;
  padding: 6px 2px 0;
  font-size: 11px; color: #52525b;
}

.streaming-label {
  color: #c8ff00; animation: pulse 1s infinite;
}
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

/* ── Workspace ── */
.studio-workspace {
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255,255,255,0.06);
  background: #09090b;
  overflow-y: auto;
}

.studio-workspace::-webkit-scrollbar { width: 4px; }
.studio-workspace::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 4px; }

.studio-workspace-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.02);
  position: sticky; top: 0; z-index: 10;
  flex-shrink: 0;
}

.studio-workspace-header h2 {
  font-size: 14px; font-weight: 600; color: #a1a1aa; margin: 0;
}

.workspace-actions {
  display: flex; gap: 8px;
}

.ws-action-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 6px 12px; border-radius: 8px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: #a1a1aa; font-size: 12px; cursor: pointer;
  transition: all 0.2s;
}
.ws-action-btn:hover { border-color: rgba(255,255,255,0.2); color: #fff; }
.ws-action-btn--lime {
  background: rgba(200,255,0,0.08);
  border-color: rgba(200,255,0,0.2);
  color: #c8ff00;
}
.ws-action-btn--lime:hover { background: rgba(200,255,0,0.15); }

/* Empty state */
.workspace-empty {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 40px 32px; text-align: center;
  gap: 16px;
}

.workspace-empty__icon {
  width: 64px; height: 64px;
  background: rgba(200,255,0,0.06);
  border: 1px solid rgba(200,255,0,0.15);
  border-radius: 20px;
  display: flex; align-items: center; justify-content: center;
  color: #c8ff00;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,100%{ transform: translateY(0); }
  50%{ transform: translateY(-8px); }
}

.workspace-empty h3 {
  font-size: 20px; font-weight: 700; color: #fafafa; margin: 0;
}

.workspace-empty p {
  font-size: 14px; color: #71717a; max-width: 380px; margin: 0; line-height: 1.7;
}

.workspace-empty__features {
  display: flex; gap: 16px; margin-top: 8px;
  flex-wrap: wrap; justify-content: center;
}

.ws-feature {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  width: 70px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px;
  padding: 10px 6px;
  color: #52525b; font-size: 11px;
}

/* Generating */
.workspace-generating {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 16px; color: #a1a1aa;
}

.gen-spinner {
  width: 48px; height: 48px;
  border: 3px solid rgba(200,255,0,0.1);
  border-top-color: #c8ff00;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.workspace-generating p { font-size: 16px; font-weight: 600; color: #fafafa; margin: 0; }
.workspace-generating span { font-size: 13px; color: #71717a; }

/* Workspace content */
.workspace-content { padding: 20px; display: flex; flex-direction: column; gap: 20px; }

.workspace-preview {
  display: flex; flex-direction: column; gap: 16px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px;
  overflow: hidden;
}

.workspace-preview img {
  width: 100%; aspect-ratio: 1;
  object-fit: contain;
  background: #111;
}

.workspace-preview__meta {
  padding: 16px;
  display: flex; flex-direction: column; gap: 10px;
}

.workspace-preview__meta h3 {
  font-size: 14px; font-weight: 600; color: #fafafa; margin: 0;
}

.ws-prompt-detail {
  background: rgba(139,92,246,0.05);
  border: 1px solid rgba(139,92,246,0.1);
  border-radius: 8px; padding: 8px 12px;
  font-size: 12px;
}
.ws-prompt-detail summary { cursor: pointer; color: #a78bfa; font-weight: 600; }
.ws-prompt-detail p { margin: 8px 0 0; color: #71717a; font-size: 11px; line-height: 1.6; }

.ws-action-row { display: flex; gap: 8px; }

.ws-primary-btn, .ws-secondary-btn {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 10px; border-radius: 10px;
  font-size: 13px; font-weight: 600; cursor: pointer;
  transition: all 0.2s; border: none;
}
.ws-primary-btn {
  background: linear-gradient(135deg, #c8ff00, #a8d400);
  color: #000;
}
.ws-primary-btn:hover { transform: translateY(-1px); box-shadow: 0 0 20px rgba(200,255,0,0.3); }
.ws-secondary-btn {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: #a1a1aa;
}
.ws-secondary-btn:hover { border-color: rgba(255,255,255,0.2); color: #fff; }

.variants-label {
  display: flex; align-items: center; justify-content: space-between;
  font-size: 13px; font-weight: 600; color: #a1a1aa;
}

.ws-ghost-btn {
  font-size: 12px; color: #c8ff00; background: none; border: none; cursor: pointer; padding: 0;
}
.ws-ghost-btn:hover { text-decoration: underline; }

.variants-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 10px;
}

/* Variant card */
.variant-card {
  border-radius: 12px;
  border: 2px solid rgba(255,255,255,0.06);
  overflow: hidden; cursor: pointer;
  background: #111;
  transition: all 0.2s;
}
.variant-card:hover { border-color: rgba(255,255,255,0.15); transform: translateY(-2px); }
.variant-card--selected { border-color: #c8ff00; box-shadow: 0 0 16px rgba(200,255,0,0.2); }

.variant-card__img-wrap {
  position: relative; aspect-ratio: 1;
}

.variant-card__img-wrap img {
  width: 100%; height: 100%; object-fit: contain;
  display: block;
}

.variant-card__overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex; align-items: center; justify-content: center; gap: 8px;
  opacity: 0; transition: opacity 0.2s;
}
.variant-card:hover .variant-card__overlay { opacity: 1; }

.variant-overlay-btn {
  width: 34px; height: 34px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: #fff; cursor: pointer; backdrop-filter: blur(4px);
  transition: all 0.15s;
}
.variant-overlay-btn:hover { background: rgba(200,255,0,0.2); border-color: #c8ff00; color: #c8ff00; }

.variant-card__meta {
  padding: 8px 10px;
  display: flex; align-items: center; justify-content: space-between;
}

.variant-card__name {
  font-size: 11px; color: #a1a1aa; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.variant-card__palette {
  display: flex; gap: 4px;
}

.palette-dot {
  width: 10px; height: 10px; border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.15);
}

/* ── Side Panel ── */
.studio-side-panel {
  display: flex; flex-direction: column;
  background: #0d0d10;
  overflow: hidden;
}

.side-panel-tabs {
  display: flex;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
}

.side-panel-tabs button {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  gap: 4px; padding: 12px 4px;
  background: none; border: none; cursor: pointer;
  color: #52525b; font-size: 10px; font-weight: 600; letter-spacing: 0.5px;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}
.side-panel-tabs button:hover { color: #a1a1aa; }
.side-panel-tabs button.spt--active {
  color: #c8ff00; border-bottom-color: #c8ff00;
}

.side-panel-content {
  flex: 1; overflow-y: auto; padding: 16px;
  display: flex; flex-direction: column; gap: 8px;
}
.side-panel-content::-webkit-scrollbar { width: 3px; }
.side-panel-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); }

.spc-title {
  font-size: 10px; font-weight: 700; letter-spacing: 1.5px;
  color: #52525b; text-transform: uppercase; margin-bottom: 4px;
}

.spc-empty {
  font-size: 12px; color: #3f3f46; line-height: 1.7; margin: 0;
}

.memory-items { display: flex; flex-direction: column; gap: 6px; }

.memory-item {
  display: flex; flex-direction: column; gap: 2px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 8px; padding: 8px 10px;
}

.memory-key {
  font-size: 10px; color: #52525b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
}
.memory-val { font-size: 13px; color: #c8ff00; font-weight: 600; }

.intent-items { display: flex; flex-direction: column; gap: 4px; }

.intent-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 6px 10px; border-radius: 6px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
}
.intent-label { font-size: 12px; color: #a1a1aa; text-transform: capitalize; }
.intent-count { font-size: 12px; font-weight: 700; color: #8b5cf6; }

.danger-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 14px; border-radius: 8px;
  background: rgba(239,68,68,0.08);
  border: 1px solid rgba(239,68,68,0.15);
  color: #ef4444; font-size: 12px; cursor: pointer;
  margin-top: auto;
  transition: all 0.2s;
}
.danger-btn:hover { background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.3); }

.history-list { display: flex; flex-direction: column; gap: 4px; }

.history-item {
  display: flex; gap: 8px;
  padding: 7px 10px; border-radius: 7px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  cursor: pointer; transition: all 0.15s;
}
.history-item:hover { border-color: rgba(200,255,0,0.15); background: rgba(200,255,0,0.03); }

.history-index {
  font-size: 10px; color: #8b5cf6; font-weight: 700; flex-shrink: 0;
}
.history-text { font-size: 12px; color: #71717a; line-height: 1.4; }

.side-gallery-grid {
  display: grid; grid-template-columns: 1fr 1fr 1fr;
  gap: 6px;
}

.side-gallery-item {
  aspect-ratio: 1; border-radius: 8px; overflow: hidden;
  background: #111;
  border: 1px solid rgba(255,255,255,0.06);
}
.side-gallery-item img { width: 100%; height: 100%; object-fit: contain; }

.view-all-btn {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  width: 100%; padding: 9px;
  background: rgba(200,255,0,0.06);
  border: 1px solid rgba(200,255,0,0.15);
  border-radius: 8px;
  color: #c8ff00; font-size: 12px; font-weight: 600;
  cursor: pointer; margin-top: 6px;
  transition: all 0.2s;
}
.view-all-btn:hover { background: rgba(200,255,0,0.12); }

/* ── Gallery Modal ── */
.studio-modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.85); backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex; align-items: center; justify-content: center;
  padding: 32px;
}

.studio-modal {
  background: #141417;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px;
  width: 100%; max-width: 900px;
  max-height: 80vh;
  display: flex; flex-direction: column;
  overflow: hidden;
  animation: modalIn 0.25s ease;
}

@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.studio-modal__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.studio-modal__header h2 {
  font-size: 16px; font-weight: 700; color: #fafafa; margin: 0;
}

.modal-close-btn {
  width: 32px; height: 32px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px; cursor: pointer; color: #a1a1aa;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.modal-close-btn:hover { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.3); color: #ef4444; }

.studio-modal__gallery {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px; padding: 20px; overflow-y: auto;
}

.gallery-item {
  background: #111;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px; overflow: hidden;
}

.gallery-item img { width: 100%; aspect-ratio: 1; object-fit: contain; display: block; }

.gallery-item__label {
  padding: 8px 10px;
  font-size: 11px; color: #71717a;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.gallery-item__actions { padding: 0 10px 10px; }

.gallery-action-btn {
  display: flex; align-items: center; gap: 5px;
  width: 100%; padding: 7px;
  background: rgba(200,255,0,0.06);
  border: 1px solid rgba(200,255,0,0.15);
  border-radius: 7px;
  color: #c8ff00; font-size: 12px; font-weight: 600; cursor: pointer;
  justify-content: center;
  transition: all 0.15s;
}
.gallery-action-btn:hover { background: rgba(200,255,0,0.15); }

/* ── Toast ── */
.studio-toast {
  position: fixed; bottom: 24px; right: 24px;
  padding: 12px 20px; border-radius: 10px;
  font-size: 14px; font-weight: 600;
  z-index: 9999;
  animation: toastIn 0.3s ease;
}

@keyframes toastIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.studio-toast--success {
  background: rgba(34,197,94,0.15);
  border: 1px solid rgba(34,197,94,0.3);
  color: #22c55e;
}

.studio-toast--error {
  background: rgba(239,68,68,0.15);
  border: 1px solid rgba(239,68,68,0.3);
  color: #ef4444;
}

/* ── Responsive ── */
@media (max-width: 1200px) {
  .studio-root { grid-template-columns: 420px 1fr 260px; }
}

@media (max-width: 900px) {
  .studio-root { grid-template-columns: 1fr; }
  .studio-workspace, .studio-side-panel { display: none; }
}
`
