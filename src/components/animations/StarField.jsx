import { useEffect, useRef } from 'react'

const NUM_STARS = 110
const DEPTH_LAYERS = 3

function createStar(canvas) {
  const layer = Math.floor(Math.random() * DEPTH_LAYERS)
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: layer === 0 ? 0.3 + Math.random() * 0.4 :
          layer === 1 ? 0.6 + Math.random() * 0.6 :
                        0.9 + Math.random() * 0.8,
    opacity: 0.1 + Math.random() * 0.5,
    phase: Math.random() * Math.PI * 2,
    speed: 0.15 + Math.random() * 0.35,
    layer, // 0=far, 1=mid, 2=near
    parallaxFactor: layer === 0 ? 0.01 : layer === 1 ? 0.025 : 0.04,
    color: Math.random() < 0.25 ? '#a1a1aa' : '#ffffff',
  }
}

export default function StarField() {
  const canvasRef = useRef(null)
  const starsRef = useRef([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const animRef = useRef(null)
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      starsRef.current = Array.from({ length: NUM_STARS }, () => createStar(canvas))
    }
    resize()
    window.addEventListener('resize', resize)

    const handleMouse = (e) => {
      mouseRef.current = {
        x: (e.clientX - window.innerWidth / 2),
        y: (e.clientY - window.innerHeight / 2),
      }
    }
    window.addEventListener('mousemove', handleMouse)

    const drawNebula = (ctx, w, h) => {
      // Violet nebula (top-right) - extremely faint
      const grad1 = ctx.createRadialGradient(w * 0.75, h * 0.2, 0, w * 0.75, h * 0.2, w * 0.45)
      grad1.addColorStop(0, 'rgba(123, 47, 255, 0.015)')
      grad1.addColorStop(1, 'rgba(123, 47, 255, 0)')
      ctx.fillStyle = grad1
      ctx.fillRect(0, 0, w, h)

      // Blue nebula (bottom-left) - extremely faint
      const grad2 = ctx.createRadialGradient(w * 0.15, h * 0.8, 0, w * 0.15, h * 0.8, w * 0.4)
      grad2.addColorStop(0, 'rgba(0, 212, 255, 0.012)')
      grad2.addColorStop(1, 'rgba(0, 212, 255, 0)')
      ctx.fillStyle = grad2
      ctx.fillRect(0, 0, w, h)
    }

    const render = (timestamp) => {
      timeRef.current = timestamp * 0.001

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#020208'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      drawNebula(ctx, canvas.width, canvas.height)

      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      starsRef.current.forEach((star) => {
        const twinkle = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(timeRef.current * star.speed + star.phase))
        const opacity = star.opacity * twinkle
        const px = star.parallaxFactor * mx
        const py = star.parallaxFactor * my
        const sx = star.x + px
        const sy = star.y + py

        ctx.globalAlpha = opacity
        ctx.fillStyle = star.color
        ctx.beginPath()
        ctx.arc(sx, sy, star.size, 0, Math.PI * 2)
        ctx.fill()

        // Occasional "shooting star" cross for bright near stars (no save/restore)
        if (star.layer === 2 && opacity > 0.85) {
          ctx.globalAlpha = opacity * 0.15
          ctx.strokeStyle = star.color
          ctx.lineWidth = 0.5
          ctx.beginPath()
          ctx.moveTo(sx - star.size * 3, sy)
          ctx.lineTo(sx + star.size * 3, sy)
          ctx.moveTo(sx, sy - star.size * 3)
          ctx.lineTo(sx, sy + star.size * 3)
          ctx.stroke()
        }
      })

      animRef.current = requestAnimationFrame(render)
    }

    animRef.current = requestAnimationFrame(render)

    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(animRef.current)
      } else {
        animRef.current = requestAnimationFrame(render)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouse)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="starfield-canvas"
      aria-hidden="true"
    />
  )
}
