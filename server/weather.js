// 기상청 단기예보 조회서비스 — 제주시·서귀포시 등 지역별 앞으로 몇 시간 예보
const URL_BASE = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst'

// 기상청 격자 좌표
// 한림·성산·모슬포는 위도·경도를 기상청 격자로 바꿔 구한 값이다 (지역별 날씨 지도에서 쓴다)
const GRID = {
  제주시: { nx: 52, ny: 38 }, 한림: { nx: 48, ny: 36 }, 성산: { nx: 60, ny: 37 }, 서귀포시: { nx: 52, ny: 33 }, 모슬포: { nx: 48, ny: 32 },
}

export const PLACES = Object.keys(GRID)

const SKY = { 1: '맑음', 3: '구름많음', 4: '흐림' }
const PTY = { 0: '없음', 1: '비', 2: '비/눈', 3: '눈', 4: '소나기' }

// 단기예보는 하루 8번(02·05·08·11·14·17·20·23시) 발표되고, 발표 10분 뒤부터 조회됩니다.
function latestBase() {
  const kst = new Date(Date.now() + 9 * 3600 * 1000) // 서버 시간대와 무관하게 한국 시간으로
  const slots = [2, 5, 8, 11, 14, 17, 20, 23]
  let day = new Date(kst)
  const minutes = kst.getUTCHours() * 60 + kst.getUTCMinutes()
  let hour = [...slots].reverse().find((h) => minutes >= h * 60 + 10)
  if (hour === undefined) { // 오늘 02:10 이전이면 어제 23시 발표분
    hour = 23
    day = new Date(kst.getTime() - 24 * 3600 * 1000)
  }
  const ymd = day.toISOString().slice(0, 10).replaceAll('-', '')
  return { base_date: ymd, base_time: String(hour).padStart(2, '0') + '00' }
}

export async function getWeather({ place = '제주시' } = {}) {
  const key = process.env.DATA_GO_KR_KEY
  if (!key) throw new Error('DATA_GO_KR_KEY 가 없어요 (.env.local 확인)')
  const grid = GRID[place]
  if (!grid) throw new Error(`place 는 ${Object.keys(GRID).join(', ')} 중 하나여야 해요`)

  const params = new URLSearchParams({
    serviceKey: key, pageNo: '1', numOfRows: '300', dataType: 'JSON',
    ...latestBase(), nx: grid.nx, ny: grid.ny,
  })
  const r = await fetch(`${URL_BASE}?${params}`)
  const j = await r.json().catch(() => { throw new Error(`기상청 응답이 JSON이 아님 (${r.status})`) })
  const header = j.response?.header
  if (header?.resultCode !== '00') throw new Error(`기상청 오류: ${header?.resultMsg ?? r.status}`)

  // 항목(category)별로 흩어진 값을 시간별 한 줄로 합칩니다
  const byTime = {}
  for (const i of j.response.body.items.item) {
    const t = (byTime[`${i.fcstDate}${i.fcstTime}`] ??= { date: i.fcstDate, time: i.fcstTime })
    t[i.category] = i.fcstValue
  }
  const hours = Object.values(byTime)
    .filter((t) => t.TMP !== undefined)
    .slice(0, 8)
    .map((t) => ({
      date: t.date,
      time: t.time,
      temp: Number(t.TMP),
      sky: SKY[t.SKY] ?? '-',
      rain: PTY[t.PTY] ?? '-',
      rainChance: Number(t.POP),
      wind: Number(t.WSD),
    }))
  return { place, hours }
}
