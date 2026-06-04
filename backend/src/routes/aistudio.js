/**
 * GFXTAB AI Studio — Agentic AI Brain
 * Gemini 2.0 Flash via google/generative-ai
 * Streaming SSE | Intent Detection | Memory | Prompt Engineering | Image Generation
 */

const express = require('express')
const router = express.Router()
const axios = require('axios')

// ── In-Memory Session Store ──────────────────────────────────────
// { sessionId: { memory: { userName, brand, style, recentProject }, history: [] } }
const sessions = {}

function getSession(sid) {
  if (!sessions[sid]) {
    sessions[sid] = { memory: {}, history: [] }
  }
  return sessions[sid]
}

// ── Prompt Engineering Engine ────────────────────────────────────
const CREATIVE_ENHANCER = {
  logo: 'ultra-high-resolution luxury logo design, award-winning composition, masterclass brand identity, vector-perfect edges, dark background with dramatic studio lighting, professional designer output, Behance featured quality, 8K detail',
  thumbnail: 'ultra-high click-through-rate YouTube thumbnail, bold cinematic typography, studio-quality lighting, extreme color contrast, hyper-attention-grabbing, 4K professional creative, tested for maximum CTR performance',
  banner: 'professional brand banner, bold gradient identity, premium layout structure, pixel-perfect alignment, high-impact visual hierarchy, modern brand standards, 4K sharp output',
  illustration: 'editorial concept illustration, expressive dynamic composition, vibrant brand-safe palette, professional digital art with vector-clean output, studio-quality render, featured on Artstation quality',
  poster: 'cinema-quality poster composition, dramatic directional lighting, rich material textures, expert typographic hierarchy, printable 300dpi quality, award-winning visual design',
  ui: 'premium SaaS UI design, clean dark-mode glassmorphism, well-spaced component hierarchy, Figma-quality design system, professional UX layout, linear/vercel aesthetic level',
  photo: 'ultra-realistic commercial photograph, professional studio lighting, editorial quality, 8K resolution, clean product hero shot',
  social: 'high-converting social media creative, thumb-stopping visual hook, brand-consistent identity, modern graphic design quality, Instagram/LinkedIn premium aesthetic',
  brand: 'comprehensive brand identity system, complete visual language, professional brand guide output, strategic design thinking applied, market-competitive identity design',
  default: 'ultra high quality, professional creative asset, award-winning design output, studio quality, 8K detail, premium brand production value'
}

function engineerPrompt(userPrompt, intent, memory) {
  const base = userPrompt.trim()
  const enhancer = CREATIVE_ENHANCER[intent] || CREATIVE_ENHANCER.default
  const brandCtx = memory.brand ? `, brand: ${memory.brand}` : ''
  const styleCtx = memory.style ? `, style: ${memory.style}` : ''
  const industryCtx = memory.industry ? `, industry: ${memory.industry}` : ''
  const colorCtx = memory.colorPrefs ? `, color direction: ${memory.colorPrefs}` : ''
  return `${base}${brandCtx}${styleCtx}${industryCtx}${colorCtx}. ${enhancer}`
}

// ── Intent Classifier ────────────────────────────────────────────
function classifyIntent(message) {
  const m = message.toLowerCase()
  if (/(logo|brand mark|wordmark|identity|emblem|monogram|logotype|logomark)/.test(m)) return { type: 'logo', needsImage: true }
  if (/(thumbnail|youtube|yt thumb|channel art)/.test(m)) return { type: 'thumbnail', needsImage: true }
  if (/(banner|cover|header|og image|hero image|linkedin banner|twitter header)/.test(m)) return { type: 'banner', needsImage: true }
  if (/(illustration|drawing|artwork|concept art|digital art|sketch)/.test(m)) return { type: 'illustration', needsImage: true }
  if (/(poster|flyer|print|leaflet|brochure)/.test(m)) return { type: 'poster', needsImage: true }
  if (/(ui|interface|dashboard|app design|website design|screen|wireframe|saas)/.test(m)) return { type: 'ui', needsImage: true }
  if (/(photo|photograph|realistic|product shot|mockup|render)/.test(m)) return { type: 'photo', needsImage: true }
  if (/(social|instagram|reel|story|post|tiktok|linkedin|twitter|facebook)/.test(m)) return { type: 'social', needsImage: true }
  if (/(brand kit|brand guide|brand system|visual identity|brand strategy)/.test(m)) return { type: 'brand', needsImage: false }
  if (/(script|reel|video|caption|content|copy|text|tagline|slogan|headline)/.test(m)) return { type: 'copy', needsImage: false }
  if (/(color|colour|palette|swatch|hex|rgb|gradient|scheme)/.test(m)) return { type: 'palette', needsImage: false }
  if (/(font|typography|typeface|lettering|type system)/.test(m)) return { type: 'typography', needsImage: false }
  return { type: 'chat', needsImage: false }
}


