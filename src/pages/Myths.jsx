import { lazy, Suspense, useEffect, useState } from 'react'
import StarMap from '../components/StarMap'
import GodPanel from '../components/GodPanel'
import VisitorChart from '../components/VisitorChart'
import Reveal from '../components/Reveal'
import PageHeader from '../components/PageHeader'
import { godById, pickGodForWeather } from '../data/gods'
import { Loading } from '../components/Status'
import { useAppStore } from '../store/useAppStore'

// three.js 는 용량이 커서 3D 를 처음 열 때만 불러온다
const StarMap3D = lazy(() => import('../components/StarMap3D'))
const JejuMap3D = lazy(() => import('../components/JejuMap3D'))

// 신들의 별자리 지도: 별을 누르면 신 소개와 관련 장소가 열립니다
export default function Myths() {
  const weather = useAppStore((s) => s.weather)
  const loadWeather = useAppStore((s) => s.loadWeather)
  useEffect(() => { loadWeather() }, [loadWeather])

  const today = pickGodForWeather(weather).god
  const [selectedId, setSelectedId] = useState(null)
  const [mode, setMode] = useState('2d')
  const selected = godById(selectedId ?? today.id)

  return (
    <>
      <PageHeader title="신들의 별자리" titleClass="title-shimmer flow flow-myths" desc="밤하늘의 별을 눌러 제주의 신을 만나 보세요. 테두리가 빛나는 별이 오늘의 신이에요." />
      <div className="row g-4 align-items-start">
        <div className="col-lg-7">
          <div className="view-toggle" role="tablist" aria-label="별자리 보기 방식">
            <button type="button" role="tab" aria-selected={mode === '2d'} className={mode === '2d' ? 'on' : ''} onClick={() => setMode('2d')}><i className="bi bi-diagram-3 me-1" />평면</button>
            <button type="button" role="tab" aria-selected={mode === '3d'} className={mode === '3d' ? 'on' : ''} onClick={() => setMode('3d')}><i className="bi bi-badge-3d me-1" />3D 별자리</button>
            <button type="button" role="tab" aria-selected={mode === 'map'} className={mode === 'map' ? 'on' : ''} onClick={() => setMode('map')}><i className="bi bi-globe-asia-australia me-1" />3D 지도</button>
          </div>
          {mode === '2d'
            ? <StarMap selectedId={selected.id} todayId={today.id} onSelect={setSelectedId} />
            : <Suspense fallback={<Loading text="3D 하늘을 여는 중…" />}>
              {mode === 'map'
                ? <JejuMap3D selectedId={selected.id} todayId={today.id} onSelect={setSelectedId} />
                : <StarMap3D selectedId={selected.id} todayId={today.id} onSelect={setSelectedId} />}
            </Suspense>}
        </div>
        <div className="col-lg-5"><GodPanel key={selected.id} god={selected} /></div>
      </div>
      <Reveal className="mt-4"><VisitorChart /></Reveal>
    </>
  )
}
