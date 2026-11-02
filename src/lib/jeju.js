// 3D 제주 지도용 지형 계산. 해안선은 [경도, 위도] 점으로 단순화해 만든 것이라 실제와 완전히 같지는 않습니다.
export const COAST = [
  [126.16, 33.30], [126.17, 33.35], [126.22, 33.39], [126.29, 33.43], [126.36, 33.47], [126.43, 33.50], [126.50, 33.52],
  [126.56, 33.52], [126.63, 33.54], [126.70, 33.55], [126.78, 33.56], [126.86, 33.54], [126.93, 33.50], [126.97, 33.46],
  [126.94, 33.42], [126.90, 33.38], [126.88, 33.32], [126.80, 33.27], [126.70, 33.25], [126.60, 33.24], [126.50, 33.24],
  [126.40, 33.22], [126.32, 33.21], [126.25, 33.20], [126.19, 33.23],
]

// 경위도 -> 지도 좌표 (1단위 ≈ 6km). x 는 동쪽, z 는 남쪽이 +
export const toXZ = ([lng, lat]) => [(lng - 126.56) * 15.2, -(lat - 33.38) * 18.5]

const POLY = COAST.map(toXZ)
export const COAST_XZ = POLY

// 한라산 백록담
export const HALLA = toXZ([126.533, 33.362])

function inside(x, z) {
  let c = false
  for (let i = 0, j = POLY.length - 1; i < POLY.length; j = i++) {
    const [xi, zi] = POLY[i], [xj, zj] = POLY[j]
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c
  }
  return c
}

function distCoast(x, z) {
  let best = Infinity
  for (let i = 0; i < POLY.length; i++) {
    const [ax, az] = POLY[i], [bx, bz] = POLY[(i + 1) % POLY.length]
    const dx = bx - ax, dz = bz - az
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)))
    best = Math.min(best, Math.hypot(x - (ax + t * dx), z - (az + t * dz)))
  }
  return best
}

const smooth = (a, b, v) => { const t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t) }

// 오름(작은 화산 언덕)들: 매번 같은 모양이 나오도록 씨앗으로 만든다
const OREUMS = (() => {
  let s = 7
  const rand = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296 }
  const out = []
  while (out.length < 46) {
    const x = (rand() - 0.5) * 13, z = (rand() - 0.5) * 6.4
    if (inside(x, z) && Math.hypot(x - HALLA[0], z - HALLA[1]) > 1.6) out.push({ x, z, h: 0.05 + rand() * 0.08, r: 0.1 + rand() * 0.12 })
  }
  return out
})()

// (x, z) 지점의 높이. 바다 밑은 음수.
export function heightAt(x, z) {
  const d = distCoast(x, z)
  if (!inside(x, z)) return -Math.min(d * 0.6, 0.5)
  let h = 0.03 + 0.2 * smooth(0, 1.8, d)
  const r2 = (x - HALLA[0]) ** 2 + (z - HALLA[1]) ** 2
  h += 0.78 * Math.exp(-r2 / (2 * 0.95 * 0.95)) // 한라산: 완만하게 길게 퍼진 방패 모양
  if (r2 < 0.09 * 0.09) h -= 0.05 // 백록담
  for (const o of OREUMS) h += o.h * Math.exp(-((x - o.x) ** 2 + (z - o.z) ** 2) / (2 * o.r * o.r))
  return h + 0.012 * Math.sin(x * 9) * Math.cos(z * 11)
}

// 신들과 이어진 실제 장소 (지도의 핀)
export const PINS = [
  { god: 'seolmundae', place: '한라산 백록담', pos: [126.533, 33.362] },
  { god: 'cheonjiwang', place: '한라산 영실', pos: [126.49, 33.352] },
  { god: 'daebyeol', place: '제주신화월드', pos: [126.309, 33.306] },
  { god: 'samseong', place: '삼성혈', pos: [126.531, 33.497] },
  { god: 'baekjuddo', place: '송당 아부오름', pos: [126.75, 33.4325] },
  { god: 'yeongdeung', place: '제주해녀박물관', pos: [126.867, 33.522] },
  { god: 'jacheongbi', place: '제주민속촌', pos: [126.843, 33.323] },
  { god: 'munjeon', place: '성읍민속마을', pos: [126.805, 33.388] },
  { god: 'jowang', place: '서귀포 초가마을', pos: [126.56, 33.26] },
  { god: 'chilseong', place: '제주시 칠성로', pos: [126.526, 33.513] },
]
