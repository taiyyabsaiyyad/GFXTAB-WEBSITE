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
  logo: 'ultra-realistic, luxury metallic sheen, award-winning logo design, masterclass composition, octane render, 8k, cinematic studio lighting, black background, hyperdetailed vector paths',
  thumbnail: 'high click-through-rate YouTube thumbnail, bold typography, cinematic lighting, dramatic contrast, 4K ultra-sharp, attention-grabbing, professional graphic design',
  banner: 'professional social media banner, eye-catching gradient background, high impact, modern minimalism, 4K, brand-safe, cohesive color story',
  illustration: 'editorial concept illustration, dynamic pose, vector art style, vibrant color palette, professional digital art, studio quality, 4K',
  poster: 'premium cinema-quality movie poster composition, dramatic lighting, rich textures, pro typography hierarchy, printable, 4K ultra HD',
  ui: 'clean SaaS dashboard UI mockup, modern dark mode, glassmorphism card components, well-spaced layout, Figma-quality design, professional UX',
  default: 'ultra high quality, professional creative asset, studio quality, premium output, sharp detail, award-winning production value'
}

function engineerPrompt(userPrompt, intent, memory) {
  const base = userPrompt.trim()
  const enhancer = CREATIVE_ENHANCER[intent] || CREATIVE_ENHANCER.default
  const brandCtx = memory.brand ? `, brand: ${memory.brand}` : ''
  const styleCtx = memory.style ? `, style: ${memory.style}` : ''
  return `${base}${brandCtx}${styleCtx}. ${enhancer}`
}

// ── Intent Classifier ────────────────────────────────────────────
function classifyIntent(message) {
  const m = message.toLowerCase()
  if (/(logo|brand mark|wordmark|identity|emblem)/.test(m)) return { type: 'logo', needsImage: true }
  if (/(thumbnail|youtube|yt thumb)/.test(m)) return { type: 'thumbnail', needsImage: true }
  if (/(banner|cover|header|og image)/.test(m)) return { type: 'banner', needsImage: true }
  if (/(illustration|drawing|artwork|concept art)/.test(m)) return { type: 'illustration', needsImage: true }
  if (/(poster|flyer|print)/.test(m)) return { type: 'poster', needsImage: true }
  if (/(ui|interface|dashboard|app design|website design|screen)/.test(m)) return { type: 'ui', needsImage: true }
  if (/(photo|photograph|realistic|product shot)/.test(m)) return { type: 'photo', needsImage: true }
  if (/(script|reel|video|caption|content|copy|text)/.test(m)) return { type: 'copy', needsImage: false }
  if (/(color|palette|swatch|hex|rgb)/.test(m)) return { type: 'palette', needsImage: false }
  if (/(font|typography|typeface)/.test(m)) return { type: 'typography', needsImage: false }
  return { type: 'chat', needsImage: false }
}

// ── System Prompt Builder ─────────────────────────────────────────
function buildSystemPrompt(memory) {
  const name = memory.userName ? `User's name: ${memory.userName}.` : ''
  const brand = memory.brand ? `Their brand is: ${memory.brand}.` : ''
  const style = memory.style ? `Their preferred style: ${memory.style}.` : ''
  const project = memory.recentProject ? `Recent project: ${memory.recentProject}.` : ''

  return `You are GFXTAB AI Studio — the world's most advanced creative design assistant for designers, creators, and brand builders. You are a combination of ChatGPT, Midjourney, and a senior creative director with 20 years of experience.

${name} ${brand} ${style} ${project}

Your behavior rules:
1. NEVER give generic, repetitive, or template responses. Every reply must be unique and tailored to this user's exact context.
2. Understand creative intent deeply. If a user says "make a logo", understand their brand, audience, style, and purpose before generating.
3. When working on design tasks, first acknowledge the goal, optionally ask 1–2 highly relevant clarifying questions (never more), then proceed to generate.
4. For image generation tasks, internally construct a detailed, engineered prompt and show it to the user in a "Prompt Used" block.
5. Think in layers: Intent → Planning → Clarify if needed → Enhance prompt → Generate → Evaluate → Respond.
6. Use Markdown for structure. Use **bold** for key terms, bullet lists for options, and code blocks for prompts.
7. Always remember context from the conversation. Don't repeat yourself. Build on what was said before.
8. You specialize in: logos, thumbnails, social media posts, UI/UX design, branding, motion graphics, photography, illustration, copywriting for designers.
9. Personality: Confident, brilliant, fast, creative. Like working with the best designer you've ever met.
10. If asked to generate an image, provide: (a) a creative brief summary, (b) the engineered prompt you used, (c) the generated result or a clear indication it's being generated.
11. Give concise but impactful responses. Never be verbose.`
}

