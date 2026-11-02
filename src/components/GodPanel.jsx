import { useEffect, useState } from 'react'
import { fetchPlaces } from '../api/client'
import FavoriteButton from './FavoriteButton'

// 선택한 신의 소개 + 그 신과 이어지는 장소(TourAPI)
export default function GodPanel({ god }) {
  const [places, setPlaces] = useState(null) // null: 불러오는 중
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    setPlaces(null)
    setError('')
    Promise.all(god.places.map((kw) => fetchPlaces(kw).then((d) => d.items)))
      .then((lists) => {
        const seen = new Set()
        const all = lists.flat().filter((p) => !seen.has(p.id) && seen.add(p.id))
        if (alive) setPlaces(all.slice(0, 4))
      })
      .catch((e) => alive && setError(e.message))
    return () => { alive = false }
  }, [god])

  return (
    <article className="god-panel">
      <div className="d-flex justify-content-between align-items-start gap-2">
        <div className="tag">{god.tale}</div>
        <FavoriteButton godId={god.id} />
      </div>
      <h2 className="h3 mb-1">{god.name}</h2>
      <p className="accent mb-3">{god.role}</p>
      <p>{god.text}</p>

      <h3 className="h6 sea mt-4 mb-2"><i className="bi bi-geo-alt me-1" />이 이야기와 이어지는 곳</h3>
      {error && <p className="text-secondary small mb-0">장소를 불러오지 못했어요 ({error})</p>}
      {!error && places === null && <p className="text-secondary small mb-0">찾는 중…</p>}
      {!error && places?.length === 0 && <p className="text-secondary small mb-0">관련 장소를 찾지 못했어요.</p>}
      <ul className="list-unstyled place-list mb-0">
        {places?.map((p) => (
          <li key={p.id}>
            <strong>{p.title}</strong>
            <span className="text-secondary small d-block">{p.address}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}
