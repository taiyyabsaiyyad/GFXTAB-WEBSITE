const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const router = express.Router()

const JWT_SECRET = process.env.JWT_SECRET || 'mockupai-dev-secret-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

// Mock user store (replace with MongoDB in production)
const users = [
  {
    id: '1',
    name: 'Taiyyab Saiyyad',
    email: 'taiyyab@gfxtab.com',
    passwordHash: '$2a$10$placeholder', // pre-hashed
    plan: 'pro',
    credits: 500,
    company: 'GFXTAB Productions',
  }
]

const generateToken = (userId) =>
  jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' })

    const user = users.find(u => u.email === email)
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' })

    // In dev, accept any password for demo user
    const token = generateToken(user.id)
    const { passwordHash, ...userData } = user

    res.json({ success: true, data: { user: userData, token } })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'All fields required' })
    if (users.find(u => u.email === email)) return res.status(400).json({ success: false, message: 'Email already registered' })

    const hash = await bcrypt.hash(password, 10)
    const newUser = { id: Date.now().toString(), name, email, passwordHash: hash, plan: 'free', credits: 50 }
    users.push(newUser)

    const token = generateToken(newUser.id)
    const { passwordHash: _, ...userData } = newUser
    res.status(201).json({ success: true, data: { user: userData, token } })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /auth/refresh
router.post('/refresh', (req, res) => {
  const { token } = req.body
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    const newToken = generateToken(payload.sub)
    res.json({ success: true, data: { token: newToken } })
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' })
  }
})

// GET /auth/me
router.get('/me', (req, res) => {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'No token' })
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET)
    const user = users.find(u => u.id === payload.sub)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    const { passwordHash, ...userData } = user
    res.json({ success: true, data: userData })
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' })
  }
})

module.exports = router
