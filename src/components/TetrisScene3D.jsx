import { useMemo, useRef } from 'react'
import { AdditiveBlending, Color, DoubleSide, Object3D } from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { Canvas, useFrame } from '@react-three/fiber'
import { Line, Stars } from '@react-three/drei'

// 신들의 테트리스 3D 화면. 게임 규칙(TetrisGame)이 바꾸는 상태(gref)를 매 프레임 읽어서 입체 블록으로 그린다.
export const COLS = 10, ROWS = 20
const MAX_P = 160 // 줄을 지울 때 흩어지는 조각 수

const hex = (h) => new Color(h)
const gridPts = (() => {
  const pts = []
  for (let c = 0; c <= COLS; c++) pts.push([c - 0.5, -0.5, 0], [c - 0.5, ROWS - 0.5, 0])
  for (let r = 0; r <= ROWS; r++) pts.push([-0.5, r - 0.5, 0], [COLS - 0.5, r - 0.5, 0])
  return pts
})()

function Blocks({ gref, colorOf, collide }) {
  const geo = useMemo(() => new RoundedBoxGeometry(1, 1, 1, 3, 0.16), [])
  const cells = useRef(), glow = useRef(), ghost = useRef(), light = useRef()
  const d = useMemo(() => new Object3D(), [])
  const c = useMemo(() => new Color(), [])
  const N = COLS * ROWS + 4

  useFrame(({ clock }) => {
    const s = gref.current
    if (!s) return
    const t = clock.elapsedTime
    let n = 0
    const put = (x, y, col, scale = 0.94, z = 0) => {
      d.position.set(x, y, z); d.scale.setScalar(scale); d.rotation.set(0, 0, 0); d.updateMatrix()
      cells.current.setMatrixAt(n, d.matrix); glow.current.setMatrixAt(n, d.matrix)
      c.set(col); cells.current.setColorAt(n, c); glow.current.setColorAt(n, c)
      n += 1
    }
    const flashing = s.clearing ? new Set(s.clearing.rows) : null
    s.board.forEach((row, r) => row.forEach((v, cx) => {
      if (!v) return
      if (flashing?.has(r)) {
        const k = 0.5 + 0.5 * Math.sin(performance.now() / 28)
        put(cx, ROWS - 1 - r, c.set('#ffffff').lerp(hex(colorOf(v)), 1 - k).getStyle(), 0.94 + k * 0.1)
      } else put(cx, ROWS - 1 - r, colorOf(v), 0.94)
    }))
    if (s.cur && s.status !== 'ready') {
      const { m, x, y, type } = s.cur
      m.forEach((row, r) => row.forEach((v, cc) => { if (v && y + r >= 0) put(x + cc, ROWS - 1 - (y + r), colorOf(type), 0.96) }))
      // 내려갈 자리(그림자)
      let gy = y
      while (!collide(s.board, m, x, gy + 1)) gy += 1
      let gi = 0
      m.forEach((row, r) => row.forEach((v, cc) => {
        if (!v || gy + r < 0 || gi >= 4) return
        d.position.set(x + cc, ROWS - 1 - (gy + r), 0); d.scale.setScalar(0.86); d.updateMatrix()
        ghost.current.setMatrixAt(gi, d.matrix); c.set(colorOf(type)); ghost.current.setColorAt(gi, c); gi += 1
      }))
      ghost.current.count = gi
      ghost.current.instanceMatrix.needsUpdate = true
      if (ghost.current.instanceColor) ghost.current.instanceColor.needsUpdate = true
      // 지금 조각 주변을 비추는 빛
      light.current.position.set(x + m[0].length / 2 - 0.5, ROWS - 1 - y - m.length / 2, 3)
      light.current.color.set(colorOf(type))
      light.current.intensity = 14 + Math.sin(t * 4) * 2
    } else { ghost.current.count = 0; light.current.intensity = 0 }
    cells.current.count = n; glow.current.count = n
    cells.current.instanceMatrix.needsUpdate = true; glow.current.instanceMatrix.needsUpdate = true
    if (cells.current.instanceColor) cells.current.instanceColor.needsUpdate = true
    if (glow.current.instanceColor) glow.current.instanceColor.needsUpdate = true
  })

  return (
    <>
      <instancedMesh ref={cells} args={[geo, undefined, N]} frustumCulled={false}>
        <meshStandardMaterial roughness={0.34} metalness={0.2} emissive="#101a33" emissiveIntensity={0.25} />
      </instancedMesh>
      <instancedMesh ref={glow} args={[geo, undefined, N]} frustumCulled={false}>
        <meshBasicMaterial transparent opacity={0.11} depthWrite={false} blending={AdditiveBlending} />
      </instancedMesh>
      <instancedMesh ref={ghost} args={[geo, undefined, 4]} frustumCulled={false}>
        <meshBasicMaterial transparent opacity={0.2} depthWrite={false} />
      </instancedMesh>
      <pointLight ref={light} distance={12} decay={1.6} />
    </>
  )
}