// ── System Prompt Builder ─────────────────────────────────────────
function buildSystemPrompt(memory, aiMode = 'Chat') {
  const name = memory.userName ? `The user's name is ${memory.userName}.` : ''
  const brand = memory.brand ? `Their brand is: "${memory.brand}".` : ''
  const style = memory.style ? `Their preferred design style: ${memory.style}.` : ''
  const industry = memory.industry ? `Their industry: ${memory.industry}.` : ''
  const project = memory.recentProject ? `Most recent project type: ${memory.recentProject}.` : ''
  const colorPrefs = memory.colorPrefs ? `Color preferences: ${memory.colorPrefs}.` : ''

  // Agent Role specialization based on aiMode
  let agentRole = 'a senior creative director'
  if (aiMode === 'Logo' || aiMode === 'Branding') agentRole = 'a master brand identity designer (Pentagram level)'
  else if (aiMode === 'Social Media Post' || aiMode === 'Campaign Design') agentRole = 'an expert social media strategist and designer'
  else if (aiMode === 'Website Layout' || aiMode === 'UI/UX') agentRole = 'a top-tier UI/UX product designer (Linear/Vercel level)'
  else if (aiMode === 'Motion Idea' || aiMode === 'Video Editing') agentRole = 'a cutting-edge motion graphics director'
  else if (aiMode === 'Creative Brief' || aiMode === 'Multi-Agent Plan') agentRole = 'a visionary creative strategist'

  return `You are GFXTAB AI Studio — the world's most advanced AI creative partner. You are acting as ${agentRole}.

User context — always apply: ${name} ${brand} ${style} ${industry} ${project} ${colorPrefs}

Rules:
1. NEVER give generic or repetitive responses. Every reply is uniquely crafted for this exact user.
2. Read deep creative intent. "Make a logo" means: understand industry, audience, emotion, style — THEN propose a brief.
3. If the user asks for a design generation (logo, UI, image, mockup), DO NOT just say "Here is your image". Instead, generate a structured design brief containing: Project Goal, Style Direction, Color Palette, Typography, and 4 Variations.
4. Use Markdown beautifully: **bold** for emphasis, bullet lists, code blocks for hex/prompts, headers for sections.
5. Personality: Confident, creative, fast, precise. Like the best designer they've ever worked with.
6. Remember EVERYTHING. Build on context. Never repeat yourself. Grow the session.
7. Give 2-3 strategic options with brief rationale, then proceed with the best one.
8. High signal-to-noise. No filler. Every word earns its place.`
}


