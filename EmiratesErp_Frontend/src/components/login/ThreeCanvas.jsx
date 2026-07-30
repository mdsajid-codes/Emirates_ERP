import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * ThreeCanvas — Fixed
 * -------------------
 * Fix 1 (live animations): The previous version stored `scaleWrapper` in
 *   currentObjectsRef, but only the child group had `userData.animate`.
 *   scaleWrapper.userData.animate was always undefined, so the animation
 *   loop never called it. Now each slide's group is stored directly — no
 *   intermediary wrapper needed.
 *
 * Fix 2 (uniform size): All four slides now use the same "standard orbit
 *   radius" of ≤ 3.2 units from center. Camera is at z=10, FOV=45, giving
 *   a visible half-height of ~4.1 units — so radius 3.2 fills ~78% of the
 *   panel height, matching the globe's visual footprint on every slide.
 *
 *   Size table (max orbit radius):
 *     Slide 0 HR     — core r=1.6, nodes r=2.6..3.0, ring r=3.2
 *     Slide 1 Finance — cube 1.8, wire 2.4, rings r=3.0/3.5
 *     Slide 2 Globe   — globe r=2.0, cargo r=2.8..3.2
 *     Slide 3 CRM    — cone r=1.6 h=2.8, particles spread ±4 units
 *
 * A ResizeObserver ensures the renderer re-sizes correctly whenever the
 * right panel's actual pixel dimensions change (fixes blank canvas on init).
 */

// ── Color tokens ──────────────────────────────────────────────────────────
const COLOR_TARGET    = 0x97B3AE   // User requested color #97B3AE
const COLOR_MINT      = 0xB9D9D5
const COLOR_BLUE      = 0xC4DADE
const COLOR_SAGE      = 0xD2E0D3
const COLOR_SLATE     = 0xDDEBED
const COLOR_ICE       = 0xECF2F5
const COLOR_DARK_MINT = 0x1E3B37

const BRAND_PRIMARY    = COLOR_TARGET
const BRAND_ACCENT     = COLOR_TARGET
const BRAND_ACCENT_DIM = COLOR_MINT
const BRAND_SECONDARY  = COLOR_BLUE
const BRAND_LIGHT_MINT = COLOR_TARGET
const BRAND_LIGHT_BLUE = COLOR_BLUE

