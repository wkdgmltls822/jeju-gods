import { useEffect, useMemo, useRef, useState } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { AdditiveBlending, CanvasTexture, Color, DoubleSide, SRGBColorSpace } from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sparkles, Stars } from '@react-three/drei'
import { GODS, GOD_COLORS } from '../data/gods'
import GodArt from './GodArt'

// 신 카드 짝맞추기 3D 장면: 별빛 탁자 위에 입체 카드 16장이 놓여 있고, 누르면 떠올라 뒤집힌다.
const CW = 1.5, CH = 2.0 // 카드 크기
const GAP_X = 1.78, GAP_Z = 2.5
const TILT = 0.3 // 카드를 세우되 위쪽을 살짝 뒤로 눕혀서 뒷줄 카드도 보이게
const TEX_W = 512, TEX_H = 683

const roundRect = (ctx, x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r) }

// 카드 뒷면: 밤하늘 보라색 바탕에 초승달과 별
function makeBackFinal() {
  const bg = document.createElement('canvas'); bg.width = TEX_W; bg.height = TEX_H
  const bctx = bg.getContext('2d')
  const g = bctx.createRadialGradient(TEX_W * 0.3, TEX_H * 0.2, 20, TEX_W / 2, TEX_H / 2, TEX_H * 0.8)
  g.addColorStop(0, '#4f46e5'); g.addColorStop(0.55, '#231f6b'); g.addColorStop(1, '#0b1340')
  bctx.fillStyle = g; bctx.fillRect(0, 0, TEX_W, TEX_H)
  for (let i = 0; i < 46; i++) { bctx.fillStyle = `rgba(255,255,255,${0.2 + Math.random() * 0.6})`; bctx.beginPath(); bctx.arc(50 + Math.random() * (TEX_W - 100), 50 + Math.random() * (TEX_H - 100), 1 + Math.random() * 2.4, 0, 7); bctx.fill() }
  bctx.strokeStyle = 'rgba(199,210,254,.6)'; bctx.lineWidth = 6; roundRect(bctx, 22, 22, TEX_W - 44, TEX_H - 44, 36); bctx.stroke()
  bctx.strokeStyle = 'rgba(199,210,254,.25)'; bctx.lineWidth = 2; roundRect(bctx, 40, 40, TEX_W - 80, TEX_H - 80, 28); bctx.stroke()
  // 초승달: 큰 원에서 작은 원을 뺀 모양
  const moon = document.createElement('canvas'); moon.width = TEX_W; moon.height = TEX_H
  const m = moon.getContext('2d')
  m.fillStyle = '#ffd166'; m.beginPath(); m.arc(TEX_W / 2 - 14, TEX_H / 2, 112, 0, Math.PI * 2); m.fill()
  m.globalCompositeOperation = 'destination-out'; m.beginPath(); m.arc(TEX_W / 2 + 40, TEX_H / 2 - 28, 98, 0, Math.PI * 2); m.fill()
  bctx.shadowColor = '#ffd166'; bctx.shadowBlur = 36; bctx.drawImage(moon, 0, 0); bctx.shadowBlur = 0
  // 큰 별
  bctx.fillStyle = '#fff'; bctx.shadowColor = '#fff'; bctx.shadowBlur = 20
  const sx = TEX_W / 2 + 110, sy = TEX_H / 2 + 40, R = 34
  bctx.beginPath()
  for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4 - Math.PI / 2, r = i % 2 ? R * 0.28 : R; bctx.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r) }
  bctx.fill(); bctx.shadowBlur = 0
  const t = new CanvasTexture(bg); t.colorSpace = SRGBColorSpace; t.anisotropy = 8
  return t
}

// 신 그림(SVG)을 이미지로 바꾼다 (카드 앞면에 입히려고)
async function artImage(id) {
  const svg = renderToStaticMarkup(<GodArt id={id} />).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" ')
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }))
  const img = new Image()
  img.src = url
  try { await img.decode() } finally { URL.revokeObjectURL(url) }
  return img
}

