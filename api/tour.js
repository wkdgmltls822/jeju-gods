import { searchTour } from '../server/tour.js'

// GET /api/tour?keyword=삼성혈
export default async function handler(req, res) {
  const { keyword, type } = req.query
  if (!keyword?.trim()) return res.status(400).json({ error: 'keyword 가 필요해요' })
  if (keyword.length > 50) return res.status(400).json({ error: 'keyword 는 50자 이내로 써 주세요' })
  try {
    const items = await searchTour({ keyword, contentTypeId: type })
    // 같은 검색은 Vercel 이 하루 동안 기억해 둔다 (공공데이터 하루 호출 한도를 아끼려고)
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800')
    res.status(200).json({ items })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