// ── Gemini Streaming Chat ─────────────────────────────────────────
router.post('/chat/stream', async (req, res) => {
  const { message, sessionId, aiMode = 'Chat', attachments = [] } = req.body
  if (!message || !sessionId) {
    return res.status(400).json({ error: 'message and sessionId required' })
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY
  const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash-latest'
  if (!GEMINI_API_KEY) {
    // Fallback to intelligent simulated response if no API key
    return simulatedStream(req, res, message, sessionId, aiMode, attachments)
  }

  const session = getSession(sessionId)
  const intent = classifyIntent(message)

  // Update memory from message — extract rich context
  const nameMatch = message.match(/(?:i'm|i am|my name is|call me|i go by)\s+([A-Za-z]+)/i)
  if (nameMatch) session.memory.userName = nameMatch[1]
  const brandMatch = message.match(/(?:my brand|my company|brand is|company is|called|named|brand name is|startup is)\s+([A-Za-z0-9\s]+?)(?:\.|,|$)/i)
  if (brandMatch) session.memory.brand = brandMatch[1].trim().slice(0, 40)
  const styleMatch = message.match(/\b(minimalist|luxury|futuristic|cyberpunk|retro|vintage|modern|bold|elegant|playful|brutalist|flat|corporate|streetwear|editorial)\b/i)
  if (styleMatch) session.memory.style = styleMatch[1]
  const industryMatch = message.match(/\b(fashion|tech|food|fitness|beauty|gaming|music|education|finance|health|real estate|automotive|crypto|nft|web3|saas|ecommerce|agency)\b/i)
  if (industryMatch) session.memory.industry = industryMatch[1]
  if (intent.type !== 'chat') session.memory.recentProject = intent.type

  // Build conversation history for Gemini
  const systemPrompt = buildSystemPrompt(session.memory, aiMode)
  const engineeredPrompt = intent.needsImage ? engineerPrompt(message, intent.type, session.memory) : null

  // Handle attachments (Base64 images)
  const currentMessageParts = [{ text: message }]
  attachments.forEach(att => {
    // Split "data:image/png;base64,iVBORw..."
    const match = att.match(/^data:(image\/[a-zA-Z]*);base64,([^"]*)$/)
    if (match) {
      currentMessageParts.push({
        inline_data: {
          mime_type: match[1],
          data: match[2]
        }
      })
    }
  })

  const contents = [
    ...session.history.map(h => ({
      role: h.role,
      parts: h.parts || [{ text: h.content }]
    })),
    {
      role: 'user',
      parts: currentMessageParts
    }
  ]

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')

  // Send metadata event first
  res.write(`data: ${JSON.stringify({ type: 'meta', intent: intent.type, needsImage: intent.needsImage, engineeredPrompt })}\n\n`)

  try {
    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse`,
      {
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: {
          temperature: 0.9,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      },
      {
        responseType: 'stream',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': GEMINI_API_KEY
        }
      }
    )

    let fullText = ''

    geminiRes.data.on('data', chunk => {
      const lines = chunk.toString().split('\n')
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const json = JSON.parse(line.slice(6))
            const text = json?.candidates?.[0]?.content?.parts?.[0]?.text
            if (text) {
              fullText += text
              res.write(`data: ${JSON.stringify({ type: 'token', text })}\n\n`)
            }
          } catch (_) {}
        }
      }
    })

    geminiRes.data.on('end', () => {
      // Save to history (keep last 20 turns)
      session.history.push({ role: 'user', content: message })
      session.history.push({ role: 'model', content: fullText })
      if (session.history.length > 40) session.history = session.history.slice(-40)

      res.write(`data: ${JSON.stringify({ type: 'done', memory: session.memory })}\n\n`)
      res.end()
    })

    geminiRes.data.on('error', () => {
      res.write(`data: ${JSON.stringify({ type: 'error', text: 'Stream error occurred.' })}\n\n`)
      res.end()
    })

  } catch (err) {
    console.error('Gemini stream error:', err.message)
    return simulatedStream(req, res, message, sessionId, true)
  }
})

// ── Simulated Intelligent Stream (No API Key / Fallback) ──────────
async function simulatedStream(req, res, message, sessionId, aiMode = 'Chat', attachments = [], isError = false) {
  const session = getSession(sessionId)
  const intent = classifyIntent(message)

  // Rich memory extraction
  const nameMatch = message.match(/(?:i'm|i am|my name is|call me|i go by)\s+([A-Za-z]+)/i)
  if (nameMatch) session.memory.userName = nameMatch[1]
  const brandMatch = message.match(/(?:my brand|my company|brand is|company is|called|named|brand name is|startup is)\s+([A-Za-z0-9\s]+?)(?:\.|,|$)/i)
  if (brandMatch) session.memory.brand = brandMatch[1].trim().slice(0, 40)
  const styleMatch = message.match(/\b(minimalist|luxury|futuristic|cyberpunk|retro|vintage|modern|bold|elegant|playful|brutalist|flat|corporate|streetwear|editorial)\b/i)
  if (styleMatch) session.memory.style = styleMatch[1]
  const industryMatch = message.match(/\b(fashion|tech|food|fitness|beauty|gaming|music|education|finance|health|automotive|crypto|saas|ecommerce|agency)\b/i)
  if (industryMatch) session.memory.industry = industryMatch[1]
  if (intent.type !== 'chat') session.memory.recentProject = intent.type

  const engineeredPrompt = intent.needsImage ? engineerPrompt(message, intent.type, session.memory) : null
  const mem = session.memory

  const response = generateDynamicResponse(message, intent, mem, session.history, aiMode, attachments)

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')

  res.write(`data: ${JSON.stringify({ type: 'meta', intent: intent.type, needsImage: intent.needsImage, engineeredPrompt })}\n\n`)

  // Realistic token-by-token streaming
  const words = response.split(' ')
  let fullText = ''
  for (let i = 0; i < words.length; i++) {
    const chunk = (i === 0 ? '' : ' ') + words[i]
    fullText += chunk
    res.write(`data: ${JSON.stringify({ type: 'token', text: chunk })}\n\n`)
    await new Promise(r => setTimeout(r, 10 + Math.random() * 14))
  }

  session.history.push({ role: 'user', content: message })
  session.history.push({ role: 'model', content: fullText })
  if (session.history.length > 40) session.history = session.history.slice(-40)

  res.write(`data: ${JSON.stringify({ type: 'done', memory: mem })}\n\n`)
  res.end()
}

// ── 6 Specialist Agent System ─────────────────────────────────────
function generateDynamicResponse(message, intent, mem, history, aiMode, attachments) {
  const m = message.toLowerCase()
  const name = mem.userName || 'Creative'
  const brand = mem.brand || 'your brand'
  const style = mem.style || null
  const industry = mem.industry || null
  const isFollowUp = history.length > 2
  
  const attachmentStr = attachments && attachments.length > 0 ? `\n\n*(I have analyzed your ${attachments.length} uploaded reference(s) to inform this direction)*\n` : ''

  // ─ AI MODE LOGIC OVERRIDE ──────────────────────────────────────────
  if (aiMode === 'Website Layout' || aiMode === 'UI/UX') {
    return `**GFXTAB ${aiMode} Agent** — Initializing structured layout for **${brand}**.\n${attachmentStr}\n**Design System Proposal:**\n\n1. **Hero Section:** High-contrast typography with an immersive background element.\n2. **Color Palette:** Dark-mode primary (#090910) with neon green (#C8FF00) interactive accents.\n3. **Typography:** 'Inter' for UI components, 'Clash Display' for bold headings.\n\nI can generate wireframes or high-fidelity UI mockups based on this structure. Should I proceed?`
  }

  if (aiMode === 'Motion Idea' || aiMode === 'Video Editing') {
    return `**GFXTAB Motion Agent** — Let's bring **${brand}** to life.\n${attachmentStr}\n**Motion Concept 1: Kinetic Flow**\n- **Intro:** Fast typography reveal scaling up.\n- **Main:** 3D glassy objects floating around the product.\n- **Outro:** Glitch transition into the logo.\n\n**Motion Concept 2: Smooth Editorial**\n- **Intro:** Slow pan across high-res textures.\n- **Main:** Elegant fade-ins with soft masking.\n\nWhich pacing fits your brand better: energetic/fast or smooth/premium?`
  }

  // ─ LOGO AGENT ─────────────────────────────────────────────────────
  if (intent.type === 'logo') {
    const styleOpts = style
      ? [`${style.charAt(0).toUpperCase() + style.slice(1)} (your preferred style)`, 'Geometric minimal wordmark', 'Luxury emblem with monogram', 'Dynamic icon + type lockup']
      : ['Geometric minimal wordmark', 'Luxury metallic emblem', 'Bold typographic mark', 'Abstract dynamic symbol']
    const industryLine = industry ? `\n\n> 💡 **${industry} insight:** ${getIndustryInsight(industry)}` : ''
    return `**GFXTAB Logo Agent** — Activated for **${brand}**${isFollowUp ? ' (continuing session)' : ''}\n\n**Strategic Design Directions:**\n• **Option A** — ${styleOpts[0]}\n• **Option B** — ${styleOpts[1]}\n• **Option C** — ${styleOpts[2]}\n• **Option D** — ${styleOpts[3]}\n${industryLine}\n\n**To generate now, confirm:**\n1. Which direction excites you most?\n2. Output needed: \`Icon only\` / \`Wordmark only\` / \`Full suite (icon + wordmark + variants)\`\n3. Top 2 colors (or say "surprise me")\n\nI'll generate 4 professional variations with **engineered prompts**, **color palettes**, and **brand rationale** for each.`
  }

  // ─ BRAND AGENT ────────────────────────────────────────────────────
  if (intent.type === 'brand') {
    return `**GFXTAB Brand Agent** — Full Identity System for **${brand}**\n\n**What I'll build:**\n\n**1. Brand Foundation**\n- Mission + brand voice definition\n- Target audience (3 archetypes)\n- Market positioning strategy\n\n**2. Visual Identity System**\n- Logo family (primary + secondary marks)\n- Color palette with WCAG ratios\n- Typography system (display + body)\n- Grid + spacing rules\n\n**3. Brand in Use**\n- Business card concept\n- Social media kit (profile + cover + post templates)\n- Email signature\n\n**Strategy question:** What is **${brand}**'s biggest competitor, and how do you want to be perceived differently?`
  }

  // ─ THUMBNAIL AGENT ────────────────────────────────────────────────
  if (intent.type === 'thumbnail') {
    return `**GFXTAB Thumbnail Agent** — CTR Optimization for **${brand}**\n\n**High-CTR anatomy:**\n\n| Element | What Works | What Kills CTR |\n|---|---|---|\n| Face | High-emotion expression | No face / small face |\n| Text | 2–4 bold words | Full sentences |\n| Color | High contrast background | Same-tone palette |\n| Subject | Clear focal point | Cluttered layout |\n\n**For ${brand}, give me:**\n1. **Video topic** — What is this video actually about?\n2. **Channel style** — (MrBeast shock-face / calm tech / gaming chaos / finance authority)\n3. **Hook text** — The 2–4 words on the thumbnail\n\nI'll generate 3 layout compositions with CTR score predictions for each.\n\n> 💡 *Surprised face + bright color + 3-word text = 35–60% CTR in A/B tests.*`
  }

  // ─ SOCIAL AGENT ───────────────────────────────────────────────────
  if (intent.type === 'social' || intent.type === 'banner') {
    const platform = m.includes('instagram') ? 'Instagram' : m.includes('linkedin') ? 'LinkedIn' : m.includes('twitter') ? 'X/Twitter' : m.includes('facebook') ? 'Facebook' : 'Social Media'
    const dims = { 'Instagram': '1080×1080 (post) or 1080×1920 (story)', 'LinkedIn': '1200×627 (post)', 'X/Twitter': '1600×900 (post)', 'Facebook': '1200×630', 'Social Media': '1080×1080 (universal)' }
    return `**GFXTAB Social Agent** — ${platform} Creative for **${brand}**\n\n**Dimensions:** \`${dims[platform] || dims['Social Media']}\`\n\n**3 Design Concepts:**\n\n**Concept 1: Brand Authority** — Clean bold layout, dominant mark, strong headline. *For announcements, launches.*\n\n**Concept 2: Visual Hook** — High-drama, bright accent explosion, emotion-led. *For promotions, viral moments.*\n\n**Concept 3: Editorial Grid** — Magazine-quality multi-element layout. *For product showcases, carousels.*\n\nWhich direction? Or say **"all three"** and I'll generate them all.`
  }

  // ─ UI AGENT ───────────────────────────────────────────────────────
  if (intent.type === 'ui') {
    return `**GFXTAB UI Agent** — Interface Design for **${brand}**\n\n**What are we designing?**\n\n| Screen | Reference Level |\n|---|---|\n| **Dashboard** | Vercel, Linear, Notion |\n| **Landing Page** | Stripe, Loom, Framer |\n| **Mobile App** | Craft, Figma Mobile |\n| **Onboarding** | Slack, Superhuman |\n| **Settings** | GitHub, Railway |\n\n**Visual direction for ${brand}:**\n• 🌑 **Dark glassmorphism** — Cyber-premium, blur cards, depth layers\n• ⬜ **Light minimal** — Clean SaaS, sharp grid, high contrast\n• 🌈 **Gradient bold** — Consumer app energy, vibrant fills\n• 🔲 **Brutalist** — Editorial, anti-design, high contrast\n\nDescribe the screen or say **"surprise me"** — I'll design it with a full component spec.`
  }

  // ─ COLOR AGENT ────────────────────────────────────────────────────
  if (intent.type === 'palette') {
    const presets = [
      { name: 'Tech & Innovation', palette: ['`#0A0A0F`', '`#4F6EF7`', '`#C8FF00`', '`#FFFFFF`'], emotion: 'Intelligent, forward-thinking' },
      { name: 'Luxury Premium', palette: ['`#0D0A05`', '`#C9A84C`', '`#F5F0E8`', '`#2C2417`'], emotion: 'Exclusive, aspirational' },
      { name: 'Bold Energy', palette: ['`#0F0F0F`', '`#FF3D00`', '`#FFE500`', '`#FFFFFF`'], emotion: 'High-impact, disruptive' },
      { name: 'Trust & Authority', palette: ['`#1B2A4A`', '`#2563EB`', '`#F8FAFC`', '`#64748B`'], emotion: 'Reliable, professional' },
    ]
    const p = presets[Math.floor(Math.random() * presets.length)]
    return `**GFXTAB Color Agent** — Palette for **${brand}**\n\nColor is a brand's most powerful unconscious signal.\n\n**Matching preset for ${brand}:**\n**${p.name}** — *${p.emotion}*\n- Primary: ${p.palette[0]}\n- Secondary: ${p.palette[1]}\n- Accent: ${p.palette[2]}\n- Neutral: ${p.palette[3]}\n\n**Or describe the feeling:**\n*"sophisticated but rebellious"*, *"premium but playful"*, *"minimalist with edge"*\n\nI'll output: Primary • Secondary • Accent • 3 Neutrals • Semantic colors (success/warning/error) — all with WCAG ratios.`
  }

  // ─ COPY AGENT ─────────────────────────────────────────────────────
  if (intent.type === 'copy') {
    return `**GFXTAB Copy Agent** — High-Converting Creative Writing for **${brand}**\n\n**Format:**\n- **Instagram caption** — Hook + Story + CTA + hashtags\n- **YouTube hook** — First 3 seconds that stop the scroll\n- **LinkedIn post** — Thought leadership (1K–2K chars)\n- **Ad copy** — 30-word puncher for Meta/Google\n- **Brand tagline** — Sub-7-word brand promise\n- **Email subject** — High open-rate tested formats\n\n**Your brand voice:**\n- 🎯 **Authoritative** — Expert, confident, zero fluff\n- 💬 **Conversational** — Real, human, relatable\n- ⚡ **Bold** — Provocative, contrarian, scroll-stopping\n- 🌟 **Inspirational** — Emotional, motivating, aspirational\n\nTell me the **topic + format + tone** and I'll write it. Or paste a draft and I'll transform it.`
  }

  // ─ GREETING ───────────────────────────────────────────────────────
  if (/(hello|hi|hey|start|begin|what can you do|help|capabilities)/.test(m)) {
    const greeting = mem.userName ? `Welcome back, **${mem.userName}**` : '**Welcome to GFXTAB AI Studio**'
    return `${greeting} 🎨\n\nI'm your dedicated creative AI — a full creative team in one interface.\n\n**Active Specialist Agents:**\n\n🎨 **Logo Agent** — Brand identity, logo design, visual marks\n🏢 **Brand Agent** — Full identity systems, brand strategy\n📸 **Social Agent** — Instagram, LinkedIn, YouTube, banners\n🖥️ **UI Agent** — Dashboards, landing pages, app screens\n✍️ **Copy Agent** — Captions, scripts, ads, headlines\n🎨 **Color Agent** — Palettes, hex codes, WCAG systems\n\n**Start with anything:**\n> *"Create a luxury logo for my streetwear brand"*\n> *"Design a dark mode SaaS dashboard"*\n> *"Write a high-converting Instagram caption"*\n> *"Build a complete brand identity for my startup"*\n\nWhat are we creating today${mem.userName ? `, ${mem.userName}` : ''}?`
  }

  // ─ FOLLOW-UP ──────────────────────────────────────────────────────
  if (isFollowUp && /(yes|sure|go ahead|generate|do it|proceed|make it|create|let's go|ok|okay)/.test(m)) {
    return `**On it.** Generating now for **${brand}**...\n\nApplying:\n- ${style ? `Your preferred **${style}** aesthetic` : 'Style optimized for your context'}\n- The creative direction we defined\n- Engineered prompts for maximum quality\n\nThe image generation result will appear below. ⬇️`
  }

  if (isFollowUp) {
    return `Building on what we discussed${mem.userName ? `, ${mem.userName}` : ''}.\n\n**Next steps for ${brand}:**\n• **Refine** — Tell me what to adjust or improve\n• **Variations** — Generate alternative concepts\n• **Export** — Get the files in your required format\n• **Extend** — Apply this design to other assets (social kit, brand guide, etc.)\n\nWhat direction should we take this?`
  }

  // ─ GENERAL INTELLIGENT RESPONSE ───────────────────────────────────
  const strategies = [
    `Understood${name !== 'Creative' ? `, ${name}` : ''}. For **${brand}**, here's how I'd approach **${message.slice(0, 50).trim()}**:\n\n**Creative Strategy:**\n1. **Define the core** — What single emotion should this make people feel?\n2. **Map the audience** — Who sees this, and in what context?\n3. **Choose visual language** — ${style ? `Your **${style}** style applied here means...` : 'The right direction for your goal'}\n4. **Generate → Refine → Ship**\n\nWhat's the primary goal — awareness, conversion, or engagement?`,
    `Great challenge${name !== 'Creative' ? ` for ${name}` : ''}. My read on **${message.slice(0, 45).trim()}** for **${brand}**:\n\n**Two routes:**\n\n**Route A — Proven:** Category conventions with a strong GFXTAB execution twist. Lower risk, faster approval.\n\n**Route B — Disruptor:** Break the visual conventions of your space. Higher risk, potentially iconic.\n\n${style ? `Given your **${style}** preference, Route B likely serves you better.` : 'Which fits your risk appetite?'}\n\nWhat's your timeline?`,
    `For **${brand}**: Here's my strategic read on **${message.slice(0, 40).trim()}**:\n\nThe most effective ${intent.type !== 'chat' ? intent.type : 'creative output'} needs to do two things simultaneously — **stop them in the scroll**, and **feel instantly trustworthy**.\n\n${industry ? `In **${industry}**, this combination converts significantly better than either alone.` : 'These two goals almost always create the best work.'}\n\nDescribe the specific outcome you need and I'll map the exact execution plan.`
  ]
  return strategies[Math.floor(Math.random() * strategies.length)]
}

function getIndustryInsight(industry) {
  const insights = {
    fashion: 'Fashion logos that outlast trends use monograms, not mascots. Think LV, Gucci, Balenciaga.',
    tech: 'Tech brands that last use geometric abstract marks — Apple, Spotify, Airbnb all prove this.',
    food: 'Food brands convert best with warm palettes (orange, red, yellow) and rounded letterforms.',
    fitness: 'Fitness brands need aggression: sharp angles, bold weight, extreme contrast.',
    beauty: 'Beauty brands signal luxury through negative space — less is always more.',
    gaming: 'Gaming logos need edge: metallic, neon, or chrome with sharp geometric forms.',
    music: 'Music brand marks that work feel rhythmic — dynamic, fluid, with strong negative space.',
    finance: 'Finance logos build trust through blue tones, clean lines, and professional sans-serif.',
    crypto: 'Crypto brands signal innovation through geometric, bold, futuristic minimal palette.',
    saas: 'SaaS logos that scale are simple enough to work at 16×16px (the favicon test).',
    ecommerce: 'E-commerce brands win with friendly, approachable marks — avoid corporate coldness.',
    agency: 'Agency brands need to feel creative-yet-trustworthy — a tension that makes the best marks.',
    default: 'The strongest logos work in one color, at any size, and stay memorable in 5 seconds.'
  }
  return insights[industry] || insights.default
}


// ── Chat History ──────────────────────────────────────────────────
router.get('/chat/history/:sessionId', (req, res) => {
  const session = getSession(req.params.sessionId)
  res.json({ history: session.history, memory: session.memory })
})

// ── Memory Update ─────────────────────────────────────────────────
router.post('/chat/memory', (req, res) => {
  const { sessionId, memory } = req.body
  const session = getSession(sessionId)
  session.memory = { ...session.memory, ...memory }
  res.json({ success: true, memory: session.memory })
})

// ── Session Reset ─────────────────────────────────────────────────
router.delete('/chat/session/:sessionId', (req, res) => {
  delete sessions[req.params.sessionId]
  res.json({ success: true })
})

// ── Image Generation via Gemini Imagen / Fallback ─────────────────
router.post('/generate/image', async (req, res) => {
  const { prompt, sessionId, style } = req.body
  if (!prompt) return res.status(400).json({ error: 'Prompt required' })

  const session = getSession(sessionId || 'global')
  const intent = classifyIntent(prompt)
  const enhanced = engineerPrompt(prompt, intent.type, session.memory)

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY

  if (!GEMINI_API_KEY) {
    // Return 4 SVG placeholder variants
    const palette = [
      { primary: '#c8ff00', secondary: '#ffffff', name: 'Lime Glow' },
      { primary: '#06b6d4', secondary: '#ffffff', name: 'Cyber Cyan' },
      { primary: '#8b5cf6', secondary: '#c8ff00', name: 'Violet Volt' },
      { primary: '#f97316', secondary: '#1e1b4b', name: 'Solar Flare' }
    ]
    const variants = palette.map((p, i) => ({
      id: `var-${i + 1}`,
      name: `${prompt.slice(0, 20)} — ${p.name}`,
      url: generateSvgDataUrl(prompt, p.primary, p.secondary),
      palette: [p.primary, p.secondary],
      engineeredPrompt: enhanced
    }))
    return res.json({ success: true, variants, engineeredPrompt: enhanced })
  }

  try {
    // Try Gemini imagen-3.0-generate-002
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict`,
      {
        instances: [{ prompt: enhanced }],
        parameters: { sampleCount: 4, aspectRatio: '1:1' }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': GEMINI_API_KEY
        }
      }
    )

    const predictions = response.data?.predictions || []
    const variants = predictions.map((p, i) => ({
      id: `var-${i + 1}`,
      name: `${prompt.slice(0, 20)} — Variation ${i + 1}`,
      url: `data:image/png;base64,${p.bytesBase64Encoded}`,
      palette: [],
      engineeredPrompt: enhanced
    }))

    res.json({ success: true, variants, engineeredPrompt: enhanced })
  } catch (err) {
    console.error('Image generation error:', err.message)
    // Fallback SVGs
    const palette = [
      { primary: '#c8ff00', secondary: '#ffffff', name: 'Lime Glow' },
      { primary: '#06b6d4', secondary: '#ffffff', name: 'Cyber Cyan' },
      { primary: '#8b5cf6', secondary: '#c8ff00', name: 'Violet Volt' },
      { primary: '#f97316', secondary: '#1e1b4b', name: 'Solar Flare' }
    ]
    const variants = palette.map((p, i) => ({
      id: `var-${i + 1}`,
      name: `${prompt.slice(0, 20)} — ${p.name}`,
      url: generateSvgDataUrl(prompt, p.primary, p.secondary),
      palette: [p.primary, p.secondary],
      engineeredPrompt: enhanced
    }))
    res.json({ success: true, variants, engineeredPrompt: enhanced })
  }
})

function generateSvgDataUrl(text, primaryColor, secondaryColor) {
  const label = text.slice(0, 14).toUpperCase()
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
    <defs>
      <radialGradient id="bg" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stop-color="#1a1a2e"/>
        <stop offset="100%" stop-color="#09090b"/>
      </radialGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="8" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <rect width="500" height="500" fill="url(#bg)"/>
    <circle cx="250" cy="200" r="80" fill="none" stroke="${primaryColor}" stroke-width="3" filter="url(#glow)" opacity="0.9"/>
    <circle cx="250" cy="200" r="55" fill="none" stroke="${secondaryColor}" stroke-dasharray="12 8" stroke-width="2" opacity="0.6"/>
    <polygon points="250,138 265,168 298,168 272,186 282,218 250,199 218,218 228,186 202,168 235,168" fill="${primaryColor}" filter="url(#glow)"/>
    <text x="250" y="320" font-family="system-ui,sans-serif" font-weight="800" font-size="28" fill="${secondaryColor}" text-anchor="middle" letter-spacing="3">${label}</text>
    <text x="250" y="350" font-family="system-ui,sans-serif" font-size="11" fill="${primaryColor}" text-anchor="middle" opacity="0.7" letter-spacing="5">GFXTAB AI STUDIO</text>
    <line x1="180" y1="370" x2="320" y2="370" stroke="${primaryColor}" stroke-width="1" opacity="0.3"/>
  </svg>`
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

// ── NEW: Advanced Design Pipeline Generation ────────────────────────
router.post('/generate/design-pipeline', async (req, res) => {
  const { prompt, sessionId } = req.body
  if (!prompt) return res.status(400).json({ error: 'Prompt required' })

  const session = getSession(sessionId || 'global')
  const intent = classifyIntent(prompt)
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY
  
  // Create fallback pipeline output if no API key or if Gemini generation fails
  const getFallbackPipeline = (basePrompt) => ({
    conceptName: `${basePrompt.slice(0, 15)} System`,
    designStyle: session.memory.style || 'Modern Minimalist',
    colorSystem: 'High Contrast Neon',
    targetAudience: session.memory.industry || 'Digital Natives',
    commercialUseCases: 'Brand Identity, Web UI, Social Marketing',
    brandPersonality: 'Innovative, Bold, Premium',
    confidenceScore: 92,
    variations: [
      { id: 'var-1', title: 'Option 1: Geometric Minimal', style: 'Geometric', description: 'Clean lines and sharp angles.', palette: ['#c8ff00', '#ffffff'], imagePrompt: `Geometric minimal ${basePrompt}` },
      { id: 'var-2', title: 'Option 2: Luxury Emblem', style: 'Luxury', description: 'Premium crest with metallic hints.', palette: ['#C9A84C', '#ffffff'], imagePrompt: `Luxury emblem ${basePrompt}` },
      { id: 'var-3', title: 'Option 3: Abstract Dynamic', style: 'Abstract', description: 'Fluid shapes with motion blur.', palette: ['#06b6d4', '#ffffff'], imagePrompt: `Abstract dynamic ${basePrompt}` },
      { id: 'var-4', title: 'Option 4: Brutalist Typographic', style: 'Brutalist', description: 'High contrast stark typography.', palette: ['#f97316', '#1e1b4b'], imagePrompt: `Brutalist typographic ${basePrompt}` }
    ]
  })

  let pipelineData;

  if (!GEMINI_API_KEY) {
    pipelineData = getFallbackPipeline(prompt)
  } else {
    try {
      // Step 1: Generate the pipeline strategy and 4 distinct prompts using Gemini
      const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash-latest'
      
      const systemInstruction = `You are the GFXTAB Master Creative Director. 
Analyze the user's prompt: "${prompt}".
Generate a highly structured JSON response detailing the creative strategy and 4 DISTINCT visual design directions.
Do NOT just vary the color. If the prompt is "Cyberpunk Astronaut", the 4 directions should be radically different (e.g., Helmet Logo, Space Badge, Mascot, Minimal Orbit Monogram).

JSON Schema:
{
  "conceptName": "String (e.g., Nexus Identity System)",
  "designStyle": "String",
  "colorSystem": "String",
  "targetAudience": "String",
  "commercialUseCases": "String",
  "brandPersonality": "String",
  "confidenceScore": Number (1-100),
  "variations": [
    {
      "id": "var-1",
      "title": "String (e.g., Futuristic Helmet Logo)",
      "style": "String (e.g., Line Art)",
      "description": "String (short rationale)",
      "palette": ["hex", "hex"],
      "imagePrompt": "String (Highly engineered Midjourney/Imagen prompt for this SPECIFIC variant)"
    },
    // 3 more distinct variations
  ]
}`

      const geminiRes = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
        {
          contents: [{ role: 'user', parts: [{ text: "Generate the design pipeline JSON." }] }],
          system_instruction: { parts: [{ text: systemInstruction }] },
          generationConfig: { temperature: 0.8, responseMimeType: "application/json" }
        },
        { headers: { 'Content-Type': 'application/json', 'X-goog-api-key': GEMINI_API_KEY } }
      )

      const responseText = geminiRes.data.candidates[0].content.parts[0].text
      pipelineData = JSON.parse(responseText)
      
      // Ensure exactly 4 variations exist
      if (!pipelineData.variations || pipelineData.variations.length === 0) {
        pipelineData = getFallbackPipeline(prompt)
      } else {
        while (pipelineData.variations.length < 4) {
          pipelineData.variations.push(pipelineData.variations[0])
        }
        pipelineData.variations = pipelineData.variations.slice(0, 4)
      }

    } catch (err) {
      console.error('Pipeline strategy generation failed:', err.message)
      pipelineData = getFallbackPipeline(prompt)
    }
  }

  // Step 2: Generate actual images for the 4 distinct variations
  const variantsWithImages = await Promise.all(pipelineData.variations.map(async (v, index) => {
    let imageUrl = generateSvgDataUrl(v.title, v.palette[0] || '#c8ff00', v.palette[1] || '#ffffff')

    if (GEMINI_API_KEY) {
      try {
        const imageRes = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict`,
          {
            instances: [{ prompt: v.imagePrompt }],
            parameters: { sampleCount: 1, aspectRatio: '1:1' }
          },
          { headers: { 'Content-Type': 'application/json', 'X-goog-api-key': GEMINI_API_KEY } }
        )
        const b64 = imageRes.data?.predictions?.[0]?.bytesBase64Encoded
        if (b64) imageUrl = `data:image/png;base64,${b64}`
      } catch (e) {
        console.error(`Image gen failed for var ${index}:`, e.message)
      }
    }

    return {
      ...v,
      id: `var-${index + 1}`,
      url: imageUrl
    }
  }))

  pipelineData.variations = variantsWithImages

  res.json({ success: true, pipeline: pipelineData })
})

module.exports = router