const frontCache = new Map()
// 카드 앞면: 신의 대표 색 바탕, 가운데 신 그림, 아래에 이름과 한 줄 소개
function frontTexture(id) {
  if (frontCache.has(id)) return frontCache.get(id)
  const p = (async () => {
    const god = GODS.find((g) => g.id === id)
    const color = GOD_COLORS[id]
    let img = null
    try { img = await artImage(id) } catch { img = null }
    try { await document.fonts.load('700 56px "Noto Serif KR"') } catch { /* 글꼴을 못 불러오면 기본 글꼴로 */ }
    const cv = document.createElement('canvas'); cv.width = TEX_W; cv.height = TEX_H
    const ctx = cv.getContext('2d')
    // 앞면은 뒤집힌 뒤 위로 오므로, 방향을 맞추려고 180도 돌려서 그린다
    ctx.translate(TEX_W, TEX_H); ctx.rotate(Math.PI)
    const bg = ctx.createLinearGradient(0, 0, 0, TEX_H)
    bg.addColorStop(0, new Color(color).lerp(new Color('#0b1b2e'), 0.62).getStyle()); bg.addColorStop(1, '#0b1b2e')
    ctx.fillStyle = bg; ctx.fillRect(0, 0, TEX_W, TEX_H)
    ctx.strokeStyle = color; ctx.lineWidth = 8; roundRect(ctx, 14, 14, TEX_W - 28, TEX_H - 28, 40); ctx.stroke()
    // 그림 (정사각형으로 가운데를 오려 둥근 모서리 안에)
    const ax = 36, ay = 36, as = TEX_W - 72
    ctx.save(); roundRect(ctx, ax, ay, as, as, 28); ctx.clip()
    if (img) ctx.drawImage(img, 200, 0, 400, 400, ax, ay, as, as)
    else { ctx.fillStyle = color; ctx.globalAlpha = 0.35; ctx.fillRect(ax, ay, as, as); ctx.globalAlpha = 1 }
    ctx.restore()
    ctx.strokeStyle = color + 'aa'; ctx.lineWidth = 3; roundRect(ctx, ax, ay, as, as, 28); ctx.stroke()
    ctx.textAlign = 'center'; ctx.fillStyle = '#ffffff'; ctx.shadowColor = color; ctx.shadowBlur = 14
    ctx.font = '700 54px "Noto Serif KR", serif'
    ctx.fillText(god.name.replace(/\(.*\)/, ''), TEX_W / 2, ay + as + 76)
    ctx.shadowBlur = 0; ctx.fillStyle = '#c9d8ee'; ctx.font = '500 26px "Noto Sans KR", sans-serif'
    ctx.fillText(god.role.length > 15 ? god.role.slice(0, 14) + '…' : god.role, TEX_W / 2, ay + as + 124)
    const t = new CanvasTexture(cv); t.colorSpace = SRGBColorSpace; t.anisotropy = 8
    return t
  })()
  frontCache.set(id, p)
  return p
}

// 별빛 탁자: 짙은 남색 바탕에 별자리 무늬
function makeTable() {
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 1024
  const ctx = cv.getContext('2d')
  const g = ctx.createRadialGradient(512, 512, 40, 512, 512, 512)
  g.addColorStop(0, '#16306a'); g.addColorStop(0.6, '#0d1f4d'); g.addColorStop(1, '#070f2e')
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1024, 1024)
  ctx.strokeStyle = 'rgba(125,211,252,.14)'; ctx.lineWidth = 2
  for (const r of [140, 260, 380, 480]) { ctx.beginPath(); ctx.arc(512, 512, r, 0, 7); ctx.stroke() }
  for (let i = 0; i < 120; i++) { ctx.fillStyle = `rgba(190,225,255,${0.15 + Math.random() * 0.5})`; ctx.beginPath(); ctx.arc(Math.random() * 1024, Math.random() * 1024, 1 + Math.random() * 2.4, 0, 7); ctx.fill() }
  const t = new CanvasTexture(cv); t.colorSpace = SRGBColorSpace
  return t
}

