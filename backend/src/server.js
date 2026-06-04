/**
 * GFXTAB AI Studio — Express Server
 * GFXTAB Productions
 */

require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')

// Routes
const authRoutes = require('./routes/auth')
const uploadRoutes = require('./routes/upload')
const aiRoutes = require('./routes/ai')
const mockupRoutes = require('./routes/mockup')
const exportRoutes = require('./routes/export')
const projectRoutes = require('./routes/projects')
const brandRoutes = require('./routes/brands')
const aiStudioRoutes = require('./routes/aistudio')

const app = express()
const PORT = process.env.PORT || 4000

// ---- Middleware ----
app.use(helmet())
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:5174'
  ].filter(Boolean),
  credentials: true,
}))
app.use(morgan('dev'))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

const fs = require('fs')
const path = require('path')
const VECTOR_DIR = 'd:/GFXTAB/Website/Mockup/assets/VECTOR'
const FONT_DIR = 'd:/GFXTAB/Website/Mockup/assets/FONT'

// ---- Health check ----
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'GFXTAB AI Studio API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    author: 'GFXTAB Studio Team',
  })
})

// ---- Vector Assets API ----
app.get('/vectors/list', (req, res) => {
  if (!fs.existsSync(VECTOR_DIR)) {
    return res.json({ success: true, vectors: [] })
  }
  fs.readdir(VECTOR_DIR, (err, files) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message })
    }
    const epsFiles = files.filter(f => f.endsWith('.eps'))
    const classyNames = [
      "Minimalist Geometric Logo",
      "Abstract Line Composition",
      "Corporate Brand Identity Set",
      "Organic Vector Shapes Grid",
      "SaaS Dashboard Wireframe",
      "Retro Emblem Insignia",
      "Botanical Outline Badge",
      "Futuristic Tech Illustration",
      "Flat Character Layout",
      "Creative Wave Wallpaper",
      "Retro Badge Ornament",
      "Monoline Landscape Banner",
      "Vintage Vector Crest",
      "Corporate Brochure Asset",
      "Modern Web Dashboard UI"
    ]
    const vectors = epsFiles.map((file, idx) => {
      const designName = classyNames[idx % classyNames.length] + ` #${idx + 1}`
      return {
        id: file,
        name: file.startsWith('shutterstock_') ? designName : file.replace('.eps', '').replace(/_/g, ' '),
        category: 'vectors',
        description: `Premium GFXTAB design resource file: ${file}`,
        previewAsset: `vector-svg-${idx}`,
        fileSize: `${(fs.statSync(path.join(VECTOR_DIR, file)).size / 1024 / 1024).toFixed(2)} MB`,
        isPremium: idx % 3 === 0,
        price: idx % 3 === 0 ? 29 : 0,
        tags: ['vector', 'design', 'clean', 'graphic']
      }
    })
    res.json({ success: true, vectors })
  })
})

app.get('/vectors/download/:filename', (req, res) => {
  const filename = req.params.filename
  const filePath = path.join(VECTOR_DIR, filename)
  if (fs.existsSync(filePath)) {
    res.download(filePath)
  } else {
    res.status(404).json({ success: false, message: 'Vector file not found' })
  }
})

// ---- Fonts Assets API ----
app.get('/fonts/list', (req, res) => {
  if (!fs.existsSync(FONT_DIR)) {
    return res.json({ success: true, fonts: [] })
  }
  fs.readdir(FONT_DIR, (err, files) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message })
    }
    const fontFiles = files.filter(f => /\.(ttf|otf)$/i.test(f))
    const fonts = fontFiles.map((file, idx) => {
      // Modulo to assign a beautiful preview image from GFXTAB sample assets
      const imgIndex = ((idx + 10) % 50) + 1
      return {
        id: file,
        name: file.replace(/\.(ttf|otf)$/i, '').replace(/_/g, ' '),
        category: 'fonts',
        description: `High-quality creator font: ${file.replace(/\.(ttf|otf)$/i, '')}`,
        previewAsset: `Photo from GFXTAB(${imgIndex}).jpg`,
        fileSize: `${(fs.statSync(path.join(FONT_DIR, file)).size / 1024).toFixed(1)} KB`,
        isPremium: false,
        price: 0,
        tags: ['font', 'typeface', 'typography', 'sans', 'serif']
      }
    })
    res.json({ success: true, fonts })
  })
})

app.get('/fonts/download/:filename', (req, res) => {
  const filename = req.params.filename
  const filePath = path.join(FONT_DIR, filename)
  if (fs.existsSync(filePath)) {
    res.download(filePath)
  } else {
    res.status(404).json({ success: false, message: 'Font file not found' })
  }
})

// ---- Design Inquiries & Mockup Templates Storage ----
let uploadedMockups = []
let uploadedIcons = []
let uploadedTemplates = []

app.post('/fonts/create', (req, res) => {
  const { name, filename, fileData } = req.body
  if (!filename || !fileData) {
    return res.status(400).json({ success: false, message: 'Filename and file data are required.' })
  }
  try {
    const base64Data = fileData.replace(/^data:.*;base64,/, "")
    const filePath = path.join(FONT_DIR, filename)
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'))
    console.log(`[FONT SAVED] ${filename} to disk directory`)
    res.json({ success: true, message: 'Font uploaded successfully.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Failed to write font file to disk' })
  }
})

