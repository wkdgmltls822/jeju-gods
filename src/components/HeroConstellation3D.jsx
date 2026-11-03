import { useEffect, useMemo, useRef } from 'react'
import { AdditiveBlending, CanvasTexture, Color } from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Line, Sparkles, Stars } from '@react-three/drei'
import { GODS, EDGES, GOD_COLORS } from '../data/gods'
import { glowTexture } from '../lib/glow'

// 홈 히어로 뒤에 떠 있는 3D 별자리: 신 10명이 깊이가 다른 별로 떠 있고, 선이 차례로 그려지며,
// 빛알갱이가 선을 따라 흐른다. 마우스를 움직이면 별자리 전체가 기울어져서 입체감이 느껴진다.
// 별자리 지도(800×520)의 좌표를 3D 공간으로 옮기고, 별마다 앞뒤 깊이를 다르게 준다.
// 네 갈래로 뻗는 별빛(십자 반짝임) 무늬
const flare = (() => {
  const cv = document.createElement('canvas'); cv.width = cv.height = 128
  const c = cv.getContext('2d')
  const g = c.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.12, 'rgba(255,255,255,.75)'); g.addColorStop(0.35, 'rgba(255,255,255,.12)'); g.addColorStop(1, 'rgba(255,255,255,0)')
  c.fillStyle = g; c.fillRect(0, 0, 128, 128)
  for (const [w, h] of [[120, 3], [3, 120]]) {
    const l = c.createLinearGradient(64 - w / 2, 64 - h / 2, 64 + w / 2, 64 + h / 2)
    l.addColorStop(0, 'rgba(255,255,255,0)'); l.addColorStop(0.5, 'rgba(255,255,255,.95)'); l.addColorStop(1, 'rgba(255,255,255,0)')
    c.fillStyle = l; c.fillRect(64 - w / 2, 64 - h / 2, w, h)
  }
  return new CanvasTexture(cv)
})()
const POS = Object.fromEntries(GODS.map((g, i) => [g.id, [(g.x - 400) / 36, -(g.y - 250) / 36, Math.sin(i * 2.3) * 3.4]]))

function Star({ god, index }) {
  const halo = useRef(), core = useRef(), cross = useRef()
  const color = GOD_COLORS[god.id]
  const near = (POS[god.id][2] + 3.4) / 6.8 // 0: 가장 뒤, 1: 가장 앞
  const small = useThree((st) => st.size.width < 600) ? 0.6 : 1 // 휴대폰에서는 글씨를 가리지 않게 별을 작게
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const on = Math.min(1, Math.max(0, (t - (0.4 + index * 0.18)) / 0.7)) // 하나씩 켜진다
    const pulse = 1 + Math.sin(t * 1.6 + index) * 0.12
    halo.current.scale.setScalar((2.1 + Math.sin(t * 1.3 + index * 1.7) * 0.35) * (0.8 + near * 0.45) * on * pulse * small)
    core.current.scale.setScalar(on * (0.8 + near * 0.4) * small)
    cross.current.scale.setScalar((1.9 + near * 1.3) * on * (1 + Math.sin(t * 2.1 + index) * 0.08) * small)
    cross.current.material.rotation = Math.sin(t * 0.4 + index) * 0.12
  })
  return (
    <group position={POS[god.id]}>
      <sprite ref={halo}><spriteMaterial map={glowTexture} color={color} transparent opacity={0.55 + near * 0.35} depthWrite={false} blending={AdditiveBlending} /></sprite>
      <sprite ref={cross}><spriteMaterial map={flare} color="#ffffff" transparent opacity={0.5 + near * 0.45} depthWrite={false} blending={AdditiveBlending} /></sprite>
      <mesh ref={core}>
        <sphereGeometry args={[0.2, 20, 20]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh scale={0.34}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.55} depthWrite={false} blending={AdditiveBlending} />
      </mesh>
    </group>
  )
}

function Edge({ a, b, index }) {
  const line = useRef(), dot = useRef()
  const pa = POS[a], pb = POS[b]
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const draw = Math.min(1, Math.max(0, (t - (0.8 + index * 0.2)) / 0.9))
    if (line.current) line.current.material.opacity = draw * 0.5
    const f = (t * 0.16 + index * 0.37) % 1
    dot.current.position.set(pa[0] + (pb[0] - pa[0]) * f, pa[1] + (pb[1] - pa[1]) * f, pa[2] + (pb[2] - pa[2]) * f)
    dot.current.material.opacity = draw * Math.sin(f * Math.PI)
  })
  return (
    <>
      <Line ref={line} points={[pa, pb]} color="#9db8ff" lineWidth={1.3} transparent opacity={0} />
      <sprite ref={dot} scale={[0.55, 0.55, 0.55]}><spriteMaterial map={glowTexture} color="#dff1ff" transparent opacity={0} depthWrite={false} blending={AdditiveBlending} /></sprite>
    </>
  )
}

// 별자리 전체가 천천히 흔들리고, 마우스를 따라 기울어진다
function Constellation() {
  const group = useRef()
  const { viewport } = useThree()
  const m = useRef({ x: 0, y: 0 })
  useEffect(() => {
    const onMove = (e) => { m.current.x = (e.clientX / window.innerWidth) * 2 - 1; m.current.y = (e.clientY / window.innerHeight) * 2 - 1 }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])
  useFrame(({ clock }, dt) => {
    const k = 1 - Math.pow(0.04, dt)
    const g = group.current
    g.rotation.y += (Math.sin(clock.elapsedTime * 0.18) * 0.3 + m.current.x * 0.38 - g.rotation.y) * k
    g.rotation.x += (-m.current.y * 0.2 - g.rotation.x) * k
    g.position.x += (m.current.x * -0.5 - g.position.x) * k
  })
  // 화면이 넓을수록 별자리를 옆으로 넓혀서 빈 곳이 덜 보이게
  const sx = Math.min(1.9, Math.max(0.85, viewport.width / 21))
  return (
    <group ref={group} scale={[sx, 1, 1]}>
      {EDGES.map(([a, b], i) => <Edge key={a + b} a={a} b={b} index={i} />)}
      {GODS.map((g, i) => <Star key={g.id} god={g} index={i} />)}
    </group>
  )
}

export default function HeroConstellation3D() {
  const c = useMemo(() => new Color('#8fb4ff'), [])
  return (
    <div className="sky-bg hero-3d" aria-hidden="true">
      <Canvas camera={{ position: [0, 0.4, 17], fov: 50 }} dpr={[1, 1.75]} gl={{ alpha: true, antialias: true }} style={{ pointerEvents: 'none' }}>
        <fog attach="fog" args={['#070e33', 14, 44]} />
        <Stars radius={46} depth={34} count={1100} factor={3.2} saturation={0.4} fade speed={0.5} />
        <Sparkles count={70} scale={[28, 14, 10]} size={2.6} speed={0.3} color={c} opacity={0.75} />
        <Constellation />
      </Canvas>
    </div>
  )
}