function Card({ card, index, open, matched, back, onFlip }) {
  const grp = useRef(), ring = useRef()
  const p = useRef(0)
  const hover = useRef(false)
  const [front, setFront] = useState(null)
  const geo = useMemo(() => new RoundedBoxGeometry(CW, CH, 0.07, 2, 0.05), [])
  // (front 이미지는 나중에 로드되므로, 로드되면 재질을 새로 만들어 이미지가 반영되게 key 를 바꾼다)
  const x = ((index % 4) - 1.5) * GAP_X
  const z = (Math.floor(index / 4) - 1.5) * GAP_Z
  const color = GOD_COLORS[card.id]

  useEffect(() => { let alive = true; frontTexture(card.id).then((t) => alive && setFront(t)); return () => { alive = false } }, [card.id])

  useFrame(({ clock }, dt) => {
    const target = open ? 1 : 0
    p.current += (target - p.current) * Math.min(1, dt * 9)
    const k = p.current
    const lift = Math.sin(Math.min(1, Math.max(0, k)) * Math.PI) * 1.25 + (hover.current && !open ? 0.3 : 0) + (matched ? Math.sin(clock.elapsedTime * 2 + index) * 0.05 + 0.12 : 0)
    grp.current.position.set(x, (CH / 2) * Math.cos(TILT) + 0.06 + lift, z)
    grp.current.rotation.set(-TILT, k * Math.PI, 0) // 세워 둔 채 세로축을 중심으로 뒤집힌다
    if (ring.current) ring.current.material.opacity = matched ? 0.32 + Math.sin(clock.elapsedTime * 3 + index) * 0.12 : 0
  })

  return (
    <group>
      <group ref={grp}
        onClick={(e) => { e.stopPropagation(); onFlip(card) }}
        onPointerOver={(e) => { e.stopPropagation(); hover.current = true; document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { hover.current = false; document.body.style.cursor = '' }}>
        <mesh geometry={geo}>
          <meshStandardMaterial color="#0e1a44" roughness={0.5} metalness={0.3} emissive={color} emissiveIntensity={matched ? 0.5 : 0.05} />
        </mesh>
        <mesh position={[0, 0, 0.037]}>
          <planeGeometry args={[CW - 0.06, CH - 0.06]} />
          <meshStandardMaterial map={back} roughness={0.45} metalness={0.1} />
        </mesh>
        <mesh position={[0, 0, -0.037]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[CW - 0.06, CH - 0.06]} />
          <meshStandardMaterial key={front ? "loaded" : "empty"} map={front} color={front ? '#ffffff' : '#1b2a55'} roughness={0.4} metalness={0.1} emissive="#ffffff" emissiveMap={front} emissiveIntensity={0.18} />
        </mesh>
      </group>
      {/* 짝을 맞춘 카드 밑의 빛 */}
      <mesh ref={ring} position={[x, 0.03, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[CW + 0.4, 0.9]} />
        <meshBasicMaterial color={color} transparent opacity={0} blending={AdditiveBlending} depthWrite={false} side={DoubleSide} />
      </mesh>
    </group>
  )
}

function Table() {
  const tex = useMemo(() => makeTable(), [])
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <circleGeometry args={[8.4, 96]} />
        <meshStandardMaterial map={tex} roughness={0.55} metalness={0.35} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <ringGeometry args={[8.4, 8.75, 96]} />
        <meshBasicMaterial color="#7dd3fc" transparent opacity={0.8} />
      </mesh>
    </group>
  )
}

// 카메라는 테이블 중앙 위에 고정한다 (마우스를 따라 움직이면 화면이 흔들려 보인다)
function Rig() {
  useFrame(({ camera, size }) => {
    // 세로로 긴 휴대폰 화면에서도 4열이 다 보이도록 화면 비율에 맞춰 거리를 늘린다
    const d = Math.max(12.5, 11.5 / (size.width / size.height))
    camera.position.set(0, 0.8 + d * 0.62, d * 0.78)
    camera.lookAt(0, 0.8, 0)
  })
  return null
}

export default function CardScene3D({ deck, flipped, matched, onFlip }) {
  const back = useMemo(() => makeBackFinal(), [])
  return (
    <Canvas camera={{ position: [0, 8.5, 9.8], fov: 38 }} dpr={[1.5, 2]} gl={{ antialias: true }}>
      <color attach="background" args={['#060d28']} />
      <fog attach="fog" args={['#060d28', 26, 60]} />
      <ambientLight intensity={0.75} color="#a9bdff" />
      <directionalLight position={[-5, 14, 7]} intensity={1.6} color="#ffffff" />
      <pointLight position={[0, 5, 0]} intensity={26} distance={20} color="#8fb4ff" />
      <Stars radius={60} depth={30} count={900} factor={4} saturation={0.5} fade speed={0.5} />
      <Sparkles count={50} scale={[14, 5, 12]} position={[0, 2.5, 0]} size={3} speed={0.35} color="#bfe6ff" opacity={0.7} />
      <Table />
      {deck.map((c, i) => (
        <Card key={c.uid} card={c} index={i} back={back}
          open={flipped.includes(c.uid) || matched.includes(c.id)} matched={matched.includes(c.id)} onFlip={onFlip} />
      ))}
      <Rig />
    </Canvas>
  )
}
