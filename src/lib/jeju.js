// 3D 제주 지도용 지형 계산. 해안선·오름·섬은 [경도, 위도] 점으로 단순화해 만든 것이라 실제와 완전히 같지는 않습니다.
// 서쪽 끝(고산)에서 시작해 북쪽 해안을 지나 동쪽(성산), 남쪽 해안을 돌아 다시 서쪽으로 이어집니다.
export const COAST = [
  [126.150, 33.296], [126.156, 33.320], [126.170, 33.340], [126.190, 33.364], [126.214, 33.380], [126.240, 33.395], [126.264, 33.414],
  [126.290, 33.440], [126.305, 33.449], [126.320, 33.462], [126.350, 33.476], [126.385, 33.488], [126.410, 33.494], [126.444, 33.507],
  [126.476, 33.513], [126.510, 33.520], [126.530, 33.524], [126.570, 33.527], [126.590, 33.530], [126.633, 33.538], [126.670, 33.544],
  [126.710, 33.550], [126.750, 33.559], [126.795, 33.558], [126.828, 33.556], [126.860, 33.540], [126.890, 33.520], [126.920, 33.498],
  [126.950, 33.480], [126.962, 33.462], [126.952, 33.445], [126.936, 33.435], [126.930, 33.423], [126.915, 33.400], [126.890, 33.370],
  [126.868, 33.344], [126.836, 33.320], [126.790, 33.298], [126.770, 33.286], [126.720, 33.274], [126.680, 33.269], [126.630, 33.256],
  [126.564, 33.238], [126.520, 33.240], [126.470, 33.242], [126.410, 33.237], [126.370, 33.232], [126.340, 33.229], [126.310, 33.230],
  [126.287, 33.206], [126.260, 33.210], [126.225, 33.220], [126.190, 33.250], [126.160, 33.280],
]

// 본섬 밖의 작은 섬들: 우도, 비양도, 차귀도, 가파도, 마라도
const ISLANDS = [
  { pos: [126.950, 33.500], h: 0.11, s: 0.15 }, { pos: [126.233, 33.418], h: 0.1, s: 0.07 }, { pos: [126.148, 33.310], h: 0.09, s: 0.06 },
  { pos: [126.270, 33.170], h: 0.05, s: 0.09 }, { pos: [126.265, 33.115], h: 0.05, s: 0.09 },
]

// 이름 있는 오름과 봉우리
const NAMED = [
  { name: '성산일출봉', pos: [126.9425, 33.4583], h: 0.22, s: 0.1 }, { name: '산방산', pos: [126.3115, 33.2395], h: 0.3, s: 0.085 },
  { name: '송악산', pos: [126.290, 33.205], h: 0.12, s: 0.1 }, { name: '도두봉', pos: [126.472, 33.511], h: 0.06, s: 0.07 },
  { name: '용눈이오름', pos: [126.820, 33.447], h: 0.1, s: 0.1 }, { name: '다랑쉬오름', pos: [126.804, 33.463], h: 0.12, s: 0.1 },
  { name: '아부오름', pos: [126.7497, 33.4325], h: 0.09, s: 0.1 }, { name: '거문오름', pos: [126.705, 33.435], h: 0.1, s: 0.12 },
  { name: '어승생악', pos: [126.493, 33.386], h: 0.13, s: 0.12 }, { name: '새별오름', pos: [126.357, 33.365], h: 0.11, s: 0.12 },
  { name: '금오름', pos: [126.304, 33.350], h: 0.1, s: 0.1 }, { name: '노꼬메오름', pos: [126.355, 33.413], h: 0.1, s: 0.1 },
  { name: '물영아리', pos: [126.700, 33.391], h: 0.1, s: 0.09 }, { name: '산굼부리', pos: [126.690, 33.430], h: 0.07, s: 0.09 },
  { name: '백약이오름', pos: [126.770, 33.430], h: 0.08, s: 0.09 }, { name: '원당봉', pos: [126.590, 33.515], h: 0.05, s: 0.06 },
]

// 경위도 -> 지도 좌표 (1단위 ≈ 6km). x 는 동쪽, z 는 남쪽이 +
export const toXZ = ([lng, lat]) => [(lng - 126.56) * 15.2, -(lat - 33.38) * 18.5]

const POLY = COAST.map(toXZ)
export const COAST_XZ = POLY
export const HALLA = toXZ([126.533, 33.362]) // 한라산 백록담

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

