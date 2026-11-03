import { HALLA, heightAt, shoreDist, toXZ } from './jeju'

// 제주의 대표 건물·시설: 그림 지도(아이콘), 3D 지도(건물 모형)가 함께 쓴다.
// kind: airport 공항 · tower 고층 타워 · lighthouse 등대 · hall 전통 건물 · hanok 초가마을 · museum 박물관 · resort 리조트 · stadium 경기장 · harbor 항구 · office 관공서
export const BUILDINGS = [
  { name: '제주국제공항', pos: [126.493, 33.5113], kind: 'airport', icon: 'airplane-fill', rot: 0.5 },
  { name: '제주 드림타워', pos: [126.4938, 33.4887], kind: 'tower', icon: 'buildings-fill' },
  { name: '제주도청', pos: [126.531, 33.489], kind: 'office', icon: 'building-fill' },
  { name: '제주목 관아', pos: [126.5222, 33.513], kind: 'hall', icon: 'bank2' },
  { name: '삼성혈', pos: [126.5335, 33.4972], kind: 'hall', icon: 'bank2' },
  { name: '제주항', pos: [126.543, 33.52], kind: 'harbor', icon: 'water' },
  { name: '해녀박물관', pos: [126.867, 33.522], kind: 'museum', icon: 'bank2' },
  { name: '우도 등대', pos: [126.9556, 33.5036], kind: 'lighthouse', icon: 'lightbulb-fill' },
  { name: '섭지코지 등대', pos: [126.934, 33.424], kind: 'lighthouse', icon: 'lightbulb-fill' },
  { name: '성읍민속마을', pos: [126.805, 33.388], kind: 'hanok', icon: 'house-heart-fill' },
  { name: '제주민속촌', pos: [126.843, 33.323], kind: 'hanok', icon: 'house-heart-fill' },
  { name: '서귀포 초가마을', pos: [126.56, 33.26], kind: 'hanok', icon: 'house-heart-fill' },
  { name: '서귀포 월드컵경기장', pos: [126.5088, 33.2466], kind: 'stadium', icon: 'trophy-fill' },
  { name: '중문관광단지', pos: [126.411, 33.2487], kind: 'resort', icon: 'buildings-fill' },
  { name: '제주신화월드', pos: [126.309, 33.306], kind: 'resort', icon: 'buildings-fill' },
  { name: '마라도 등대', pos: [126.2686, 33.1175], kind: 'lighthouse', icon: 'lightbulb-fill' },
]

// 건물이 빽빽한 도심(3D 에서는 작은 건물 무리, 그림 지도에서는 확대하면 나타나는 네모들)
export const CITIES = [
  { name: '제주시', pos: [126.531, 33.4996], r: 0.075, n: 70 },
  { name: '서귀포시', pos: [126.562, 33.254], r: 0.04, n: 36 },
  { name: '성산', pos: [126.9345, 33.4605], r: 0.014, n: 10 },
  { name: '애월', pos: [126.3265, 33.4625], r: 0.014, n: 10 },
  { name: '한림', pos: [126.2615, 33.4115], r: 0.014, n: 10 },
  { name: '표선', pos: [126.8335, 33.3265], r: 0.014, n: 10 },
]

// 그림 지도·3D 지도에서 건물을 해안선에서 margin 만큼 육지 안쪽(한라산 쪽)으로 당겨 세운다.
// 해안선을 단순하게 그린 지도라서 해안 도심의 좌표가 바다로 삐져나가거나 건물 몸통이 물 위에 걸치는 경우가 있다.
// 실제 지도(위성·도로)에는 진짜 좌표를 써야 하므로 이 함수는 3D·그림 지도에서만 쓴다. (우도·마라도 같은 딸린 섬은 그대로 둔다)
export function toLand(pos, margin = 0.04) {
  let [x, z] = toXZ(pos)
  for (let i = 0; i < 80; i++) {
    const sd = shoreDist(x, z)
    if (sd >= margin || (sd < 0 && heightAt(x, z) >= 0.04)) break
    const dx = HALLA[0] - x, dz = HALLA[1] - z, l = Math.hypot(dx, dz) || 1
    x += (dx / l) * 0.04; z += (dz / l) * 0.04
  }
  return [x / 15.2 + 126.56, 33.38 - z / 18.5] // toXZ 의 반대 계산
}
// 건물 종류별로 해안에서 떨어뜨릴 거리: 큰 시설일수록 멀리, 등대·항구는 바닷가에
const MARGINS = { airport: 0.3, stadium: 0.2, resort: 0.16, tower: 0.14, office: 0.14, museum: 0.14, hall: 0.14, hanok: 0.16, lighthouse: 0.02, harbor: 0.02 }
export const marginOf = (b) => MARGINS[b.kind] ?? 0.14

// 항상 같은 모양이 나오게 하는 작은 난수
export function seeded(seed) {
  let s = seed >>> 0 || 1
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)
}

// 도심 하나의 건물 무리: [경도, 위도, 크기(0~1), 높이(0~1)] — 중심에 가까울수록 높다
export function cityBlocks(c, seed = 7) {
  const rnd = seeded(seed + Math.round(c.pos[0] * 1000))
  const out = []
  for (let i = 0; i < c.n; i++) {
    const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * c.r
    const near = 1 - d / c.r
    const [lng, lat] = toLand([c.pos[0] + Math.cos(a) * d * 1.15, c.pos[1] + Math.sin(a) * d], 0.13)
    out.push([lng, lat, 0.5 + rnd() * 0.5, 0.18 + near * 0.55 + rnd() * 0.27])
  }
  return out
}
