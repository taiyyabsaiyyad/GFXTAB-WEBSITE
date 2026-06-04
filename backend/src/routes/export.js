const express = require('express')
const router = express.Router()

const EXPORT_FORMATS = {
  'png-hd':    { width: 3000, height: 3000, format: 'png', quality: 1.0 },
  'png-web':   { width: 1200, height: 1200, format: 'png', quality: 0.95 },
  'jpg-print': { width: 4000, format: 'jpeg', quality: 0.98, colorSpace: 'CMYK' },
  'instagram': { width: 1080, height: 1080, format: 'png' },
  'stories':   { width: 1080, height: 1920, format: 'png' },
  'linkedin':  { width: 1200, height: 627, format: 'png' },
}

router.post('/', async (req, res) => {
  const { mockupId, format = 'png-hd', brand } = req.body
  const spec = EXPORT_FORMATS[format] || EXPORT_FORMATS['png-hd']
  await new Promise(r => setTimeout(r, 400))

  const exportJob = {
    id: Date.now().toString(),
    status: 'processing',
    format, spec, brand,
    filename: `mockupai_${mockupId || 'mockup'}_${brand || 'gfxtab'}_${Date.now()}.${spec.format}`,
    estimatedTime: 3000,
  }

  setTimeout(() => { exportJob.status = 'complete' }, 3000)
  res.json({ success: true, data: exportJob })
})

router.get('/:id/download', (req, res) => {
  res.json({
    success: true,
    data: {
      downloadUrl: `/exports/${req.params.id}/file.png`,
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
    }
  })
})

module.exports = router
