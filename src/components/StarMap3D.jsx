import { useMemo, useRef, useState } from 'react'
import { AdditiveBlending, CanvasTexture } from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, Line, OrbitControls, Sparkles, Stars } from '@react-three/drei'
import { GODS, EDGES, GOD_COLORS, godById } from '../data/gods'

// 2D 지도(800×520)의 위치를 3D 로 옮긴다. 높이(z)는 별마다 달리해서 돌려 볼 때 입체감이 난다.
const DEPTH = { seolmundae: 0, cheonjiwang: -1.6, daebyeol: 1.4, samseong: -1.0, baekjuddo: 1.6, yeongdeung: -1.4, jacheongbi: 0.8, munjeon: -0.6, jowang: 1.2, chilseong: -1.8 }
const pos = (g) => [(g.x - 400) / 62, -(g.y - 260) / 62, DEPTH[g.id] ?? 0]

// 부드럽게 번지는 빛 한 장 (가운데는 밝고 가장자리로 갈수록 투명해지는 동그라미)
const glowTexture = (() => {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.25, 'rgba(255,255,255,0.45)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 128, 128)
  return new CanvasTexture(c)
})()

function GodStar({ god, selected, today, onSelect }) {
  const core = useRef()
  const halo = useRef()
  const ring = useRef()
  const [hover, setHover] = useState(false)
  const color = GOD_COLORS[god.id]
  const base = selected ? 0.3 : 0.2

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime + god.x * 0.01
    const k = base * (hover ? 1.35 : 1) * (1 + Math.sin(t * 2) * 0.06)
    core.current.scale.lerp({ x: k, y: k, z: k }, Math.min(1, dt * 8))
    halo.current.scale.setScalar(k * (7 + Math.sin(t * 1.6) * 1))
    if (ring.current) ring.current.rotation.z += dt * 0.8
  })

  return (
    <group position={pos(god)}>
      <sprite ref={halo}>
        <spriteMaterial map={glowTexture} color={color} transparent opacity={selected ? 0.95 : 0.7} depthWrite={false} blending={AdditiveBlending} />
      </sprite>
      <mesh ref={core}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color={selected ? '#ffffff' : color} />
      </mesh>
      {/* 눈에 안 보이는 큰 공: 작은 별도 쉽게 누를 수 있게 */}
      <mesh
        onClick={(e) => { e.stopPropagation(); onSelect(god.id) }}
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setHover(false); document.body.style.cursor = '' }}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {today && (
        <mesh ref={ring} rotation={[Math.PI / 2.4, 0, 0]}>
          <torusGeometry args={[0.62, 0.012, 8, 64]} />
          <meshBasicMaterial color="#7dd3fc" />
        </mesh>
      )}
      <Html center distanceFactor={9} position={[0, -0.62, 0]} pointerEvents="none">
        <span className={`star3d-label ${selected ? 'on' : ''}`}>{god.name}</span>
      </Html>
    </group>
  )
}

function Constellation({ selectedId, todayId, onSelect }) {
  const lines = useMemo(() => EDGES.map(([a, b]) => ({ key: a + b, a, b, pts: [pos(godById(a)), pos(godById(b))] })), [])
  return (
    <>
      {lines.map((l) => {
        const lit = selectedId === l.a || selectedId === l.b
        return <Line key={l.key} points={l.pts} color={lit ? '#7dd3fc' : '#60a5fa'} lineWidth={lit ? 2 : 1} transparent opacity={lit ? 0.95 : 0.35} />
      })}
      {GODS.map((g) => (
        <GodStar key={g.id} god={g} selected={g.id === selectedId} today={g.id === todayId} onSelect={onSelect} />
      ))}
    </>
  )
}

// 신들의 별자리를 3D 로: 끌어서 돌리고, 휠로 확대하고, 별을 누르면 신이 열린다
export default function StarMap3D({ selectedId, todayId, onSelect }) {
  return (
    <div className="starmap3d" role="group" aria-label="제주 신들의 3D 별자리 지도">
      <Canvas camera={{ position: [0, 0.5, 11.5], fov: 50 }} dpr={[1, 2]} onPointerMissed={() => { document.body.style.cursor = '' }}>
        <color attach="background" args={['#06101c']} />
        <fog attach="fog" args={['#06101c', 14, 42]} />
        <Stars radius={50} depth={40} count={2600} factor={3.2} saturation={0.4} fade speed={0.8} />
        <Sparkles count={70} scale={[14, 9, 7]} size={2.4} speed={0.35} color="#bfe6ff" opacity={0.7} />
        <Constellation selectedId={selectedId} todayId={todayId} onSelect={onSelect} />
        <OrbitControls enablePan={false} autoRotate autoRotateSpeed={0.7} minDistance={6} maxDistance={18} dampingFactor={0.08} />
      </Canvas>
      <div className="starmap3d-hint"><i className="bi bi-hand-index me-1" />끌어서 돌려 보고, 별을 눌러 보세요</div>
    </div>
  )
}
