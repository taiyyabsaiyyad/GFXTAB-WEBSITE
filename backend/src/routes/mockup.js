const express = require('express')
const router = express.Router()

router.post('/generate', async (req, res) => {
  const { productId, artworkUrl, colorVariant } = req.body
  await new Promise(r => setTimeout(r, 600))
  res.json({
    success: true,
    data: {
      jobId: Date.now().toString(),
      status: 'processing',
      mockupUrl: null,
      product: productId,
    }
  })
})

router.get('/:id', (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.params.id,
      status: 'complete',
      mockupUrl: '/assets/Artboard 1.jpg',
    }
  })
})

module.exports = router
