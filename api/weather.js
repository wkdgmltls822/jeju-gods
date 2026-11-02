import { getWeather, PLACES } from '../server/weather.js'

// GET /api/weather?place=제주시
export default async function handler(req, res) {
  const place = req.query.place || '제주시'
  if (!PLACES.includes(place)) return res.status(400).json({ error: `place 는 ${PLACES.join(', ')} 중 하나여야 해요` })
  try {
    const data = await getWeather({ place })
    // 예보는 3시간마다 바뀌므로 10분 동안은 Vercel 이 기억해 둔다 (공공데이터 호출을 아끼려고)
    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=3600')
    res.status(200).json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
