import { getVisitors } from '../server/visitors.js'

// GET /api/visitors
export default async function handler(req, res) {
  try {
    res.status(200).json(await getVisitors())
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
