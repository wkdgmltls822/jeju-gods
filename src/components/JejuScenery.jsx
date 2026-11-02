import { useMemo, useRef } from 'react'
import { AdditiveBlending, DoubleSide } from 'three'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { glowTexture } from '../lib/glow'
import { HALLA } from '../lib/jeju'

// 3D 제주 지도의 배경 장식: 일렁이는 바다, 달과 달빛, 오로라 커튼, 안개, 반딧불, 별똥별

// 일렁이는 밤바다: 물결 모양으로 출렁이고, 달빛 길 위로 반짝임이 흩어진다
export function Sea() {
  const mat = useRef()
  const uniforms = useMemo(() => ({ t: { value: 0 }, ang: { value: 0 } }), [])
  useFrame(({ clock, camera }) => {
    mat.current.uniforms.t.value = clock.elapsedTime
    mat.current.uniforms.ang.value = Math.atan2(camera.position.x, camera.position.z)
  })
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[60, 60, 240, 240]} />
      <shaderMaterial ref={mat} uniforms={uniforms} transparent depthWrite={false}
        vertexShader={`
          uniform float t; varying vec3 vW;
          void main() {
            vec3 p = position;
            p.z += 0.025 * sin(p.x * 2.4 + t * 1.3) + 0.02 * sin(p.y * 3.1 + t * 1.7);
            vec4 w = modelMatrix * vec4(p, 1.0);
            vW = w.xyz;
            gl_Position = projectionMatrix * viewMatrix * w;
          }`}
        fragmentShader={`
          uniform float t; uniform float ang; varying vec3 vW;
          float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
          void main() {
            float r = length(vW.xz);
            vec3 base = mix(vec3(0.03, 0.24, 0.42), vec3(0.015, 0.1, 0.22), smoothstep(4.0, 22.0, r));
            float w = sin(vW.x * 3.0 + t * 1.2) * sin(vW.z * 3.4 - t);
            base += vec3(0.04, 0.1, 0.14) * smoothstep(0.55, 1.0, w);
            vec2 q = floor(vW.xz * 8.0 + vec2(t * 0.5, -t * 0.35));
            float h = hash(q);
            float tw = step(0.982, h) * (0.5 + 0.5 * sin(t * 4.0 + h * 40.0));
            float cx = vW.x * cos(ang) - vW.z * sin(ang);
            float cz = vW.x * sin(ang) + vW.z * cos(ang);
            float lane = exp(-pow((cx + 5.5 + cz * 0.28) / 1.9, 2.0));
            base += vec3(0.8, 0.9, 1.0) * tw * (0.3 + lane * 1.2);
            base += vec3(0.5, 0.65, 0.9) * lane * 0.16;
            gl_FragColor = vec4(base, 0.66);
          }`} />
    </mesh>
  )
}

function Moon() {
  const halo = useRef()
  useFrame(({ clock }) => { halo.current.scale.setScalar(15 + Math.sin(clock.elapsedTime * 0.6) * 0.8) })
  return (
    <group position={[-11, 8, -17]}>
      <sprite ref={halo}><spriteMaterial map={glowTexture} color="#cfe0ff" transparent opacity={0.55} depthWrite={false} blending={AdditiveBlending} fog={false} /></sprite>
      <mesh><sphereGeometry args={[1.15, 32, 32]} /><meshBasicMaterial color="#f7f8ff" /></mesh>
      <mesh position={[0.35, 0.25, 1.1]}><circleGeometry args={[0.28, 24]} /><meshBasicMaterial color="#d9def5" transparent opacity={0.6} /></mesh>
      <mesh position={[-0.4, -0.3, 1.1]}><circleGeometry args={[0.2, 24]} /><meshBasicMaterial color="#d9def5" transparent opacity={0.55} /></mesh>
    </group>
  )
}

// 하늘에 드리운 오로라 커튼
function Curtain({ z, y, hue, speed }) {
  const mat = useRef()
  const uniforms = useMemo(() => ({ t: { value: 0 }, hue: { value: hue }, sp: { value: speed } }), [hue, speed])
  useFrame(({ clock }) => { mat.current.uniforms.t.value = clock.elapsedTime })
  return (
    <mesh position={[0, y, z]}>
      <planeGeometry args={[30, 8, 60, 1]} />
      <shaderMaterial ref={mat} uniforms={uniforms} transparent depthWrite={false} side={DoubleSide} blending={AdditiveBlending}
        vertexShader={`
          uniform float t; uniform float sp; varying vec2 vUv;
          void main() {
            vUv = uv;
            vec3 p = position;
            p.y += sin(p.x * 0.5 + t * sp) * 0.5;
            p.z += sin(p.x * 0.35 + t * sp * 0.7) * 1.2;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }`}
        fragmentShader={`
          uniform float t; uniform float hue; uniform float sp; varying vec2 vUv;
          void main() {
            float rays = 0.5 + 0.5 * sin(vUv.x * 46.0 + t * sp + sin(vUv.x * 7.0 + t * 0.3) * 2.0);
            float fade = smoothstep(0.0, 0.3, vUv.y) * (1.0 - smoothstep(0.45, 1.0, vUv.y));
            vec3 a = mix(vec3(0.2, 1.0, 0.72), vec3(0.55, 0.4, 1.0), hue);
            vec3 b = mix(vec3(0.5, 0.45, 1.0), vec3(1.0, 0.5, 0.8), hue);
            vec3 col = mix(a, b, vUv.y + 0.2 * sin(vUv.x * 3.0 + t * 0.4));
            gl_FragColor = vec4(col, (0.2 + 0.35 * rays) * fade * 0.7);
          }`} />
    </mesh>
  )
}

