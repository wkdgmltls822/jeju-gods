import { useMemo, useRef, useState } from 'react'
import { AdditiveBlending, BackSide, CanvasTexture, Color, Vector2 } from 'three'
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

// 하늘 전체를 감싸는 그라데이션: 위는 깊은 남색, 가운데는 보랏빛, 지평선 쪽은 바다 같은 청록
function SkyDome() {
  const uniforms = useMemo(() => ({
    top: { value: new Color('#0a1340') }, mid: { value: new Color('#33208f') }, low: { value: new Color('#0f6d8f') },
  }), [])
  return (
    <mesh>
      <sphereGeometry args={[70, 32, 32]} />
      <shaderMaterial side={BackSide} depthWrite={false} uniforms={uniforms}
        vertexShader={'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }'}
        fragmentShader={'uniform vec3 top; uniform vec3 mid; uniform vec3 low; varying vec3 vP; void main(){ float h = vP.y; vec3 c = h > 0.0 ? mix(mid, top, smoothstep(0.0, 0.8, h)) : mix(mid, low, smoothstep(0.0, -0.6, h)); gl_FragColor = vec4(c, 1.0); }'} />
    </mesh>
  )
}

// 멀리 떠 있는 색색의 성운 구름: 아주 천천히 흐른다
const NEBULAE = [
  { p: [-26, 10, -30], s: 46, c: '#6d4cff', o: 0.7 }, { p: [24, 14, -34], s: 52, c: '#ff6fb5', o: 0.5 },
  { p: [4, -8, -40], s: 56, c: '#22d3ee', o: 0.55 }, { p: [-34, -6, -14], s: 40, c: '#3b82f6', o: 0.65 },
  { p: [34, -2, -18], s: 42, c: '#a78bfa', o: 0.6 },
]
function Nebulae() {
  const g = useRef()
  useFrame((_, dt) => { g.current.rotation.y += dt * 0.01 })
  return (
    <group ref={g}>
      {NEBULAE.map((n, i) => (
        <sprite key={i} position={n.p} scale={[n.s, n.s, 1]}>
          <spriteMaterial map={glowTexture} color={n.c} transparent opacity={n.o} depthWrite={false} blending={AdditiveBlending} fog={false} />
        </sprite>
      ))}
    </group>
  )
}

// 은하수: 하늘을 비스듬히 가로지르는 별가루 띠
function MilkyWay() {
  const { pos, col } = useMemo(() => {
    let seed = 99
    const rand = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296 }
    const n = 4200, pos = new Float32Array(n * 3), col = new Float32Array(n * 3)
    const palette = [new Color('#bfe6ff'), new Color('#c4b5fd'), new Color('#f9a8d4'), new Color('#fde68a')]
    for (let i = 0; i < n; i++) {
      const th = rand() * Math.PI * 2
      const ph = (rand() + rand() + rand() - 1.5) * 0.28 // 띠 한가운데에 빽빽하게
      const R = 55 + rand() * 6
      pos.set([R * Math.cos(th) * Math.cos(ph), R * Math.sin(ph), R * Math.sin(th) * Math.cos(ph)], i * 3)
      const c = palette[Math.floor(rand() * palette.length)].clone().multiplyScalar(0.5 + rand() * 0.5)
      col.set([c.r, c.g, c.b], i * 3)
    }
    return { pos, col }
  }, [])
  return (
    <points rotation={[0.55, 0, 0.5]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pos, 3]} />
        <bufferAttribute attach="attributes-color" args={[col, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.38} vertexColors transparent opacity={0.85} depthWrite={false} blending={AdditiveBlending} sizeAttenuation fog={false} />
    </points>
  )
}

// 별자리 아래 제주섬: 빛나는 한라산 뼈대와 사방으로 퍼지는 바다 물결
const HALLA = [[0, 1.5], [0.25, 1.42], [0.7, 1.05], [1.4, 0.66], [2.4, 0.34], [3.5, 0.12], [4.6, 0]].map(([r, y]) => new Vector2(r, y))
function Island() {
  const ripples = useRef([])
  useFrame(({ clock }) => {
    ripples.current.forEach((m, i) => {
      if (!m) return
      const k = ((clock.elapsedTime * 0.18 + i / 4) % 1)
      m.scale.setScalar(0.5 + k * 2.4)
      m.material.opacity = (1 - k) * 0.5
    })
  })
  return (
    <group position={[0, -5.4, 0]}>
      <mesh>
        <latheGeometry args={[HALLA, 28]} />
        <meshBasicMaterial color="#06142a" />
      </mesh>
      <mesh scale={1.003}>
        <latheGeometry args={[HALLA, 28]} />
        <meshBasicMaterial color="#5eead4" wireframe transparent opacity={0.28} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} ref={(m) => { ripples.current[i] = m }} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
          <ringGeometry args={[4.3, 4.38, 96]} />
          <meshBasicMaterial color="#7dd3fc" transparent opacity={0.4} depthWrite={false} side={2} />
        </mesh>
      ))}
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
      <Canvas camera={{ position: [0, 1.2, 12.5], fov: 50 }} dpr={[1, 2]} onPointerMissed={() => { document.body.style.cursor = '' }}>
        <SkyDome />
        <Nebulae />
        <MilkyWay />
        <Island />
        <Stars radius={50} depth={40} count={1800} factor={3.2} saturation={0.5} fade speed={0.8} />
        <Sparkles count={70} scale={[14, 9, 7]} size={2.4} speed={0.35} color="#bfe6ff" opacity={0.7} />
        <Constellation selectedId={selectedId} todayId={todayId} onSelect={onSelect} />
        <OrbitControls target={[0, -0.6, 0]} enablePan={false} autoRotate autoRotateSpeed={0.7} minDistance={6} maxDistance={18} dampingFactor={0.08} />
      </Canvas>
      <div className="starmap3d-hint"><i className="bi bi-hand-index me-1" />끌어서 돌려 보고, 별을 눌러 보세요</div>
    </div>
  )
}
