import { getWeather } from '../server/weather.js'

// GET /api/weather?place=제주시
export default async function handler(req, res) {
  try {
    res.status(200).json(await getWeather({ place: req.query.place || '제주시' }))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