// 값 잡음(value noise): 산등성이의 자잘한 울퉁불퉁함에 쓴다
const hash = (i, j) => { const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return s - Math.floor(s) }
function noise(x, z) {
  const i = Math.floor(x), j = Math.floor(z), fx = x - i, fz = z - j
  const u = fx * fx * (3 - 2 * fx), v = fz * fz * (3 - 2 * fz)
  return hash(i, j) * (1 - u) * (1 - v) + hash(i + 1, j) * u * (1 - v) + hash(i, j + 1) * (1 - u) * v + hash(i + 1, j + 1) * u * v
}
const fbm = (x, z) => noise(x, z) * 0.55 + noise(x * 2.1, z * 2.1) * 0.3 + noise(x * 4.3, z * 4.3) * 0.15

const toBump = (o) => { const [x, z] = toXZ(o.pos); return { x, z, h: o.h, r: o.s * 15.2 / 1.2, name: o.name } }
const NAMED_B = NAMED.map(toBump)
const ISLAND_B = ISLANDS.map(toBump)
// 이름 없는 작은 오름들: 매번 같은 모양이 나오도록 씨앗으로 만든다
const FILLER = (() => {
  let s = 11
  const rand = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296 }
  const out = []
  while (out.length < 90) {
    const x = (rand() - 0.5) * 13, z = (rand() - 0.5) * 6.4
    if (inside(x, z) && Math.hypot((x - HALLA[0]) / 1.6, z - HALLA[1]) > 1.5) out.push({ x, z, h: 0.03 + rand() * 0.06, r: 0.07 + rand() * 0.1 })
  }
  return out
})()
const BUMPS = [...NAMED_B, ...FILLER]

const gauss = (b, x, z) => {
  const dx = x - b.x, dz = z - b.z, r2 = b.r * b.r
  if (dx * dx + dz * dz > 18 * r2) return 0 // 먼 곳은 계산 생략
  return b.h * Math.exp(-(dx * dx + dz * dz) / (2 * r2))
}

// (x, z) 지점의 높이. 바다 밑은 음수.
export function heightAt(x, z) {
  if (!inside(x, z)) {
    const d = distCoast(x, z)
    let h = -Math.min(0.04 + d * 0.5, 0.55) // 바다 밑: 해안에서 멀어질수록 깊어진다
    for (const b of ISLAND_B) {
      const w = Math.exp(-((x - b.x) ** 2 + (z - b.z) ** 2) / (2 * (b.r * 1.5) ** 2))
      if (w > 0.01) h = h * (1 - w) + (0.03 + gauss(b, x, z)) * w
    }
    return h
  }
  const d = distCoast(x, z)
  let h = 0.03 + 0.2 * smooth(0, 1.8, d)
  // 한라산: 동서로 길쭉한 방패 모양 화산
  const hx = (x - HALLA[0]) / 1.25, hz = (z - HALLA[1]) / 0.85
  const r2 = hx * hx + hz * hz
  const mount = Math.exp(-r2 / 2)
  h += 0.95 * mount
  h += (fbm(x * 5, z * 5) - 0.5) * 0.12 * smooth(0.05, 0.6, mount) // 산등성이 결
  if ((x - HALLA[0]) ** 2 + (z - HALLA[1]) ** 2 < 0.1 * 0.1) h -= 0.05 // 백록담
  for (const b of BUMPS) h += gauss(b, x, z)
  return h + (fbm(x * 14, z * 14) - 0.5) * 0.012
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

// 지도에 작게 표시하는 지명
export const LANDMARKS = [
  { name: '제주시', pos: [126.531, 33.4996], kind: 'city' },
  { name: '서귀포시', pos: [126.562, 33.254], kind: 'city' },
  { name: '한라산 1,947m', pos: [126.533, 33.362], kind: 'peak', up: 0.5 },
  { name: '성산일출봉', pos: [126.9425, 33.4583], kind: 'spot' },
  { name: '산방산', pos: [126.3115, 33.2395], kind: 'spot' },
  { name: '우도', pos: [126.95, 33.5], kind: 'spot' },
  { name: '마라도', pos: [126.265, 33.115], kind: 'spot' },
  { name: '가파도', pos: [126.27, 33.17], kind: 'spot' },
]

// 도로: 일주도로(해안을 한 바퀴)와 한라산을 넘는 1100도로, 5·16도로
const ring = COAST.map((p) => [p[0] + (126.56 - p[0]) * 0.06, p[1] + (33.38 - p[1]) * 0.06])
export const ROADS = [
  { name: '일주도로', pts: [...ring, ring[0]] },
  { name: '1100도로', pts: [[126.53, 33.50], [126.49, 33.44], [126.463, 33.361], [126.47, 33.30], [126.52, 33.255]] },
  { name: '5·16도로', pts: [[126.53, 33.50], [126.575, 33.45], [126.613, 33.385], [126.6, 33.315], [126.562, 33.255]] },
]
