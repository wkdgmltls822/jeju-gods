import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import GodBanner from '../components/GodBanner'
import { ErrorNote, Loading } from '../components/Status'
import { GOD_COLORS, pickGodForWeather } from '../data/gods'
import { useAppStore } from '../store/useAppStore'

const SKY_ICON = { 맑음: 'sun', 구름많음: 'cloud-sun', 흐림: 'clouds' }
const hourOf = (t) => Number(t.slice(0, 2))
const isNight = (t) => hourOf(t) >= 19 || hourOf(t) < 6

const DEMO = {
  rain: { rain: '비', sky: '흐림', rainChance: 80, wind: 6 },
  cloud: { rain: '없음', sky: '흐림', rainChance: 30 },
  night: { rain: '없음', sky: '맑음', time: '2100' },
  sun: { rain: '없음', sky: '맑음', time: '1300' },
}

// 날씨 한 줄 → 아이콘 (비면 비 구름, 밤에 맑으면 달)
const iconOf = (w) => {
  if (w.rain !== '없음') return 'cloud-rain'
  if (w.sky === '맑음' && isNight(w.time)) return 'moon-stars'
  return SKY_ICON[w.sky] ?? 'cloud'
}
// 카드 배경과 움직이는 장식을 고르는 종류
const kindOf = (w) => (w.rain !== '없음' ? 'rain' : w.sky === '맑음' ? (isNight(w.time) ? 'night' : 'sun') : 'cloud')

const sentence = (w) => {
  if (w.rain !== '없음') return `${w.rain}가 와요. 우산을 챙기세요`
  if (w.wind >= 7) return '바람이 센 날이에요'
  if (w.rainChance >= 50) return '비가 올 수 있어요'
  if (w.temp <= 5) return '꽤 쌀쌀해요'
  if (w.sky === '맑음') return isNight(w.time) ? '맑은 밤하늘이에요' : '하늘이 맑아요'
  return w.sky === '흐림' ? '구름이 잔뜩 꼈어요' : '구름이 흘러가요'
}

// 시간대별 기온 곡선: 위쪽이 더 따뜻한 시각
function Hours({ forecast }) {
  const temps = forecast.map((h) => h.temp)
  const max = Math.max(...temps), min = Math.min(...temps)
  const range = Math.max(max - min, 4)
  const n = forecast.length
  const y = (t) => 34 + ((max - t) / range) * 46 // 34~80 % (위쪽은 기온 글자 자리)
  const line = forecast.map((h, i) => `${i === 0 ? 'M' : 'L'}${((i + 0.5) / n) * 100} ${y(h.temp)}`).join(' ')
  const area = `${line} L${((n - 0.5) / n) * 100} 100 L${(0.5 / n) * 100} 100Z`
  return (
    <section className="wx-hours" aria-label="시간대별 예보" style={{ '--n': n }}>
      <svg className="wx-curve" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="wx-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7dd3fc" stopOpacity=".35" /><stop offset="1" stopColor="#7dd3fc" stopOpacity="0" /></linearGradient>
        </defs>
        <path d={area} fill="url(#wx-fill)" />
        <path d={line} fill="none" stroke="#7dd3fc" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      </svg>
      {forecast.map((h, i) => (
        <div key={h.date + h.time} className={`wx-hour ${i === 0 ? 'now' : ''}`}>
          <span className="wx-h-time">{i === 0 ? '지금' : `${hourOf(h.time)}시`}</span>
          <i className={`bi bi-${iconOf(h)}`} />
          <div className="wx-h-plot"><b style={{ top: `${y(h.temp)}%` }}><em>{h.temp}°</em></b></div>
          <div className="wx-h-rain" title={`강수확률 ${h.rainChance}%`}><i style={{ height: `${Math.max(h.rainChance, 4)}%` }} /></div>
          <small>{h.rainChance}%</small>
        </div>
      ))}
    </section>
  )
}