app.post('/vectors/create', (req, res) => {
  const { name, filename, fileData } = req.body
  if (!filename || !fileData) {
    return res.status(400).json({ success: false, message: 'Filename and file data are required.' })
  }
  try {
    const base64Data = fileData.replace(/^data:.*;base64,/, "")
    const filePath = path.join(VECTOR_DIR, filename)
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'))
    console.log(`[VECTOR SAVED] ${filename} to disk directory`)
    res.json({ success: true, message: 'Vector uploaded successfully.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Failed to write vector file to disk' })
  }
})

app.get('/icons/list', (req, res) => {
  res.json({ success: true, icons: uploadedIcons })
})

app.post('/icons/create', (req, res) => {
  const { name, description, tags, image_url, is_premium, price } = req.body
  const newIcon = {
    id: `icon-${Date.now()}`,
    name,
    category: 'icons',
    description: description || 'Premium GFXTAB icons asset pack.',
    tags: Array.isArray(tags) ? tags : [],
    previewAsset: image_url || 'Photo from GFXTAB(20).jpg',
    isPremium: !!is_premium,
    price: Number(price) || 0
  }
  uploadedIcons.push(newIcon)
  console.log(`[ICON UPLOADED] ${newIcon.name}`)
  res.json({ success: true, icon: newIcon })
})

app.get('/templates/list', (req, res) => {
  res.json({ success: true, templates: uploadedTemplates })
})

app.post('/templates/create', (req, res) => {
  const { name, description, tags, image_url, is_premium, price } = req.body
  const newTemp = {
    id: `temp-${Date.now()}`,
    name,
    category: 'templates',
    description: description || 'Premium GFXTAB layout print template.',
    tags: Array.isArray(tags) ? tags : [],
    previewAsset: image_url || 'Photo from GFXTAB(22).jpg',
    isPremium: !!is_premium,
    price: Number(price) || 0
  }
  uploadedTemplates.push(newTemp)
  console.log(`[TEMPLATE UPLOADED] ${newTemp.name}`)
  res.json({ success: true, template: newTemp })
})

app.post('/inquiries/submit', (req, res) => {
  const { assetId, assetName, name, email, requirements } = req.body
  if (!name || !email || !requirements) {
    return res.status(400).json({ success: false, message: 'All fields are required.' })
  }
  console.log(`[INQUIRY RECEIVED] Asset: ${assetName} (${assetId}), User: ${name} <${email}>, Requirements: ${requirements}`)
  res.json({
    success: true,
    message: 'Inquiry received by GFXTAB system.',
    confirmationId: `GFX-REQ-${Math.floor(100000 + Math.random() * 900000)}`
  })
})

app.get('/mockups/list', (req, res) => {
  res.json({ success: true, mockups: uploadedMockups })
})

app.post('/mockups/create', (req, res) => {
  const { name, category, description, tags, placement_data, image_url, is_premium, price } = req.body
  const newMockup = {
    id: `mock-${Date.now()}`,
    name,
    category,
    description: description || 'Clean template mockup asset.',
    tags: Array.isArray(tags) ? tags : [],
    printZone: placement_data || { x: 0.2, y: 0.2, w: 0.6, h: 0.6 },
    previewAsset: image_url || 'Photo from GFXTAB(1).jpg',
    isPremium: !!is_premium,
    price: Number(price) || 0
  }
  uploadedMockups.push(newMockup)
  console.log(`[TEMPLATE UPLOADED] ${newMockup.name} under category ${newMockup.category}`)
  res.json({ success: true, mockup: newMockup })
})

// ---- Routes ----
app.use('/auth', authRoutes)
app.use('/upload', uploadRoutes)
app.use('/ai', aiRoutes)
app.use('/mockup', mockupRoutes)
app.use('/export', exportRoutes)
app.use('/projects', projectRoutes)
app.use('/brands', brandRoutes)
app.use('/studio', aiStudioRoutes)

// ---- User Activity Tracking API ----
app.post('/track', (req, res) => {
  const trackingFile = 'd:/GFXTAB/Website/Mockup/gfxtab_user_tracking.json'
  const newEvent = req.body

  try {
    let events = []
    if (fs.existsSync(trackingFile)) {
      const content = fs.readFileSync(trackingFile, 'utf8')
      if (content.trim()) {
        try {
          events = JSON.parse(content)
        } catch (e) {
          console.error('[Tracker] Failed to parse tracking file, resetting.', e)
        }
      }
    }
    events.push(newEvent)
    fs.writeFileSync(trackingFile, JSON.stringify(events, null, 2), 'utf8')
    console.log(`[TRACK] ${newEvent.event} for ${newEvent.user?.email || 'Guest'}`)
    res.json({ success: true })
  } catch (err) {
    console.error('[Tracker] Error writing to tracking file:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

app.get('/track/list', (req, res) => {
  const trackingFile = 'd:/GFXTAB/Website/Mockup/gfxtab_user_tracking.json'
  if (fs.existsSync(trackingFile)) {
    res.sendFile(trackingFile)
  } else {
    res.json([])
  }
})

// ---- 404 ----
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// ---- Global error handler ----
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  })
})

// ---- Start ----
app.listen(PORT, () => {
  console.log(`\n🚀 GFXTAB AI Studio API running on http://localhost:${PORT}`)
  console.log(`📡 Platform Status: Production Ready\n`)
})

module.exports = app
