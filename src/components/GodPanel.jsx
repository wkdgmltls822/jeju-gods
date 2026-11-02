import { useEffect, useState } from 'react'
import { fetchPlaces } from '../api/client'
import FavoriteButton from './FavoriteButton'
import GodArt from './GodArt'
import { Empty, ErrorNote, Loading } from './Status'

// 선택한 신의 소개 + 그 신과 이어지는 장소(TourAPI)
export default function GodPanel({ god }) {
  const [places, setPlaces] = useState(null) // null: 불러오는 중
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true // 신이 바뀌면 부모가 key 로 이 컴포넌트를 새로 만들어서 상태는 처음부터 시작
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
      <GodArt id={god.id} className="god-art-banner" />
      <div className="d-flex justify-content-between align-items-center gap-2 mb-2">
        <span className="tale-chip"><i className="bi bi-book me-1" />{god.tale}</span>
        <FavoriteButton godId={god.id} />
      </div>
      <h2 className="h3 mb-1 serif">{god.name}</h2>
      <p className="accent mb-3"><i className="bi bi-stars me-1" />{god.role}</p>
      <p className="god-text">{god.text}</p>

      <h3 className="h6 sea mt-4 mb-2"><i className="bi bi-geo-alt me-1" />이 이야기와 이어지는 곳</h3>
      <ErrorNote error={error} text="장소를 불러오지 못했어요" />
      {!error && places === null && <Loading text="찾는 중…" />}
      {!error && places?.length === 0 && <Empty>관련 장소를 찾지 못했어요.</Empty>}
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
