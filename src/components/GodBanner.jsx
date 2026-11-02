import { useEffect, useState } from 'react'
import { fetchPlaces } from '../api/client'
import { GOD_COLORS } from '../data/gods'
import GodArt from './GodArt'

// 신과 이어진 장소의 실제 사진(한국관광공사 TourAPI)을 찾는다. 없으면 null.
function useGodPhoto(god) {
  const [photo, setPhoto] = useState(null)
  useEffect(() => {
    let alive = true
    const kws = god.photo ? [god.photo] : god.places
    Promise.all(kws.map((kw) => fetchPlaces(kw).then((d) => d.items).catch(() => [])))
      .then((lists) => {
        const all = lists.flat().filter((x) => x.image)
        const p = all.find((x) => kws.some((kw) => x.title.includes(kw))) ?? all[0] // 검색어가 제목에 들어 있는 장소를 먼저
        if (alive) setPhoto(p ? { url: p.image, title: p.title } : null)
      })
    return () => { alive = false }
  }, [god])
  return photo
}

// 신 소개 위쪽 그림: 아래에는 직접 그린 일러스트, 사진이 뜨면 그 위로 실제 장소 사진이 깔리고
// 일러스트의 빛(별, 달, 불꽃 등)이 사진 위에 겹쳐 반짝인다.
export default function GodBanner({ god, className = '' }) {
  const photo = useGodPhoto(god)
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const on = photo && loaded && !failed ? 'on' : ''
  return (
    <div className={`god-banner ${className}`} style={{ '--c': GOD_COLORS[god.id] }}>
      <GodArt id={god.id} />
      {photo && !failed && (
        <img className={`gb-photo ${on}`} src={photo.url} alt="" loading="lazy" referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)} onError={() => setFailed(true)} />
      )}
      {photo && !failed && <div className={`gb-tint ${on}`} />}
      {photo && !failed && <GodArt id={god.id} overlay className={`gb-over ${on}`} />}
      {on && <span className="gb-credit"><i className="bi bi-camera me-1" />{photo.title} · 한국관광공사</span>}
    </div>
  )
}