// ── Gemini Streaming Chat ─────────────────────────────────────────
router.post('/chat/stream', async (req, res) => {
  const { message, sessionId } = req.body
  if (!message || !sessionId) {
    return res.status(400).json({ error: 'message and sessionId required' })
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY
  const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash-latest'
  if (!GEMINI_API_KEY) {
    // Fallback to intelligent simulated response if no API key
    return simulatedStream(req, res, message, sessionId)
  }

  const session = getSession(sessionId)
  const intent = classifyIntent(message)

  // Update memory from message
  const nameMatch = message.match(/(?:i'm|i am|my name is|call me)\s+([A-Za-z]+)/i)
  if (nameMatch) session.memory.userName = nameMatch[1]
  const brandMatch = message.match(/(?:brand|company|called|named?)\s+([A-Za-z0-9]+)/i)
  if (brandMatch) session.memory.brand = brandMatch[1]
  const styleMatch = message.match(/\b(minimalist|luxury|futuristic|cyberpunk|retro|vintage|modern|bold|elegant|playful)\b/i)
  if (styleMatch) session.memory.style = styleMatch[1]
  if (intent.type !== 'chat') session.memory.recentProject = intent.type

  // Build conversation history for Gemini
  const systemPrompt = buildSystemPrompt(session.memory)
  const engineeredPrompt = intent.needsImage ? engineerPrompt(message, intent.type, session.memory) : null

  const contents = [
    ...session.history.map(h => ({
      role: h.role,
      parts: [{ text: h.content }]
    })),
    {
      role: 'user',
      parts: [{ text: message }]
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
async function simulatedStream(req, res, message, sessionId, isError = false) {
  const session = getSession(sessionId)
  const intent = classifyIntent(message)

  // Update memory
  const nameMatch = message.match(/(?:i'm|i am|my name is|call me)\s+([A-Za-z]+)/i)
  if (nameMatch) session.memory.userName = nameMatch[1]
  const brandMatch = message.match(/(?:brand|company|called|named?)\s+([A-Za-z0-9]+)/i)
  if (brandMatch) session.memory.brand = brandMatch[1]
  const styleMatch = message.match(/\b(minimalist|luxury|futuristic|cyberpunk|retro|vintage|modern|bold|elegant|playful)\b/i)
  if (styleMatch) session.memory.style = styleMatch[1]
  if (intent.type !== 'chat') session.memory.recentProject = intent.type

  const engineeredPrompt = intent.needsImage ? engineerPrompt(message, intent.type, session.memory) : null
  const mem = session.memory

  // Generate context-aware dynamic response
  const responses = generateDynamicResponse(message, intent, mem, session.history)

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')

  res.write(`data: ${JSON.stringify({ type: 'meta', intent: intent.type, needsImage: intent.needsImage, engineeredPrompt })}\n\n`)

  // Simulate token-by-token streaming
  const words = responses.split(' ')
  let fullText = ''
  for (let i = 0; i < words.length; i++) {
    const chunk = (i === 0 ? '' : ' ') + words[i]
    fullText += chunk
    res.write(`data: ${JSON.stringify({ type: 'token', text: chunk })}\n\n`)
    await new Promise(r => setTimeout(r, 18 + Math.random() * 20))
  }

  session.history.push({ role: 'user', content: message })
  session.history.push({ role: 'model', content: fullText })
  if (session.history.length > 40) session.history = session.history.slice(-40)

  res.write(`data: ${JSON.stringify({ type: 'done', memory: mem })}\n\n`)
  res.end()
}

function generateDynamicResponse(message, intent, mem, history) {
  const m = message.toLowerCase()
  const name = mem.userName || 'Creator'
  const brand = mem.brand || 'your brand'
  const histLen = history.length
  const prevIntent = history.length > 1 ? history[history.length - 2]?.content?.toLowerCase() : ''

  // Contextual awareness
  const isFollowUp = histLen > 2
  const prevWasImage = prevIntent && /(logo|thumbnail|banner|poster|illustration)/.test(prevIntent)

  if (intent.type === 'logo') {
    const styles = ['Luxury Chrome', 'Cyberpunk Neon', 'Minimal Wordmark', 'Bold Geometric']
    const shuffled = styles.sort(() => Math.random() - 0.5)
    return `**Logo Design Brief Received** ${isFollowUp ? '— building on our session' : ''}

Great, ${name}! I'm designing a logo for **${brand}**. Before I generate, let me nail the direction:

**Which style resonates most?**
• ${shuffled[0]}
• ${shuffled[1]}
• ${shuffled[2]}
• ${shuffled[3]}

**Do you need:**
☐ Icon only
☐ Wordmark only
☑ Full logo suite (icon + wordmark + variations)

**Brand personality** (pick 1–2):
• Sophisticated & Luxury
• Bold & Disruptive
• Clean & Corporate
• Creative & Playful

Reply with your choices and I'll immediately generate 4 professional variations — each with a transparent PNG, color palette, and brand usage guide.`
  }

  if (intent.type === 'thumbnail') {
    return `**YouTube Thumbnail Strategy — ${brand}**

A high-converting thumbnail needs 3 elements working together: **emotion**, **contrast**, and **a clear subject**.

Tell me:
1. **Topic** — What is this video about?
2. **Channel style** — (Example: MrBeast shock-face, minimalist tech, gaming drama)
3. **Key text** — The 2–4 words that appear on the thumbnail

Or just share the video title and I'll generate multiple CTR-optimized concepts.

> 💡 *Thumbnails with human faces and large bold text consistently perform 40% better in A/B tests.*`
  }

  if (intent.type === 'ui') {
    return `**UI/UX Design Request — ${brand}**

I'll design a premium interface concept. To create something that's both beautiful and functional:

**What are we designing?**
• Dashboard / Analytics
• Landing Page / Hero Section
• Mobile App Screen
• SaaS Product UI
• E-commerce Storefront

**Visual direction?**
• Dark mode glassmorphism (Vercel-style)
• Light minimal (Linear-style)
• Bold gradient (Stripe-style)
• Brutalist / Editorial

Share your goal and I'll output a detailed component spec, color system, and image mockup.`
  }

  if (intent.type === 'palette') {
    return `**Color Palette Generation — ${brand}**

A brand's color system is its most powerful silent communicator. Let me build you a complete palette.

**What does ${brand} feel like?**
• Tech & Innovation → Electric Blue + Midnight
• Luxury & Premium → Gold + Deep Black + Cream
• Energy & Youth → Lime + Coral + Dark Grey
• Trust & Professional → Navy + White + Subtle Accent

Or describe the emotion: *"sophisticated but approachable"*, *"aggressive and bold"*, etc.

I'll generate: Primary, Secondary, Accent, Neutral, and Semantic (success/error/warning) colors — all with hex codes and WCAG contrast ratios.`
  }

  if (intent.type === 'copy') {
    return `**Creative Copy Mode — ${brand}**

I'll write high-converting, brand-aligned copy. What do you need?

**Format:**
• Instagram caption (hook + body + CTA)
• YouTube script (hook + sections + outro)
• LinkedIn post (thought leadership)
• Ad copy (30-word puncher)
• Product description
• Brand tagline

**Tone for ${brand}:**
• Authoritative & Expert
• Friendly & Conversational
• Bold & Provocative
• Inspirational

Give me the topic or paste your draft and I'll transform it.`
  }

  // Greeting / intro
  if (/(hello|hi|hey|start|begin|what can you do)/.test(m)) {
    return `**Welcome to GFXTAB AI Studio${mem.userName ? `, ${mem.userName}` : ''}** 🎨

I'm your dedicated creative AI — built specifically for designers, creators, and brand builders. I combine deep design intelligence with AI generation to help you create faster and better than ever.

**What I can do right now:**

**🖼 Visual Creation**
• Logos, icons, brand marks
• YouTube thumbnails (CTR-optimized)
• Social media visuals
• Posters, banners, flyers

**🎨 Brand & Design**
• Full brand identity systems
• Color palettes with hex codes
• Typography pairing recommendations
• UI/UX design concepts

**✍️ Creative Writing**
• Captions, scripts, ad copy
• Video hooks & storyboards
• Product descriptions

**🧠 Design Strategy**
• Creative direction
• Competitor analysis
• Trend insights

Start by describing what you're creating. The more context you give, the better the output. *What are we building today?*`
  }

  // Context-aware follow-up
  if (isFollowUp && prevWasImage) {
    const variations = ['more dramatic lighting', 'a different color palette', 'a cleaner minimal version', 'an alternative composition']
    const pick = variations[Math.floor(Math.random() * variations.length)]
    return `Building on what we created — shall I generate a variation with **${pick}**? 

Or you can:
• **Refine** — describe what to change
• **Upscale** — get a higher detail version
• **Publish** — send this to your marketplace catalog
• **New direction** — start a fresh concept

What feels right, ${name}?`
  }

  // General creative query
  const topics = [
    `I understand you want to explore **${message.substring(0, 50)}** for ${brand}. Let me think through this creatively.\n\n**My approach:**\n1. Understand your audience and goal\n2. Research relevant design trends\n3. Engineer a precise creative brief\n4. Generate multiple concepts\n5. Refine based on your feedback\n\nWhat's the primary audience for this? And what feeling should it evoke — excited, trustful, luxurious, energized?`,
    `Great creative challenge${name !== 'Creator' ? `, ${name}` : ''}! Here's how I'd approach **${message.substring(0, 40)}**:\n\n**Creative Strategy:**\n• Define the core emotion/message\n• Choose visual language that supports it\n• Ensure consistency with ${brand}'s identity\n\n**Quick question:** What platform or medium is this for? The answer completely changes the design approach.`,
    `For **${brand}**, this is interesting. ${message.length > 30 ? 'I\'ve analyzed your request' : 'Tell me more'} and here\'s my creative take:\n\nThe most effective approach would combine **strong visual hierarchy** with **${mem.style || 'a distinctive style'}** that sets you apart in your space.\n\nWhat's your timeline and what does success look like for this project?`
  ]
  return topics[Math.floor(Math.random() * topics.length)]
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

module.exports = router