// 줄을 지우면 그 줄의 블록이 신의 색 조각으로 터져 나간다
function Burst({ gref }) {
  const mesh = useRef()
  const seen = useRef(0)
  const d = useMemo(() => new Object3D(), [])
  const col = useMemo(() => new Color(), [])
  const ps = useMemo(() => Array.from({ length: MAX_P }, () => ({ p: [0, 0, 0], v: [0, 0, 0], life: 0, max: 1, r: [0, 0, 0] })), [])
  const next = useRef(0)

  useFrame((_, dt) => {
    const s = gref.current
    if (s?.fx && s.fx.id !== seen.current) {
      seen.current = s.fx.id
      s.fx.cells.forEach((cell) => {
        const p = ps[next.current++ % MAX_P]
        p.p = [cell.x, cell.y, 0]
        p.v = [(Math.random() - 0.5) * 9, 4 + Math.random() * 8, 2 + Math.random() * 8]
        p.max = p.life = 0.7 + Math.random() * 0.6
        p.r = [Math.random() * 6, Math.random() * 6, Math.random() * 6]
        p.color = cell.color
      })
    }
    const step = Math.min(dt, 0.05)
    ps.forEach((p, i) => {
      if (p.life > 0) {
        p.life -= step
        p.v[1] -= 22 * step
        p.p[0] += p.v[0] * step; p.p[1] += p.v[1] * step; p.p[2] += p.v[2] * step
      }
      const k = Math.max(0, p.life / p.max)
      d.position.set(...p.p); d.rotation.set(p.r[0] * (1 - k) * 4, p.r[1] * (1 - k) * 4, 0); d.scale.setScalar(k * 0.5); d.updateMatrix()
      mesh.current.setMatrixAt(i, d.matrix)
      mesh.current.setColorAt(i, col.set(p.color ?? '#ffffff'))
    })
    mesh.current.instanceMatrix.needsUpdate = true
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true
  })
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, MAX_P]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial transparent opacity={0.95} blending={AdditiveBlending} depthWrite={false} />
    </instancedMesh>
  )
}

// 뒤쪽의 한라산과 판 틀, 바닥
function Stage() {
  return (
    <group>
      {/* 판 뒤의 격자 벽과 틀 */}
      <mesh position={[(COLS - 1) / 2, (ROWS - 1) / 2, -0.7]}>
        <planeGeometry args={[COLS, ROWS]} />
        <meshBasicMaterial color="#0a1a40" transparent opacity={0.72} />
      </mesh>
      <Line points={gridPts} segments color="#7dd3fc" lineWidth={1} transparent opacity={0.13} position={[0, 0, -0.69]} />
      <Line points={[[-0.5, -0.5, 0], [COLS - 0.5, -0.5, 0], [COLS - 0.5, ROWS - 0.5, 0], [-0.5, ROWS - 0.5, 0], [-0.5, -0.5, 0]]} color="#9bdcff" lineWidth={2.4} />
      {[-0.5 - 0.35, COLS - 0.5 + 0.35].map((x) => (
        <mesh key={x} position={[x, (ROWS - 1) / 2, 0]}>
          <boxGeometry args={[0.3, ROWS + 0.6, 1.3]} />
          <meshStandardMaterial color="#16305f" roughness={0.4} metalness={0.5} emissive="#2a5ea8" emissiveIntensity={0.35} />
        </mesh>
      ))}
      <mesh position={[(COLS - 1) / 2, -0.95, 0]}>
        <boxGeometry args={[COLS + 1.3, 0.8, 1.6]} />
        <meshStandardMaterial color="#16305f" roughness={0.35} metalness={0.5} emissive="#2a5ea8" emissiveIntensity={0.3} />
      </mesh>
      {/* 멀리 보이는 한라산과 오름들 */}
      <mesh position={[(COLS - 1) / 2, -2, -26]}>
        <coneGeometry args={[22, 15, 7]} />
        <meshStandardMaterial color="#0f3a4f" flatShading roughness={1} />
      </mesh>
      <mesh position={[(COLS - 1) / 2, 4.2, -26]}>
        <coneGeometry args={[6.4, 4.6, 7]} />
        <meshStandardMaterial color="#e8f1fb" flatShading roughness={1} emissive="#9cc4e8" emissiveIntensity={0.25} />
      </mesh>
      {[[-14, 5], [26, 6.5], [-24, 4], [-4, 3.5]].map(([x, h], i) => (
        <mesh key={i} position={[x + 8, -3 + h / 2 - 1, -20 - i * 2]}>
          <coneGeometry args={[h * 1.8, h, 6]} />
          <meshStandardMaterial color="#0c2f45" flatShading roughness={1} />
        </mesh>
      ))}
      <mesh position={[(COLS - 1) / 2, -2.4, -14]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[120, 60]} />
        <meshStandardMaterial color="#081a38" roughness={0.3} metalness={0.6} side={DoubleSide} />
      </mesh>
    </group>
  )
}

// 카메라가 마우스를 따라 살짝 움직여서 입체감이 느껴지게
function Rig() {
  useFrame(({ camera, pointer, clock }, dt) => {
    const k = 1 - Math.pow(0.02, dt)
    const sway = Math.sin(clock.elapsedTime * 0.45) * 2.2
    camera.position.x += ((COLS - 1) / 2 + 3 + sway + pointer.x * 5 - camera.position.x) * k
    camera.position.y += (13 + pointer.y * 2.2 - camera.position.y) * k
    camera.lookAt((COLS - 1) / 2, 9.4, 0)
  })
  return null
}

export default function TetrisScene3D({ gref, colorOf, collide }) {
  return (
    <Canvas camera={{ position: [7.5, 13, 30], fov: 38 }} dpr={[1.5, 2]} gl={{ antialias: true }}>
      <color attach="background" args={['#070f2e']} />
      <fog attach="fog" args={['#070f2e', 38, 85]} />
      <ambientLight intensity={0.5} color="#9db8ff" />
      <directionalLight position={[-8, 18, 14]} intensity={1.25} color="#ffffff" />
      <directionalLight position={[14, 6, 8]} intensity={0.6} color="#a5c8ff" />
      <Stars radius={70} depth={40} count={1400} factor={4} saturation={0.5} fade speed={0.6} />
      <Stage />
      <Blocks gref={gref} colorOf={colorOf} collide={collide} />
      <Burst gref={gref} />
      <Rig />
    </Canvas>
  )
}
