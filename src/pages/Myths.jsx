import { useEffect, useState } from 'react'
import StarMap from '../components/StarMap'
import GodPanel from '../components/GodPanel'
import VisitorChart from '../components/VisitorChart'
import Reveal from '../components/Reveal'
import PageHeader from '../components/PageHeader'
import { godById, pickGodForWeather } from '../data/gods'
import { useAppStore } from '../store/useAppStore'

// 신들의 별자리 지도: 별을 누르면 신 소개와 관련 장소가 열립니다
export default function Myths() {
  const weather = useAppStore((s) => s.weather)
  const loadWeather = useAppStore((s) => s.loadWeather)
  useEffect(() => { loadWeather() }, [loadWeather])

  const today = pickGodForWeather(weather).god
  const [selectedId, setSelectedId] = useState(null)
  const selected = godById(selectedId ?? today.id)

  return (
    <>
      <PageHeader title="신들의 별자리" desc="밤하늘의 별을 눌러 제주의 신을 만나 보세요. 테두리가 빛나는 별이 오늘의 신이에요." />
      <div className="row g-4 align-items-start">
        <div className="col-lg-7"><StarMap selectedId={selected.id} todayId={today.id} onSelect={setSelectedId} /></div>
        <div className="col-lg-5"><GodPanel key={selected.id} god={selected} /></div>
      </div>
      <Reveal className="mt-4"><VisitorChart /></Reveal>
    </>
  )
}
