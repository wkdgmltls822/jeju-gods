import { useLayoutEffect, useMemo, useRef } from 'react'
import { AdditiveBlending, Color, Object3D } from 'three'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { BUILDINGS, CITIES, cityBlocks, seeded } from '../lib/buildings'
import { heightAt, toXZ } from '../lib/jeju'
import { glowTexture } from '../lib/glow'

// 3D 지도 위의 건물 모형: 도심의 빌딩 숲, 등대, 기와집, 초가, 공항, 경기장, 리조트…
const at = (pos) => { const [x, z] = toXZ(pos); return [x, Math.max(heightAt(x, z), 0), z] }
// 이름표는 눈에 띄는 큰 시설에만 (나머지는 모형만 보여 화면이 복잡해지지 않게)
const LABELED = new Set(['tower']) // 이름표는 가장 눈에 띄는 타워에만
const WALL ='#d8e2f2', WARM = '#ffd98a'

function Box({ p = [0, 0, 0], s = [0.1, 0.1, 0.1], color = WALL, glow = 0.25 }) {
  return (
    <mesh position={[p[0], p[1] + s[1] / 2, p[2]]}>
      <boxGeometry args={s} />
      <meshStandardMaterial color={color} emissive={WARM} emissiveIntensity={glow} roughness={0.7} />
    </mesh>
  )
}
// 네 면 지붕(기와·초가): 피라미드를 45도 돌려 건물 모서리에 맞춘다
function Roof({ p = [0, 0, 0], w = 0.14, h = 0.07, color = '#7a3b2e' }) {
  return (
    <mesh position={[p[0], p[1] + h / 2, p[2]]} rotation={[0, Math.PI / 4, 0]}>
      <coneGeometry args={[w * 0.78, h, 4]} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  )
}
function House({ p = [0, 0, 0], w = 0.1, roof = '#7a3b2e' }) {
  return (
    <group position={p}>
      <Box s={[w, w * 0.45, w]} color="#efe3cf" glow={0.2} />
      <Roof p={[0, w * 0.45, 0]} w={w * 1.3} h={w * 0.55} color={roof} />
    </group>
  )
}

function Lighthouse({ p, phase = 0 }) {
  const beam = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 1.4 + phase
    if (beam.current) beam.current.material.opacity = 0.35 + Math.max(0, Math.sin(t)) * 0.65
  })
  return (
    <group position={p}>
      <mesh position={[0, 0.14, 0]}><cylinderGeometry args={[0.025, 0.045, 0.28, 12]} /><meshStandardMaterial color="#f4f6fb" emissive={WARM} emissiveIntensity={0.2} /></mesh>
      <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[0.046, 0.046, 0.03, 12]} /><meshStandardMaterial color="#e5484d" /></mesh>
      <mesh position={[0, 0.3, 0]}><sphereGeometry args={[0.032, 12, 12]} /><meshBasicMaterial color="#fff6c8" /></mesh>
      <sprite ref={beam} position={[0, 0.3, 0]} scale={[0.7, 0.7, 0.7]}>
        <spriteMaterial map={glowTexture} color="#ffe9a0" transparent depthWrite={false} blending={AdditiveBlending} fog={false} />
      </sprite>
    </group>
  )
}

function Airport({ p, rot }) {
  return (
    <group position={p} rotation={[0, rot, 0]}>
      <Box s={[0.62, 0.008, 0.07]} color="#3b4250" glow={0} />
      <Box p={[0, 0.008, 0]} s={[0.5, 0.002, 0.012]} color="#e8edf7" glow={0.4} />
      <Box p={[0.05, 0, 0.1]} s={[0.22, 0.04, 0.07]} color="#c7d3ea" />
      <mesh position={[0.17, 0.065, 0.1]}><cylinderGeometry args={[0.012, 0.016, 0.13, 10]} /><meshStandardMaterial color="#f4f6fb" emissive={WARM} emissiveIntensity={0.3} /></mesh>
      <mesh position={[0.17, 0.138, 0.1]}><cylinderGeometry args={[0.03, 0.02, 0.025, 10]} /><meshStandardMaterial color="#7dd3fc" emissive="#7dd3fc" emissiveIntensity={0.7} /></mesh>
    </group>
  )
}

function Stadium({ p }) {
  return (
    <group position={p}>
      <mesh position={[0, 0.03, 0]}><cylinderGeometry args={[0.15, 0.11, 0.06, 28, 1, true]} /><meshStandardMaterial color="#e3e9f5" side={2} emissive={WARM} emissiveIntensity={0.15} /></mesh>
      <mesh position={[0, 0.012, 0]}><cylinderGeometry args={[0.105, 0.105, 0.004, 28]} /><meshStandardMaterial color="#2f9a5c" emissive="#2f9a5c" emissiveIntensity={0.35} /></mesh>
    </group>
  )
}

function Harbor({ p }) {
  return (
    <group position={p}>
      <Box s={[0.28, 0.012, 0.05]} color="#9aa5b8" glow={0.1} />
      <Box p={[-0.08, 0.012, 0]} s={[0.05, 0.03, 0.035]} color="#e5484d" />
      <Box p={[0, 0.012, 0]} s={[0.05, 0.03, 0.035]} color="#3b82f6" />
      <Box p={[0.08, 0.012, 0]} s={[0.05, 0.03, 0.035]} color="#f59e0b" />
      <Box p={[0.12, 0.012, 0.05]} s={[0.012, 0.13, 0.012]} color="#ffd166" glow={0.5} />
    </group>
  )
}

