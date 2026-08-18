import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

// Palette tokens
const NODE_COLOR_A = '#97B3AE' // Target accent #97B3AE
const NODE_COLOR_B = '#B9D9D5' // Light mint accent
const NODE_COLOR_C = '#C4DADE' // Light powder blue

const TICKER_ITEMS = [
  'HR & Payroll',
  'Finance & Accounting',
  'Supply Chain',
  'CRM & Sales',
  'Warehouse & Logistics',
  'Production & Materials',
  'Fleet Management',
  'Fixed Assets',
]

/**
 * PatternBackground
 * -----------------
 * Renders a full-screen canvas with a drifting node-graph effect (65 nodes,
 * connection lines, mouse-repel physics) plus a top scrolling ticker bar.
 *
 * Props:
 *   cursorPosition – { x, y } relative to the app-shell container
 */
export default function PatternBackground({ cursorPosition, loginTheme }) {
  const canvasRef = useRef(null)
  const cursorRef = useRef(cursorPosition)

  useEffect(() => {
    cursorRef.current = cursorPosition
  }, [cursorPosition])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId

    const primaryHex = loginTheme?.primary || '#00A9A8'
    const accentHex = loginTheme?.accent || '#02888D'
    const secondaryHex = loginTheme?.surface || '#DBE5F3'

    // ── Resize ──────────────────────────────────────────────────────────────
    const setSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    setSize()
    window.addEventListener('resize', setSize)

    // ── Node initialisation ─────────────────────────────────────────────────
    const nodeCount = 65
    const colors = [primaryHex, accentHex, secondaryHex]
    const nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      radius: 2 + Math.random() * 2.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 0.55 + Math.random() * 0.35,
    }))

    const REPEL_RADIUS = 130
    const REPEL_STRENGTH = 0.45
    const MAX_SPEED = 0.75

    // ── Render loop ─────────────────────────────────────────────────────────
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Subtle grid lines
      ctx.strokeStyle = 'rgba(0, 169, 168, 0.06)'
      ctx.lineWidth = 1
      const gs = 58
      for (let x = 0; x < canvas.width; x += gs) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += gs) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke()
      }

      const { x: mx, y: my } = cursorRef.current

      nodes.forEach((node, i) => {
        // Mouse repel
        const dxM = node.x - mx
        const dyM = node.y - my
        const distM = Math.sqrt(dxM * dxM + dyM * dyM)
        if (distM < REPEL_RADIUS && distM > 0) {
          const force = (REPEL_RADIUS - distM) / REPEL_RADIUS
          node.vx += (dxM / distM) * force * REPEL_STRENGTH
          node.vy += (dyM / distM) * force * REPEL_STRENGTH
        }

        // Cap speed
        const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy)
        if (speed > MAX_SPEED) {
          node.vx = (node.vx / speed) * MAX_SPEED
          node.vy = (node.vy / speed) * MAX_SPEED
        }

        // Move
        node.x += node.vx
        node.y += node.vy

        // Soft edge bounce
        const margin = 20
        if (node.x < margin) node.vx += 0.12
        else if (node.x > canvas.width - margin) node.vx -= 0.12
        if (node.y < margin) node.vy += 0.12
        else if (node.y > canvas.height - margin) node.vy -= 0.12

        // Organic micro-drift
        node.vx += (Math.random() - 0.5) * 0.018
        node.vy += (Math.random() - 0.5) * 0.018

        // Connection lines between nearby nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j]
          const dx = other.x - node.x
          const dy = other.y - node.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 115) {
            ctx.beginPath()
            ctx.moveTo(node.x, node.y)
            ctx.lineTo(other.x, other.y)
            ctx.strokeStyle = `rgba(0, 169, 168, ${0.16 * (1 - dist / 115)})`
            ctx.lineWidth = 0.9
            ctx.stroke()
          }
        }

        // Radial glow aura behind each dot
        const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius * 3)
        grad.addColorStop(0, node.color + 'BB')
        grad.addColorStop(1, node.color + '00')
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius * 3, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.globalAlpha = node.opacity * 0.3
        ctx.fill()
        ctx.globalAlpha = 1

        // Solid dot
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
        ctx.fillStyle = node.color
        ctx.globalAlpha = node.opacity
        ctx.fill()
        ctx.globalAlpha = 1
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', setSize)
    }
  }, [])

  return (
    <div className="login-pattern-bg">
      {/* Full-screen node-graph canvas */}
      <canvas ref={canvasRef} className="login-pattern-canvas" />

      {/* ── Top Scrolling Ticker Bar ─────────────────────────────── */}
      <div className="login-ticker-tape">
        <motion.div
          className="login-ticker-track"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        >
          {/* Duplicate the items so the loop is seamless */}
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
            <span key={idx} className="login-ticker-item">
              <span className="login-ticker-pulse" />
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
