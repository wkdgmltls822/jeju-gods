import { searchTour } from '../server/tour.js'

// GET /api/tour?keyword=삼성혈
export default async function handler(req, res) {
  const { keyword, type } = req.query
  if (!keyword?.trim()) return res.status(400).json({ error: 'keyword 가 필요해요' })
  if (keyword.length > 50) return res.status(400).json({ error: 'keyword 는 50자 이내로 써 주세요' })
  try {
    res.status(200).json({ items: await searchTour({ keyword, contentTypeId: type }) })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
