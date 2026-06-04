const express = require('express')
const router = express.Router()

// Mock AI analysis — replace with Python AI service call
router.post('/analyze', async (req, res) => {
  try {
    // Simulate processing
    await new Promise(r => setTimeout(r, 800))

    const result = {
      imageType: 'logo',
      confidence: 0.92,
      palette: [
        { hex: '#C8FF00', rgb: { r: 200, g: 255, b: 0 }, name: 'Electric Lime', weight: 0.45 },
        { hex: '#7B2FFF', rgb: { r: 123, g: 47, b: 255 }, name: 'Deep Violet', weight: 0.3 },
        { hex: '#00D4FF', rgb: { r: 0, g: 212, b: 255 }, name: 'Cryo Blue', weight: 0.15 },
        { hex: '#020208', rgb: { r: 2, g: 2, b: 8 }, name: 'Void Black', weight: 0.08 },
        { hex: '#F0F0F0', rgb: { r: 240, g: 240, b: 240 }, name: 'Cloud White', weight: 0.02 },
      ],
      bgRemovedUrl: null,
      suggestions: [
        { product: 'tshirt-crew', score: 0.95, reason: 'Perfect for apparel branding' },
        { product: 'poster-a3',   score: 0.91, reason: 'Scales beautifully to large format' },
        { product: 'book-cover',  score: 0.88, reason: 'Great visual impact on print' },
        { product: 'mug-ceramic', score: 0.82, reason: 'High contrast merchandise' },
        { product: 'business-card', score: 0.79, reason: 'Professional branding asset' },
      ],
      contrastScore: 0.82,
      placementZone: { x: 0.25, y: 0.2, w: 0.5, h: 0.45 },
    }

    res.json({ success: true, data: result })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /ai/suggest — get product suggestions for image type
router.get('/suggest', (req, res) => {
  const { imageType } = req.query
  const suggestions = {
    logo: ['tshirt-crew', 'business-card', 'mug-ceramic', 'tote-bag', 'cap-5panel'],
    photograph: ['frame-print', 'poster-a3', 'pillow', 'canvas-bag', 'phone-case'],
    illustration: ['book-cover', 'poster-a3', 'sticker-sheet', 'notebook', 'mug-ceramic'],
    pattern: ['tshirt-oversized', 'pillow', 'tote-bag', 'hoodie', 'mousepad'],
  }
  res.json({ success: true, data: suggestions[imageType] || suggestions.logo })
})

module.exports = router