// 날씨 메뉴: 기상청 단기예보로 보는 오늘의 제주 하늘, 그리고 그 하늘이 불러온 신
export default function Weather() {
  const { weather: realWeather, forecast: realForecast, weatherError, loadWeather, setChatGod } = useAppStore()
  useEffect(() => { loadWeather() }, [loadWeather])

  // 개발 중에만: /weather?wx=rain|cloud|night|sun 으로 다른 하늘 모습을 미리 본다
  const patch = import.meta.env.DEV ? DEMO[new URLSearchParams(location.search).get('wx')] : null
  const weather = realWeather && patch ? { ...realWeather, ...patch } : realWeather
  const forecast = patch ? realForecast.map((h) => ({ ...h, ...patch, time: h.time })) : realForecast

  if (weatherError) return <><PageHeader title="오늘의 제주 날씨" titleClass="title-shimmer flow" /><ErrorNote error={weatherError} text="날씨를 불러오지 못했어요" /></>
  if (!weather) return <><PageHeader title="오늘의 제주 날씨" titleClass="title-shimmer flow" /><Loading text="날씨 불러오는 중…" /></>

  const { god, reason } = pickGodForWeather(weather)
  const kind = kindOf(weather)
  const stats = [
    { icon: 'wind', label: '바람', value: `${weather.wind}m/s`, bar: Math.min(100, (weather.wind / 14) * 100) },
    { icon: 'droplet', label: '강수확률', value: `${weather.rainChance}%`, bar: weather.rainChance },
    { icon: 'cloud-rain', label: '강수', value: weather.rain },
    { icon: 'clouds', label: '하늘', value: weather.sky },
  ]

  return (
    <>
      <PageHeader title="오늘의 제주 날씨" titleClass={`title-shimmer flow flow-${kind}`} desc="기상청 단기예보로 본 제주시의 하늘이에요. 날씨마다 어울리는 신이 찾아옵니다." />

      <section className={`wx-hero wx-${kind}`}>
        {/* 날씨에 맞춰 움직이는 배경 */}
        <div className="wx-deco" aria-hidden="true">
          {(kind === 'sun' || kind === 'night') && <span className="wx-orb" />}
          {kind !== 'rain' && <span className="wx-cloud c1" />}
          {(kind === 'cloud' || kind === 'rain') && <><span className="wx-cloud c2" /><span className="wx-cloud c3" /></>}
          {kind === 'rain' && <span className="wx-drops" />}
          {kind === 'night' && Array.from({ length: 14 }, (_, i) => <span key={i} className="wx-star" style={{ left: `${(i * 37) % 100}%`, top: `${(i * 23) % 60}%`, animationDelay: `${(i % 5) * 0.5}s` }} />)}
        </div>
        <div className="wx-main">
          <i className={`bi bi-${iconOf(weather)} wx-icon`} />
          <div>
            <div className="wx-place"><i className="bi bi-geo-alt-fill me-1" />제주시 · {hourOf(weather.time)}시 기준</div>
            <div className="wx-temp">{weather.temp}<sup>°C</sup></div>
            <div className="wx-sky">{sentence(weather)}</div>
          </div>
        </div>
        <div className="wx-stats">
          {stats.map((s) => (
            <div key={s.label} className="wx-stat">
              <i className={`bi bi-${s.icon}`} /><span>{s.label}</span><b>{s.value}</b>
              {s.bar !== undefined && <u><s style={{ width: `${s.bar}%` }} /></u>}
            </div>
          ))}
        </div>
      </section>

      {forecast.length > 1 && <Hours forecast={forecast} />}

      <div className="wx-god-title"><i className="bi bi-stars me-1" />오늘 날씨가 부른 신</div>
      <section className="today-card" style={{ '--c': GOD_COLORS[god.id] }}>
        <div className="today-art"><GodBanner key={god.id} god={god} /></div>
        <div className="today-body">
          <div className="today-tale"><i className="bi bi-book me-1" />{god.tale}</div>
          <h2 className="today-name serif">{god.name}</h2>
          <p className="today-role">{god.role}</p>
          <p className="today-reason"><i className="bi bi-quote" />{reason}</p>
          <div className="today-actions">
            <Link to="/myths" className="btn btn-yuchae px-3">별자리에서 만나기</Link>
            <Link to="/agent" className="btn btn-hanji px-3" onClick={() => setChatGod(god.id)}>
              <i className="bi bi-chat-quote me-1" />이 신과 대화
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
