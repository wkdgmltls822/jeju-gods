import { getWeather, PLACES } from '../server/weather.js'

// GET /api/weather?place=제주시
export default async function handler(req, res) {
  const place = req.query.place || '제주시'
  if (!PLACES.includes(place)) return res.status(400).json({ error: `place 는 ${PLACES.join(', ')} 중 하나여야 해요` })
  try {
    res.status(200).json(await getWeather({ place }))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
