// 화면이 서버 함수(/api/...)를 부르는 함수 모음.
// 공공데이터 API는 브라우저에서 직접 부르지 않고 반드시 /api 를 거칩니다 (키 노출·CORS 방지).
export async function get(path) {
  const r = await fetch(path)
  const data = await r.json().catch(() => {
    throw new Error(`서버 응답이 JSON이 아님 (${r.status})`)
  })
  if (!r.ok) throw new Error(data.error || r.statusText)
  return data
}

export async function post(path, body) {
  const r = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const data = await r.json().catch(() => {
    throw new Error(`서버 응답이 JSON이 아님 (${r.status})`)
  })
  if (!r.ok) throw new Error(data.error || r.statusText)
  return data
}

export const askAgent = (message, history, godId) => post('/api/agent', { message, history, godId })
export const ping = () => get('/api/hello') // 동작 체크용

// ── 캐시: 같은 데이터를 화면 여러 곳·여러 번 불러도 서버에는 한 번만 묻는다 ──
//  1) 같은 요청이 동시에 오면 하나로 합친다  2) 유효 시간 안에는 저장해 둔 값을 쓴다(새로고침해도 유지: localStorage)
//  3) 실패하면(한도 초과 등) 예전 값이 있으면 그걸로 버티고, 없으면 30초 동안은 같은 오류를 돌려줘 서버를 두드리지 않는다
const mem = new Map() // key -> { value, exp }
const inflight = new Map()
const failed = new Map() // key -> { err, until }
const FAIL_MS = 30_000
const LS = 'jeju-cache:'

const readLS = (key) => { try { return JSON.parse(localStorage.getItem(LS + key)) } catch { return null } }
const writeLS = (key, value, exp) => { try { localStorage.setItem(LS + key, JSON.stringify({ value, exp })) } catch { /* 저장 공간이 없거나 막혀 있어도 화면은 정상 동작 */ } }

function cached(key, ttlMs, load) {
  const now = Date.now()
  let hit = mem.get(key)
  if (!hit) { hit = readLS(key); if (hit) mem.set(key, hit) }
  if (hit && hit.exp > now) return Promise.resolve(hit.value)
  if (inflight.has(key)) return inflight.get(key)
  const f = failed.get(key)
  if (f && f.until > now) return hit ? Promise.resolve(hit.value) : Promise.reject(f.err)

  const p = load().then(
    (value) => { const rec = { value, exp: Date.now() + ttlMs }; mem.set(key, rec); writeLS(key, value, rec.exp); failed.delete(key); return value },
    (err) => {
      failed.set(key, { err, until: Date.now() + FAIL_MS })
      if (hit) return hit.value // 예전 값(기한이 지났어도)으로 버틴다
      throw err
    },
  ).finally(() => inflight.delete(key))
  inflight.set(key, p)
  return p
}

export const fetchVisitors = () => cached('visitors', 3600_000, () => get('/api/visitors'))
export const fetchWeather = (place = '제주시') => cached(`weather:${place}`, 10 * 60_000, () => get(`/api/weather?place=${encodeURIComponent(place)}`))
// 신 소개 패널과 사진 배너가 같은 장소를 찾으므로 같은 검색은 한 번만 (장소 정보는 잘 바뀌지 않아 하루)
export const fetchPlaces = (keyword) => cached(`tour:${keyword}`, 24 * 3600_000, () => get(`/api/tour?keyword=${encodeURIComponent(keyword)}`))
