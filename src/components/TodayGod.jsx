import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { pickGodForWeather } from '../data/gods'
import { useAppStore } from '../store/useAppStore'

// 홈 화면: 오늘 날씨가 불러온 신 한 명
export default function TodayGod() {
  const weather = useAppStore((s) => s.weather)
  const loadWeather = useAppStore((s) => s.loadWeather)
  useEffect(() => { loadWeather() }, [loadWeather])

  const { god, reason } = pickGodForWeather(weather)
  return (
    <section className="today-god mx-auto">
      <div className="tag mb-2"><i className="bi bi-stars me-1" />오늘의 신</div>
      <h2 className="h2 mb-1">{god.name}</h2>
      <p className="accent mb-2">{god.role}</p>
      <p className="mb-2">{reason}</p>
      <p className="text-secondary mb-3">{god.text}</p>
      <Link to="/myths" className="btn btn-hanji btn-sm">별자리에서 만나기</Link>
    </section>
  )
}
