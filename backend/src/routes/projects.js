const express = require('express')
const router = express.Router()

// In-memory projects store (replace with MongoDB)
let projects = []

// GET /projects
router.get('/', (req, res) => {
  const { userId } = req.query
  res.json({ success: true, data: projects.filter(p => !userId || p.userId === userId) })
})

// POST /projects
router.post('/', (req, res) => {
  const project = { id: Date.now().toString(), createdAt: new Date().toISOString(), ...req.body }
  projects.unshift(project)
  res.status(201).json({ success: true, data: project })
})

// GET /projects/:id
router.get('/:id', (req, res) => {
  const project = projects.find(p => p.id === req.params.id)
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' })
  res.json({ success: true, data: project })
})

// PATCH /projects/:id
router.patch('/:id', (req, res) => {
  const idx = projects.findIndex(p => p.id === req.params.id)
  if (idx === -1) return res.status(404).json({ success: false, message: 'Project not found' })
  projects[idx] = { ...projects[idx], ...req.body, updatedAt: new Date().toISOString() }
  res.json({ success: true, data: projects[idx] })
})

// DELETE /projects/:id
router.delete('/:id', (req, res) => {
  const idx = projects.findIndex(p => p.id === req.params.id)
  if (idx === -1) return res.status(404).json({ success: false, message: 'Project not found' })
  projects.splice(idx, 1)
  res.json({ success: true, message: 'Project deleted' })
})

module.exports = router
