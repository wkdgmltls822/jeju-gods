import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'

const ICON = { 맑음: 'sun', 구름많음: 'cloud-sun', 흐림: 'clouds' }

// 기상청 단기예보로 보는 "오늘 제주의 하늘"
export default function WeatherBadge() {
  const weather = useAppStore((s) => s.weather)
  const error = useAppStore((s) => s.weatherError)
  const loadWeather = useAppStore((s) => s.loadWeather)
  useEffect(() => { loadWeather() }, [loadWeather])

  if (error) return <span className="badge text-bg-secondary" title={error}>날씨를 불러오지 못했어요</span>
  if (!weather) return <span className="badge text-bg-secondary">날씨 불러오는 중…</span>

  const icon = weather.rain === '없음' ? ICON[weather.sky] ?? 'cloud' : 'cloud-rain'
  return (
    <span className="badge rounded-pill px-3 py-2 weather-badge">
      <i className={`bi bi-${icon} me-2`} />
      제주시 {weather.temp}°C · {weather.rain === '없음' ? weather.sky : weather.rain} · 강수확률 {weather.rainChance}%
    </span>
  )
}
