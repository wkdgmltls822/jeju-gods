import { useEffect, useState } from 'react'
import { fetchPlaces } from '../api/client'
import FavoriteButton from './FavoriteButton'
import GodBanner from './GodBanner'
import { Empty, Loading } from './Status'
import { PINS } from '../lib/jeju'

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
      <GodBanner key={god.id} god={god} className="god-art-banner" />
      <div className="d-flex justify-content-between align-items-center gap-2 mb-2">
        <span className="tale-chip"><i className="bi bi-book me-1" />{god.tale}</span>
        <FavoriteButton godId={god.id} />
      </div>
      <h2 className="h3 mb-1 serif">{god.name}</h2>
      <p className="accent mb-3"><i className="bi bi-stars me-1" />{god.role}</p>
      <p className="god-text">{god.text}</p>

      <h3 className="h6 sea mt-4 mb-2"><i className="bi bi-geo-alt me-1" />이 이야기와 이어지는 곳</h3>
      {error && <PlaceFallback godId={god.id} />}
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

// 관광공사 서버가 쉴 때는 빨간 오류 대신, 우리가 알고 있는 대표 장소와 안내를 보여 준다
function PlaceFallback({ godId }) {
  const pin = PINS.find((p) => p.god === godId)
  return (
    <div className="place-soft" role="status">
      {pin && <p className="mb-1"><i className="bi bi-geo-alt-fill me-1" /><strong>{pin.place}</strong></p>}
      <p className="small text-secondary mb-0">관광공사 서버가 바빠서 자세한 주소와 사진은 잠시 뒤에 다시 보여 드릴게요. 별자리 화면을 다시 열어 보세요.</p>
    </div>
  )
}
