const express = require('express')
const router = express.Router()
let brands = []

router.get('/', (req, res) => res.json({ success: true, data: brands }))
router.post('/', (req, res) => {
  const brand = { id: Date.now().toString(), createdAt: new Date().toISOString(), ...req.body }
  brands.unshift(brand)
  res.status(201).json({ success: true, data: brand })
})
router.patch('/:id', (req, res) => {
  const idx = brands.findIndex(b => b.id === req.params.id)
  if (idx === -1) return res.status(404).json({ success: false, message: 'Brand not found' })
  brands[idx] = { ...brands[idx], ...req.body }
  res.json({ success: true, data: brands[idx] })
})
router.delete('/:id', (req, res) => {
  brands = brands.filter(b => b.id !== req.params.id)
  res.json({ success: true })
})
module.exports = router
