import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { ErrorNote, Loading } from '../components/Status'
import { GOD_COLORS, pickGodForWeather } from '../data/gods'
import { useAppStore } from '../store/useAppStore'

const ICON = { 맑음: 'sun', 구름많음: 'cloud-sun', 흐림: 'clouds' }
const iconOf = (w) => (w.rain === '없음' ? ICON[w.sky] ?? 'cloud' : 'cloud-rain')
const hourLabel = (t) => `${Number(t.slice(0, 2))}시`

// 날씨 메뉴: 기상청 단기예보로 보는 오늘의 제주 하늘, 그리고 그 하늘이 불러온 신
export default function Weather() {
  const { weather, forecast, weatherError, loadWeather, setChatGod } = useAppStore()
  useEffect(() => { loadWeather() }, [loadWeather])

  if (weatherError) return <><PageHeader title="오늘의 제주 날씨" /><ErrorNote error={weatherError} text="날씨를 불러오지 못했어요" /></>
  if (!weather) return <><PageHeader title="오늘의 제주 날씨" /><Loading text="날씨 불러오는 중…" /></>

  const { god, reason } = pickGodForWeather(weather)
  const stats = [
    { icon: 'thermometer-half', label: '기온', value: `${weather.temp}°C` },
    { icon: 'wind', label: '바람', value: `${weather.wind}m/s` },
    { icon: 'droplet', label: '강수확률', value: `${weather.rainChance}%` },
    { icon: 'cloud-rain', label: '강수', value: weather.rain },
  ]

  return (
    <>
      <PageHeader title="오늘의 제주 날씨" desc="기상청 단기예보로 본 제주시의 하늘이에요. 날씨마다 어울리는 신이 찾아옵니다." />

      <section className="wx-now">
        <div className="wx-main">
          <i className={`bi bi-${iconOf(weather)} wx-icon`} />
          <div>
            <div className="wx-temp">{weather.temp}°</div>
            <div className="wx-sky">제주시 · {weather.rain === '없음' ? weather.sky : weather.rain}</div>
          </div>
        </div>
        <div className="wx-stats">
          {stats.map((s) => (
            <div key={s.label} className="wx-stat"><i className={`bi bi-${s.icon}`} /><span>{s.label}</span><b>{s.value}</b></div>
          ))}
        </div>
      </section>

      {forecast.length > 1 && (
        <section className="wx-hours" aria-label="시간대별 예보">
          {forecast.map((h) => (
            <div key={h.date + h.time} className="wx-hour">
              <span>{hourLabel(h.time)}</span>
              <i className={`bi bi-${iconOf(h)}`} />
              <b>{h.temp}°</b>
              <small>{h.rainChance}%</small>
            </div>
          ))}
        </section>
      )}

      <section className="wx-god" style={{ '--c': GOD_COLORS[god.id] }}>
        <div className="today-tale"><i className="bi bi-stars me-1" />오늘 날씨가 부른 신</div>
        <h2 className="serif mb-1">{god.name}</h2>
        <p className="today-role mb-2">{god.role}</p>
        <p className="today-reason mb-3"><i className="bi bi-quote" />{reason}</p>
        <div className="today-actions">
          <Link to="/" className="btn btn-yuchae px-3">오늘의 신 보기</Link>
          <Link to="/agent" className="btn btn-hanji px-3" onClick={() => setChatGod(god.id)}>
            <i className="bi bi-chat-quote me-1" />이 신과 대화
          </Link>
        </div>
      </section>
    </>
  )
}
