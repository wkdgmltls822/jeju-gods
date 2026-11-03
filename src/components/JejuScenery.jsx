import { useMemo, useRef } from 'react'
import { AdditiveBlending, ClampToEdgeWrapping, DataTexture, DoubleSide, LinearFilter, RedFormat, UnsignedByteType, Vector2 } from 'three'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { glowTexture } from '../lib/glow'
import { HALLA, heightAt } from '../lib/jeju'

// 3D 제주 지도의 배경 장식: 일렁이는 바다, 달과 달빛, 오로라 커튼, 안개, 반딧불, 별똥별

// 실제 바다처럼 출렁이는 밤바다
//  - 크고 작은 너울이 겹쳐 실제로 물결이 오르내린다(섬 가까이에서는 잔잔해서 해안이 잠기지 않는다)
//  - 해안에서 멀어질수록 바다색이 청록 → 짙은 남색으로 깊어진다(지형 높이로 만든 깊이 지도 사용)
//  - 해안선에는 밀려오는 흰 거품, 물결마루에는 물거품, 하늘과 달빛이 비치는 반사
const WAVES = `
  const int N = 5;
  const vec2 D[5] = vec2[5](vec2(1.0, 0.3), vec2(-0.4, 1.0), vec2(0.7, 0.7), vec2(0.2, -1.0), vec2(-0.9, -0.4));
  const float K[5] = float[5](0.9, 1.5, 2.6, 4.6, 8.0);
  const float S[5] = float[5](0.9, 1.15, 1.5, 2.0, 2.6);
  const float A[5] = float[5](0.20, 0.13, 0.075, 0.035, 0.015);
`
// 깊이 지도: 섬 주변 바다의 깊이(0 해안 ~ 1 깊은 바다)를 한 번만 계산해 texture 로 만든다
const DEPTH = { x0: -9, x1: 9, z0: -7, z1: 7, w: 288, h: 224 }
function makeDepthTexture() {
  const { x0, x1, z0, z1, w, h } = DEPTH
  const data = new Uint8Array(w * h)
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const x = x0 + ((i + 0.5) / w) * (x1 - x0), z = z0 + ((j + 0.5) / h) * (z1 - z0)
    data[j * w + i] = Math.round(Math.min(1, Math.max(0, -heightAt(x, z) / 0.55)) * 255)
  }
  const t = new DataTexture(data, w, h, RedFormat, UnsignedByteType)
  t.magFilter = t.minFilter = LinearFilter; t.wrapS = t.wrapT = ClampToEdgeWrapping; t.needsUpdate = true
  return t
}