export default function ThreeCanvas({ activeSlideIndex }) {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const cameraRef = useRef(null)
  const currentObjectsRef = useRef([])   // holds the active slide's Group directly
  const mouseRef = useRef({ x: 0, y: 0 })
  const animFrameRef = useRef(null)

  // ── One-time: scene / renderer / camera / lights / loop ─────────────────
  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    // Use fallback sizes if the container hasn't laid out yet
    const w = container.clientWidth || 500
    const h = container.clientHeight || 600

    // Scene
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Camera at z=10 — FOV 45° → visible half-height ≈ 4.14 units
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000)
    camera.position.z = 10
    cameraRef.current = camera

    // Renderer (alpha transparent so dark panel bg shows through)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 1.2))

    const pl1 = new THREE.PointLight(BRAND_LIGHT_MINT, 5.5, 80)
    pl1.position.set(8, 8, 8)
    scene.add(pl1)

    const pl2 = new THREE.PointLight(BRAND_LIGHT_BLUE, 5.5, 80)
    pl2.position.set(-8, -8, 8)
    scene.add(pl2)

    // Mouse → normalized device coords for camera parallax
    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect()
      mouseRef.current = {
        x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
        y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
      }
    }
    window.addEventListener('mousemove', onMouseMove)

    // ResizeObserver — re-sizes renderer whenever the container's layout changes
    // (handles first-paint when clientWidth/Height was 0)
    const onResize = () => {
      const nw = container.clientWidth
      const nh = container.clientHeight
      if (!nw || !nh) return
      camera.aspect = nw / nh
      camera.updateProjectionMatrix()
      renderer.setSize(nw, nh)
    }
    const resizeObs = new ResizeObserver(onResize)
    resizeObs.observe(container)
    window.addEventListener('resize', onResize)

    // ── Animation loop — always live, driven by elapsed time ────────────────
    const clock = new THREE.Clock()

    const tick = () => {
      animFrameRef.current = requestAnimationFrame(tick)
      const t = clock.getElapsedTime()

      // Gentle camera parallax following mouse (stays subtle)
      camera.position.x += (mouseRef.current.x * 1.5 - camera.position.x) * 0.05
      camera.position.y += (mouseRef.current.y * 1.5 - camera.position.y) * 0.05
      camera.lookAt(0, 0, 0)

      // Call every active slide group's animate(t) callback
      // NOTE: we store the group directly (no wrapper), so userData.animate
      // is always defined here.
      currentObjectsRef.current.forEach((obj) => {
        if (typeof obj.userData.animate === 'function') {
          obj.userData.animate(t)
        }
      })

      renderer.render(scene, camera)
    }
    tick()

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      resizeObs.disconnect()
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  // ── Rebuild scene objects whenever the active slide changes ──────────────
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return

    // Dispose and remove previous slide's geometry + material
    currentObjectsRef.current.forEach((obj) => {
      scene.remove(obj)
      obj.traverse((child) => {
        if (child.geometry) child.geometry.dispose()
        if (child.material) {
          if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose())
          else child.material.dispose()
        }
      })
    })
    currentObjectsRef.current = []

    // ─────────────────────────────────────────────────────────────────────────
    // SLIDE 0 — HR & Workforce Neural Mesh
    // Standard envelope: core r=1.6, nodes r=2.6–3.0, outer ring r=3.2
    // ─────────────────────────────────────────────────────────────────────────
    if (activeSlideIndex === 0) {
      const group = new THREE.Group()

      // Icosahedron wireframe core
      const coreMat = new THREE.MeshStandardMaterial({
        color: BRAND_ACCENT,
        wireframe: true,
        emissive: BRAND_ACCENT,
        emissiveIntensity: 0.6,
        roughness: 0.2,
      })
      const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.6, 1), coreMat)
      group.add(core)

      // Inner solid gem
      const gem = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.9, 0),
        new THREE.MeshStandardMaterial({
          color: BRAND_SECONDARY,
          emissive: BRAND_ACCENT,
          emissiveIntensity: 0.8,
          metalness: 0.9,
        })
      )
      group.add(gem)

      // Orbiting employee nodes — radius 2.6 to 3.0
      const nodeCount = 12
      const nodes = []
      for (let i = 0; i < nodeCount; i++) {
        const node = new THREE.Mesh(
          new THREE.SphereGeometry(0.16, 16, 16),
          new THREE.MeshStandardMaterial({
            color: i % 2 === 0 ? BRAND_ACCENT : BRAND_SECONDARY,
            emissive: BRAND_ACCENT,
            emissiveIntensity: 0.9,
          })
        )
        group.add(node)
        nodes.push({
          mesh: node,
          angle: (i / nodeCount) * Math.PI * 2,
          radius: 2.6 + (i % 3) * 0.2,   // max 3.0
          speed: 0.55 + (i % 3) * 0.15,
        })
      }

      // Outer torus ring at r=3.2
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(3.2, 0.04, 16, 100),
        new THREE.MeshBasicMaterial({ color: BRAND_SECONDARY, transparent: true, opacity: 0.5 })
      )
      ring.rotation.x = Math.PI / 3.2
      group.add(ring)

      // ⬇  Animate callback stored directly on the group (no wrapper)
      group.userData.animate = (t) => {
        core.rotation.x = t * 0.35
        core.rotation.y = t * 0.55
        gem.rotation.y = -t * 0.8
        ring.rotation.z = -t * 0.4
        nodes.forEach((n) => {
          const a = n.angle + t * n.speed
          n.mesh.position.set(
            Math.cos(a) * n.radius,
            Math.sin(a * 0.8) * (n.radius * 0.45),
            Math.sin(a) * n.radius
          )
        })
      }

      scene.add(group)
      currentObjectsRef.current.push(group)
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SLIDE 1 — Finance Ledger Cube
    // Standard envelope: solid cube 1.8, wire 2.4, rings r=3.0/3.5
    // ─────────────────────────────────────────────────────────────────────────
    else if (activeSlideIndex === 1) {
      const group = new THREE.Group()

      const solidCube = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 1.8, 1.8),
        new THREE.MeshStandardMaterial({
          color: BRAND_SECONDARY,
          emissive: BRAND_PRIMARY,
          emissiveIntensity: 0.5,
          metalness: 0.8,
          roughness: 0.2,
        })
      )
      group.add(solidCube)

      const wireCube = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 2.4, 2.4),
        new THREE.MeshBasicMaterial({ color: BRAND_ACCENT, wireframe: true })
      )
      group.add(wireCube)

      // Inner orbit ring r=3.0
      const ring1 = new THREE.Mesh(
        new THREE.TorusGeometry(3.0, 0.04, 16, 100),
        new THREE.MeshBasicMaterial({ color: BRAND_ACCENT })
      )
      ring1.rotation.x = Math.PI / 4
      group.add(ring1)

      // Outer orbit ring r=3.5
      const ring2 = new THREE.Mesh(
        new THREE.TorusGeometry(3.5, 0.03, 16, 100),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 })
      )
      ring2.rotation.y = Math.PI / 3
      group.add(ring2)

      group.userData.animate = (t) => {
        solidCube.rotation.x = t * 0.4
        solidCube.rotation.y = t * 0.6
        wireCube.rotation.x = -t * 0.4
        wireCube.rotation.y = -t * 0.6
        ring1.rotation.z = t * 0.8
        ring2.rotation.z = -t * 0.5
      }

      scene.add(group)
      currentObjectsRef.current.push(group)
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SLIDE 2 — Supply Chain Globe (the "reference" visual size)
    // Standard envelope: globe r=2.0, cargo r=2.8–3.2
    // ─────────────────────────────────────────────────────────────────────────
    else if (activeSlideIndex === 2) {
      const group = new THREE.Group()

      const globe = new THREE.Mesh(
        new THREE.SphereGeometry(2.0, 24, 24),
        new THREE.MeshStandardMaterial({
          color: BRAND_PRIMARY,
          emissive: BRAND_ACCENT_DIM,
          emissiveIntensity: 0.65,
          wireframe: true,
        })
      )
      group.add(globe)

      const cargoCount = 12
      const cargos = []
      for (let i = 0; i < cargoCount; i++) {
        const cargo = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.2, 0),
          new THREE.MeshStandardMaterial({
            color: BRAND_ACCENT,
            emissive: BRAND_ACCENT,
            emissiveIntensity: 0.9,
          })
        )
        group.add(cargo)
        cargos.push({
          mesh: cargo,
          axis: new THREE.Vector3(Math.sin(i), Math.cos(i), Math.sin(i * 2)).normalize(),
          speed: 0.75 + i * 0.08,
          radius: 2.8 + (i % 2) * 0.4,   // max 3.2
        })
      }

      group.userData.animate = (t) => {
        globe.rotation.y = t * 0.35
        cargos.forEach((c) => {
          const a = t * c.speed
          c.mesh.position.set(
            Math.cos(a) * c.radius * c.axis.x,
            Math.sin(a) * c.radius * c.axis.y,
            Math.cos(a) * c.radius * c.axis.z
          )
          c.mesh.rotation.x = t * 2
          c.mesh.rotation.y = t * 2
        })
      }

      scene.add(group)
      currentObjectsRef.current.push(group)
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SLIDE 3 — CRM Client Intelligence Prism
    // Standard envelope: cone r=1.6 h=2.8, particles spread ±4 units (r≈3.46)
    // ─────────────────────────────────────────────────────────────────────────
    else if (activeSlideIndex === 3) {
      const group = new THREE.Group()

      const prismMat = new THREE.MeshStandardMaterial({
        color: BRAND_ACCENT,
        emissive: BRAND_SECONDARY,
        emissiveIntensity: 0.7,
        metalness: 0.9,
        roughness: 0.1,
      })

      // Bottom cone
      const prism = new THREE.Mesh(new THREE.ConeGeometry(1.6, 2.8, 5), prismMat)
      group.add(prism)

      // Inverted top cone
      const prismTop = new THREE.Mesh(new THREE.ConeGeometry(1.6, 1.6, 5), prismMat)
      prismTop.rotation.x = Math.PI
      prismTop.position.y = 2.2
      group.add(prismTop)

      // Particle cloud — confined to ±4 units (diagonal ≈ 3.46 on each axis)
      const count = 320
      const pGeo = new THREE.BufferGeometry()
      const pos = new Float32Array(count * 3)
      for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * 8
      pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      const particles = new THREE.Points(
        pGeo,
        new THREE.PointsMaterial({
          size: 0.07,
          color: BRAND_ACCENT,
          transparent: true,
          opacity: 0.75,
        })
      )
      group.add(particles)

      group.userData.animate = (t) => {
        prism.rotation.y = t * 0.7
        prismTop.rotation.y = -t * 0.7
        particles.rotation.y = t * 0.2
        // Gentle breathing pulse on the prism
        const pulse = 1 + Math.sin(t * 1.5) * 0.04
        prism.scale.setScalar(pulse)
        prismTop.scale.setScalar(pulse)
      }

      scene.add(group)
      currentObjectsRef.current.push(group)
    }
  }, [activeSlideIndex])

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  )
}
