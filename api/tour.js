import { searchTour } from '../server/tour.js'

// GET /api/tour?keyword=삼성혈
export default async function handler(req, res) {
  try {
    const { keyword, type } = req.query
    res.status(200).json({ items: await searchTour({ keyword, contentTypeId: type }) })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