export function Sea() {
  const mat = useRef()
  const uniforms = useMemo(() => ({
    t: { value: 0 }, ang: { value: 0 }, uDepth: { value: makeDepthTexture() },
    uMin: { value: new Vector2(DEPTH.x0, DEPTH.z0) }, uSize: { value: new Vector2(DEPTH.x1 - DEPTH.x0, DEPTH.z1 - DEPTH.z0) },
  }), [])
  useFrame(({ clock, camera }) => {
    mat.current.uniforms.t.value = clock.elapsedTime
    mat.current.uniforms.ang.value = Math.atan2(camera.position.x, camera.position.z)
  })
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[60, 60, 320, 320]} />
      <shaderMaterial ref={mat} uniforms={uniforms} transparent depthWrite={false}
        vertexShader={`
          uniform float t; uniform sampler2D uDepth; uniform vec2 uMin; uniform vec2 uSize;
          varying vec3 vW; varying vec2 vP; varying float vOpen;
          ${WAVES}
          void main() {
            vec3 p = position;
            vec2 wxz = vec2(p.x, -p.y);
            float d = texture2D(uDepth, (wxz - uMin) / uSize).r;
            float open = smoothstep(0.05, 0.7, d);          // 해안 근처는 0(잔잔), 먼바다는 1(크게 출렁)
            vOpen = open;
            float h = 0.0;
            for (int i = 0; i < 4; i++) h += A[i] * sin(dot(D[i], p.xy) * K[i] + t * S[i]);
            p.z += h * mix(0.12, 1.0, open);
            vP = position.xy;
            vec4 w = modelMatrix * vec4(p, 1.0);
            vW = w.xyz;
            gl_Position = projectionMatrix * viewMatrix * w;
          }`}
        fragmentShader={`
          uniform float t; uniform float ang; uniform sampler2D uDepth; uniform vec2 uMin; uniform vec2 uSize;
          varying vec3 vW; varying vec2 vP; varying float vOpen;
          ${WAVES}
          float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
          float noise(vec2 p) {
            vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
            return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
          }
          void main() {
            vec2 wxz = vW.xz;
            float depth = texture2D(uDepth, (wxz - uMin) / uSize).r;
            float open = vOpen;
            float damp = mix(0.12, 1.0, open);
            // 너울의 높이와 기울기(법선): 큰 너울 위에 잔물결이 얹힌다
            float warp = 1.4 * sin(vP.x * 0.31 + vP.y * 0.27 + t * 0.2) + 0.9 * sin(vP.y * 0.5 - vP.x * 0.22 - t * 0.15);
            float h = 0.0, dx = 0.0, dy = 0.0;
            for (int i = 0; i < N; i++) {
              float ph = dot(D[i], vP) * K[i] + t * S[i] + warp * (0.35 + 0.15 * float(i));
              h += A[i] * sin(ph);
              float c = cos(ph) * A[i] * K[i];
              dx += c * D[i].x; dy += c * D[i].y;
            }
            vec2 rip = vec2(noise(wxz * 5.0 + vec2(t * 0.35, t * 0.2)) - 0.5, noise(wxz * 5.0 + vec2(-t * 0.25, t * 0.4) + 7.3) - 0.5) * 0.35;
            vec3 n = normalize(vec3(-(dx + rip.x * 0.6) * damp, 1.0, (dy + rip.y * 0.6) * damp));
            vec3 V = normalize(cameraPosition - vW);
            vec3 M = vec3(-11.0 * cos(ang) - 17.0 * sin(ang), 8.0, 11.0 * sin(ang) - 17.0 * cos(ang));
            vec3 L = normalize(M - vW);
            vec3 R = reflect(-V, n);

            // 바다색: 해안은 맑은 청록, 멀어질수록 짙은 남색
            vec3 shallow = vec3(0.18, 0.66, 0.70), mid = vec3(0.03, 0.36, 0.58), deep = vec3(0.012, 0.13, 0.32);
            vec3 water = mix(shallow, mid, smoothstep(0.0, 0.22, depth));
            water = mix(water, deep, smoothstep(0.18, 0.75, depth));
            float r = length(vW.xz);
            water = mix(water, deep * 0.8, smoothstep(10.0, 30.0, r));
            water += vec3(0.0, 0.07, 0.1) * smoothstep(-0.05, 0.25, h) * (0.4 + open); // 물마루의 투과광
            // 하늘이 비친 모습(수평선 쪽은 옅게, 위쪽은 짙게) + 달빛 반사
            float up = clamp(R.y, 0.0, 1.0);
            vec3 sky = mix(vec3(0.26, 0.30, 0.66), vec3(0.07, 0.10, 0.30), sqrt(up));
            float fres = pow(1.0 - max(dot(n, V), 0.0), 4.0) * 0.85 + 0.04;
            vec3 col = mix(water, sky, fres);
            float spec = pow(max(dot(n, normalize(L + V)), 0.0), 260.0);
            float glow = pow(max(dot(R, L), 0.0), 40.0);
            col += vec3(1.0, 0.96, 0.85) * (spec * 1.6 + glow * 0.22);

            // 물거품: 큰 파도 마루 + 해안에 밀려오는 흰 거품 띠
            float n1 = noise(wxz * 9.0 + t * 0.5);
            float crest = smoothstep(0.3, 0.46, h * damp + (n1 - 0.5) * 0.06) * open;
            float band = (1.0 - smoothstep(0.0, 0.085, depth));
            float wash = 0.5 + 0.5 * sin(depth * 70.0 - t * 2.2 + n1 * 3.0);
            float shore = band * (0.35 + 0.65 * wash) * (0.5 + n1);
            col = mix(col, vec3(0.93, 0.98, 1.0), clamp(crest * 0.4 + shore * 0.75, 0.0, 0.9));

            float alpha = mix(0.5, 0.95, smoothstep(0.0, 0.32, depth)); // 해안은 투명해서 바닥이 비친다
            gl_FragColor = vec4(col, alpha);
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
