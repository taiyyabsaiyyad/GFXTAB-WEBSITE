const express = require('express')
const router = express.Router()

router.post('/', (req, res) => {
  // In production: use multer + upload to Cloudflare R2/S3
  const { filename, size, type } = req.body
  const uploadId = Date.now().toString()
  res.json({
    success: true,
    data: {
      uploadId,
      url: `/uploads/${uploadId}/${filename}`,
      status: 'uploaded',
    }
  })
})

router.get('/:id/status', (req, res) => {
  res.json({ success: true, data: { uploadId: req.params.id, status: 'complete' } })
})

// In production: presigned URL for direct S3 upload
router.post('/presign', (req, res) => {
  res.json({
    success: true,
    data: {
      uploadUrl: 'https://r2.mockupai.studio/upload',
      publicUrl: 'https://assets.mockupai.studio/uploads/',
    }
  })
})

module.exports = router
