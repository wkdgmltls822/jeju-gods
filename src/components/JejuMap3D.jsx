import { useMemo, useRef, useState } from 'react'
import { AdditiveBlending, Color, Float32BufferAttribute, PlaneGeometry } from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, Line, OrbitControls, Sparkles, Stars } from '@react-three/drei'
import { GODS, EDGES, GOD_COLORS, godById } from '../data/gods'
import { COAST_XZ, PINS, heightAt, toXZ } from '../lib/jeju'
import { MilkyWay, Nebulae, SkyDome } from './StarMap3D'
import { glowTexture } from '../lib/glow'

// 별자리(2D 좌표 800×520)를 제주섬 위 하늘로 옮긴다. 별 높이는 신마다 조금씩 다르게.
const SKY_Y = 3.4
const LIFT = { seolmundae: 0.5, cheonjiwang: 0.2, daebyeol: -0.1, samseong: 0.3, baekjuddo: 0, yeongdeung: -0.2, jacheongbi: 0.4, munjeon: -0.3, jowang: 0.1, chilseong: -0.2 }
const starPos = (g) => [(g.x - 400) * 0.0215, SKY_Y + (LIFT[g.id] ?? 0), (g.y - 260) * 0.02]
const pinPos = (p) => { const [x, z] = toXZ(p.pos); return [x, Math.max(heightAt(x, z), 0) + 0.02, z] }

// 지형 색: 해변 모래 → 숲 → 바위 → 한라산 정상
const STOPS = [[-0.5, '#08233f'], [0, '#0b3558'], [0.03, '#c3b27c'], [0.09, '#3d9a6c'], [0.3, '#2f7a57'], [0.55, '#6f7a68'], [0.8, '#a9a39c'], [0.95, '#eef6ff']].map(([h, c]) => [h, new Color(c)])
function colorAt(h, out) {
  if (h <= STOPS[0][0]) return out.copy(STOPS[0][1])
  for (let i = 1; i < STOPS.length; i++) {
    if (h <= STOPS[i][0]) return out.copy(STOPS[i - 1][1]).lerp(STOPS[i][1], (h - STOPS[i - 1][0]) / (STOPS[i][0] - STOPS[i - 1][0]))
  }
  return out.copy(STOPS[STOPS.length - 1][1])
}

function Island() {
  const geo = useMemo(() => {
    const g = new PlaneGeometry(14, 7.8, 200, 110)
    g.rotateX(-Math.PI / 2)
    const p = g.attributes.position
    const col = new Float32Array(p.count * 3)
    const c = new Color()
    for (let i = 0; i < p.count; i++) {
      const h = heightAt(p.getX(i), p.getZ(i))
      p.setY(i, h)
      colorAt(h, c)
      col.set([c.r, c.g, c.b], i * 3)
    }
    g.setAttribute('color', new Float32BufferAttribute(col, 3))
    g.computeVertexNormals()
    return g
  }, [])
  const ring = useMemo(() => [...COAST_XZ, COAST_XZ[0]].map(([x, z]) => [x, 0.025, z]), [])
  const outer = useMemo(() => [...COAST_XZ, COAST_XZ[0]].map(([x, z]) => [x * 1.05, 0.02, z * 1.1]), [])
  return (
    <group>
      <mesh geometry={geo}><meshStandardMaterial vertexColors roughness={1} /></mesh>
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[90, 90]} />
        <meshStandardMaterial color="#0a4a7c" transparent opacity={0.86} roughness={0.25} metalness={0.25} />
      </mesh>
      <Line points={ring} color="#d8f1ff" lineWidth={2} transparent opacity={0.85} />
      <Line points={outer} color="#7dd3fc" lineWidth={1} transparent opacity={0.35} dashed dashSize={0.2} gapSize={0.15} />
    </group>
  )
}

// 하늘의 별: 제주섬 위에 떠서 신들의 별자리를 이룬다
function SkyStar({ god, selected, today, onSelect }) {
  const core = useRef(), halo = useRef(), ring = useRef()
  const [hover, setHover] = useState(false)
  const color = GOD_COLORS[god.id]
  const base = selected ? 0.26 : 0.17
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime + god.x * 0.01
    const k = base * (hover ? 1.35 : 1) * (1 + Math.sin(t * 2) * 0.06)
    core.current.scale.lerp({ x: k, y: k, z: k }, Math.min(1, dt * 8))
    halo.current.scale.setScalar(k * (7 + Math.sin(t * 1.6)))
    if (ring.current) ring.current.rotation.z += dt * 0.8
  })
  return (
    <group position={starPos(god)}>
      <sprite ref={halo}><spriteMaterial map={glowTexture} color={color} transparent opacity={selected ? 0.95 : 0.7} depthWrite={false} blending={AdditiveBlending} fog={false} /></sprite>
      <mesh ref={core}><sphereGeometry args={[1, 24, 24]} /><meshBasicMaterial color={selected ? '#ffffff' : color} /></mesh>
      <mesh onClick={(e) => { e.stopPropagation(); onSelect(god.id) }}
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setHover(false); document.body.style.cursor = '' }}>
        <sphereGeometry args={[0.5, 12, 12]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {today && <mesh ref={ring} rotation={[Math.PI / 2.4, 0, 0]}><torusGeometry args={[0.55, 0.012, 8, 64]} /><meshBasicMaterial color="#7dd3fc" /></mesh>}
      <Html center distanceFactor={10} position={[0, 0.5, 0]} pointerEvents="none">
        <span className={`star3d-label ${selected ? 'on' : ''}`}>{god.name}</span>
      </Html>
    </group>
  )
}

