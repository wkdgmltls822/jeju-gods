import { getVisitors } from '../server/visitors.js'

// GET /api/visitors
export default async function handler(req, res) {
  try {
    const data = await getVisitors()
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400') // 월별 자료라 자주 안 바뀐다
    res.status(200).json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
