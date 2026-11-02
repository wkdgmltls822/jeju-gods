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
export const fetchVisitors = () => get('/api/visitors')
export const fetchWeather = (place = '제주시') => get(`/api/weather?place=${encodeURIComponent(place)}`)
// 신 소개 패널과 사진 배너가 같은 장소를 찾으므로, 같은 검색은 한 번만 서버에 묻는다
const placeCache = new Map()
export const fetchPlaces = (keyword) => {
  if (!placeCache.has(keyword)) {
    placeCache.set(keyword, get(`/api/tour?keyword=${encodeURIComponent(keyword)}`).catch((e) => { placeCache.delete(keyword); throw e }))
  }
  return placeCache.get(keyword)
}
