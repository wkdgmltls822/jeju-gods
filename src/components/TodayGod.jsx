import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { GOD_COLORS, pickGodForWeather } from '../data/gods'
import { useAppStore } from '../store/useAppStore'
import GodArt from './GodArt'

// 홈 화면: 오늘 날씨가 불러온 신 한 명
export default function TodayGod() {
  const weather = useAppStore((s) => s.weather)
  const loadWeather = useAppStore((s) => s.loadWeather)
  const setChatGod = useAppStore((s) => s.setChatGod)
  useEffect(() => { loadWeather() }, [loadWeather])

  const { god, reason } = pickGodForWeather(weather)
  const chips = weather ? [
    { icon: 'thermometer-half', text: `${weather.temp}°C` },
    { icon: 'cloud-sun', text: weather.sky },
    { icon: 'wind', text: `${weather.wind}m/s` },
    { icon: 'droplet', text: `강수 ${weather.rainChance}%` },
  ] : []

  return (
    <section className="today-card" style={{ '--c': GOD_COLORS[god.id] }}>
      <div className="today-art">
        <GodArt id={god.id} />
        <span className="today-badge"><i className="bi bi-stars me-1" />오늘의 신</span>
      </div>
      <div className="today-body">
        {chips.length > 0 && (
          <div className="today-chips">
            {chips.map((c) => <span key={c.icon}><i className={`bi bi-${c.icon}`} />{c.text}</span>)}
          </div>
        )}
        <div className="today-tale"><i className="bi bi-book me-1" />{god.tale}</div>
        <h2 className="today-name serif">{god.name}</h2>
        <p className="today-role">{god.role}</p>
        <p className="today-reason"><i className="bi bi-quote" />{reason}</p>
        <p className="today-text">{god.text}</p>
        <div className="today-actions">
          <Link to="/myths" className="btn btn-yuchae px-3">별자리에서 만나기</Link>
          <Link to="/agent" className="btn btn-hanji px-3" onClick={() => setChatGod(god.id)}>
            <i className="bi bi-chat-quote me-1" />이 신과 대화
          </Link>
        </div>
      </div>
    </section>
  )
}