// 한라산 허리를 감도는 안개와 바다 위에 낮게 깔린 구름
const MIST = [
  { p: [HALLA[0] - 1.6, 1.4, HALLA[1] + 0.4], s: 4.2, o: 0.2, v: 0.12 }, { p: [HALLA[0] + 1.4, 1.2, HALLA[1] - 0.5], s: 4.6, o: 0.17, v: -0.1 },
  { p: [HALLA[0], 1.75, HALLA[1] + 0.9], s: 3.2, o: 0.16, v: 0.08 }, { p: [-5.2, 0.35, 3.4], s: 6, o: 0.14, v: 0.06 },
  { p: [4.8, 0.3, 3.9], s: 6.5, o: 0.14, v: -0.07 }, { p: [6.2, 0.3, -1.8], s: 5.5, o: 0.12, v: 0.05 }, { p: [-6, 0.3, -2.4], s: 5.5, o: 0.12, v: -0.05 },
]
function Mist() {
  const refs = useRef([])
  useFrame(({ clock }) => {
    refs.current.forEach((m, i) => { if (m) m.position.x = MIST[i].p[0] + Math.sin(clock.elapsedTime * MIST[i].v + i) * 0.9 })
  })
  return (
    <>
      {MIST.map((m, i) => (
        <sprite key={i} ref={(r) => { refs.current[i] = r }} position={m.p} scale={[m.s, m.s * 0.5, 1]}>
          <spriteMaterial map={glowTexture} color="#dbe8ff" transparent opacity={m.o} depthWrite={false} fog={false} />
        </sprite>
      ))}
    </>
  )
}

// 하늘을 가로지르는 별똥별
const METEORS = [
  { x: -9, y: 9, dx: 7, dy: -3.4, k: 0 }, { x: 2, y: 10, dx: 8, dy: -3.8, k: 0.37 }, { x: -3, y: 7.5, dx: 6, dy: -2.8, k: 0.68 }, { x: 6, y: 11, dx: 7, dy: -3.3, k: 0.18 },
]
function Meteors3D() {
  const refs = useRef([])
  useFrame(({ clock }) => {
    METEORS.forEach((m, i) => {
      const g = refs.current[i]
      if (!g) return
      const t = (clock.elapsedTime * 0.12 + m.k) % 1
      g.position.set(m.x + m.dx * t, m.y + m.dy * t, -15)
      g.children[0].material.opacity = Math.sin(Math.PI * t) * 0.9
    })
  })
  return (
    <>
      {METEORS.map((m, i) => (
        <group key={i} ref={(r) => { refs.current[i] = r }} rotation={[0, 0, Math.atan2(m.dy, m.dx)]}>
          <mesh position={[-0.9, 0, 0]}><planeGeometry args={[1.8, 0.035]} /><meshBasicMaterial color="#ffffff" transparent opacity={0} depthWrite={false} blending={AdditiveBlending} /></mesh>
        </group>
      ))}
    </>
  )
}

function Backdrop({ children }) {
  const g = useRef()
  useFrame(({ camera }) => { g.current.rotation.y = Math.atan2(camera.position.x, camera.position.z) })
  return <group ref={g}>{children}</group>
}

export default function Scenery() {
  return (
    <>
      <Backdrop>
        <Moon />
        <Curtain z={-14} y={7} hue={0.1} speed={0.7} />
        <Curtain z={-18} y={8.5} hue={0.7} speed={0.5} />
        <Meteors3D />
        <Sparkles count={45} scale={[2.4, 0.15, 12]} position={[-5.4, 0.08, -3]} size={3.4} speed={0.9} color="#e6f0ff" opacity={0.9} />
      </Backdrop>
      <Mist />
      <Sparkles count={70} scale={[11, 1, 5.5]} position={[0, 0.5, 0]} size={3.2} speed={0.4} color="#fde68a" opacity={0.85} />
    </>
  )
}