// 땅 위의 핀: 신과 이어진 실제 장소
function PlacePin({ pin, selected, onSelect }) {
  const beam = useRef()
  const color = GOD_COLORS[pin.god]
  const p = pinPos(pin)
  useFrame(({ clock }) => { if (beam.current) beam.current.material.opacity = (selected ? 0.55 : 0.25) + Math.sin(clock.elapsedTime * 2) * 0.08 })
  return (
    <group position={p}>
      <mesh ref={beam} position={[0, 0.5, 0]}><cylinderGeometry args={[0.02, 0.06, 1, 8, 1, true]} /><meshBasicMaterial color={color} transparent opacity={0.3} depthWrite={false} blending={AdditiveBlending} /></mesh>
      <mesh position={[0, 0.05, 0]}><sphereGeometry args={[selected ? 0.1 : 0.07, 16, 16]} /><meshBasicMaterial color={selected ? '#fff' : color} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}><ringGeometry args={[0.12, 0.15, 32]} /><meshBasicMaterial color={color} transparent opacity={selected ? 0.9 : 0.5} side={2} /></mesh>
      <mesh onClick={(e) => { e.stopPropagation(); onSelect(pin.god) }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { document.body.style.cursor = '' }}>
        <sphereGeometry args={[0.28, 12, 12]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {selected && (
        <Html center distanceFactor={10} position={[0, -0.22, 0]} pointerEvents="none">
          <span className="pin3d-label"><i className="bi bi-geo-alt-fill" /> {pin.place}</span>
        </Html>
      )}
    </group>
  )
}

function Sky({ selectedId, todayId, onSelect }) {
  const lines = useMemo(() => EDGES.map(([a, b]) => ({ key: a + b, a, b, pts: [starPos(godById(a)), starPos(godById(b))] })), [])
  const threads = useMemo(() => PINS.map((pin) => ({ pin, pts: [starPos(godById(pin.god)), pinPos(pin)] })), [])
  return (
    <>
      {lines.map((l) => {
        const lit = selectedId === l.a || selectedId === l.b
        return <Line key={l.key} points={l.pts} color={lit ? '#7dd3fc' : '#8fb4ff'} lineWidth={lit ? 2 : 1} transparent opacity={lit ? 0.95 : 0.4} />
      })}
      {threads.map(({ pin, pts }) => {
        const on = pin.god === selectedId
        return <Line key={pin.god} points={pts} color={GOD_COLORS[pin.god]} lineWidth={on ? 2.4 : 1} transparent opacity={on ? 0.95 : 0.28} dashed={!on} dashSize={0.18} gapSize={0.12} />
      })}
      {GODS.map((g) => <SkyStar key={g.id} god={g} selected={g.id === selectedId} today={g.id === todayId} onSelect={onSelect} />)}
      {PINS.map((pin) => <PlacePin key={pin.god} pin={pin} selected={pin.god === selectedId} onSelect={onSelect} />)}
    </>
  )
}

// 3D 제주 지도: 한라산이 솟은 제주섬 위로 신들의 별자리가 떠 있고, 각 별에서 이어진 실제 장소로 빛줄기가 내려온다
export default function JejuMap3D({ selectedId, todayId, onSelect }) {
  return (
    <div className="starmap3d jejumap3d" role="group" aria-label="제주 3D 지도와 신들의 별자리">
      <Canvas camera={{ position: [0, 5.6, 9.2], fov: 48 }} dpr={[1, 2]}>
        <SkyDome />
        <Nebulae />
        <MilkyWay />
        <Stars radius={50} depth={40} count={1400} factor={3.2} saturation={0.5} fade speed={0.8} />
        <Sparkles count={60} scale={[14, 6, 8]} position={[0, 3, 0]} size={2.2} speed={0.3} color="#bfe6ff" opacity={0.7} />
        <ambientLight intensity={0.9} color="#8fb3ff" />
        <directionalLight position={[-6, 9, 5]} intensity={1.6} color="#d6e6ff" />
        <hemisphereLight args={['#9fc4ff', '#1b3a2c', 0.5]} />
        <Island />
        <Sky selectedId={selectedId} todayId={todayId} onSelect={onSelect} />
        <OrbitControls target={[0, 1.3, 0]} enablePan={false} autoRotate autoRotateSpeed={0.35} minDistance={5} maxDistance={20} maxPolarAngle={1.45} dampingFactor={0.08} />
      </Canvas>
      <div className="starmap3d-hint"><i className="bi bi-hand-index me-1" />끌어서 돌려 보고, 별이나 핀을 눌러 보세요</div>
    </div>
  )
}