function Building({ b }) {
  const p = at(b.pos)
  const rot = b.rot ?? 0
  switch (b.kind) {
    case 'lighthouse': return <Lighthouse p={p} phase={b.pos[0] * 9} />
    case 'airport': return <Airport p={p} rot={rot} />
    case 'stadium': return <Stadium p={p} />
    case 'harbor': return <Harbor p={p} />
    case 'tower':
      return (
        <group position={p}>
          <Box s={[0.07, 0.4, 0.07]} color="#c9d6f0" glow={0.45} />
          <Box p={[0.05, 0, 0.04]} s={[0.06, 0.28, 0.06]} color="#b7c6e6" glow={0.45} />
          <Box p={[0, 0.4, 0]} s={[0.035, 0.05, 0.035]} color="#7dd3fc" glow={0.9} />
        </group>
      )
    case 'office':
      return <group position={p}><Box s={[0.12, 0.1, 0.07]} color="#dbe4f4" /><Box p={[0, 0.1, 0]} s={[0.07, 0.07, 0.05]} color="#c4d2ea" /></group>
    case 'resort':
      return (
        <group position={p}>
          <Box p={[-0.07, 0, 0]} s={[0.06, 0.2, 0.06]} color="#e6ecf8" glow={0.4} />
          <Box p={[0, 0, 0.03]} s={[0.07, 0.28, 0.07]} color="#d3ddf2" glow={0.4} />
          <Box p={[0.08, 0, -0.01]} s={[0.06, 0.16, 0.06]} color="#e6ecf8" glow={0.4} />
          <Box p={[0, 0, -0.08]} s={[0.2, 0.04, 0.05]} color="#c8d4ea" glow={0.3} />
        </group>
      )
    case 'museum':
      return <group position={p}><Box s={[0.14, 0.06, 0.09]} color="#e8e2d6" /><Box p={[0.03, 0.06, 0]} s={[0.07, 0.04, 0.06]} color="#cfc7b6" /></group>
    case 'hanok':
      return (
        <group position={p}>
          <House p={[-0.07, 0, 0.02]} w={0.08} roof="#b98d4b" />
          <House p={[0.05, 0, -0.02]} w={0.09} roof="#a47b3f" />
          <House p={[-0.01, 0, 0.09]} w={0.07} roof="#b98d4b" />
        </group>
      )
    default: // hall: 기와지붕 전통 건물
      return (
        <group position={p}>
          <House w={0.13} roof="#5b6b7a" />
          <House p={[0.12, 0, 0.03]} w={0.08} roof="#5b6b7a" />
        </group>
      )
  }
}

// 도심 건물 무리: 인스턴스 하나로 한꺼번에 그린다
function Cities() {
  const ref = useRef()
  const blocks = useMemo(() => CITIES.flatMap((c) => cityBlocks(c).map(([lng, lat, sz, h]) => {
    const [x, y, z] = at([lng, lat])
    return { x, y, z, w: 0.04 + sz * 0.04, h: 0.06 + h * 0.3 }
  })), [])
  useLayoutEffect(() => {
    const o = new Object3D(), col = new Color()
    blocks.forEach((b, i) => {
      o.position.set(b.x, b.y + b.h / 2, b.z)
      o.scale.set(b.w, b.h, b.w)
      o.updateMatrix()
      ref.current.setMatrixAt(i, o.matrix)
      ref.current.setColorAt(i, col.set(b.h > 0.17 ? '#e8eefb' : '#bccbe6'))
    })
    ref.current.instanceMatrix.needsUpdate = true
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true
  }, [blocks])
  return (
    <instancedMesh ref={ref} args={[null, null, blocks.length]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial emissive={WARM} emissiveIntensity={0.3} roughness={0.75} />
    </instancedMesh>
  )
}

// 밤이 되면 도심에 불빛이 반짝이는 느낌의 작은 점들
function CityLights() {
  const ref = useRef()
  const pts = useMemo(() => {
    const rnd = seeded(31)
    return CITIES.slice(0, 2).flatMap((c) => Array.from({ length: 16 }, () => {
      const a = rnd() * 6.283, d = Math.sqrt(rnd()) * c.r * 1.3
      const [x, y, z] = at([c.pos[0] + Math.cos(a) * d * 1.15, c.pos[1] + Math.sin(a) * d])
      return [x, y + 0.28 + rnd() * 0.2, z, rnd() * 6]
    }))
  }, [])
  useFrame(({ clock }) => {
    ref.current?.children.forEach((s, i) => { s.material.opacity = 0.45 + Math.sin(clock.elapsedTime * 2 + pts[i][3]) * 0.3 })
  })
  return (
    <group ref={ref}>
      {pts.map(([x, y, z], i) => (
        <sprite key={i} position={[x, y, z]} scale={[0.12, 0.12, 0.12]}>
          <spriteMaterial map={glowTexture} color="#ffd98a" transparent depthWrite={false} blending={AdditiveBlending} fog={false} />
        </sprite>
      ))}
    </group>
  )
}

export default function Buildings3D() {
  return (
    <group>
      <Cities />
      <CityLights />
      {BUILDINGS.map((b) => <Building key={b.name} b={b} />)}
      {BUILDINGS.filter((b) => LABELED.has(b.kind)).map((b) => {
        const [x, y, z] = at(b.pos)
        return (
          <Html key={b.name} center distanceFactor={12} position={[x, y + (b.kind === 'tower' ? 0.62 : b.kind === 'lighthouse' ? 0.42 : 0.3), z]} pointerEvents="none">
            <span className="lm3d bld"><i className={`bi bi-${b.icon}`} />{b.name}</span>
          </Html>
        )
      })}
    </group>
  )
}
