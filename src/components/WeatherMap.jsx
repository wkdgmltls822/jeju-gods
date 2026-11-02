import { useEffect, useMemo, useState } from 'react'
import { COAST } from '../lib/jeju'
import { fetchWeather } from '../api/client'
import { ErrorNote, Loading } from './Status'
import '../styles/wxmap.css'

// 지역별 날씨 지도 (평면): 제주섬 위에 다섯 곳의 예보를 올리고, 시간을 바꿔 가며 볼 수 있다.
const B = { w: 126.10, e: 127.02, n: 33.60, s: 33.08 }
const W = 800
const H = Math.round((W * (B.n - B.s) * 111) / ((B.e - B.w) * 92.5))
const px = (lng) => ((lng - B.w) / (B.e - B.w)) * W
const py = (lat) => ((B.n - lat) / (B.n - B.s)) * H

const REGIONS = [
  { name: '제주시', pos: [126.5312, 33.4996] }, { name: '한림', pos: [126.264, 33.4136] }, { name: '성산', pos: [126.9425, 33.4584] },
  { name: '서귀포시', pos: [126.5601, 33.2541] }, { name: '모슬포', pos: [126.253, 33.214] },
]
const ISLETS = [[126.95, 33.5, 9], [126.233, 33.418, 5], [126.148, 33.31, 5], [126.27, 33.17, 6], [126.265, 33.115, 6]]

// 해안선 점들을 부드러운 곡선으로 잇는다
const PTS = COAST.map(([lng, lat]) => [px(lng), py(lat)])
const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
const LAND = (() => {
  const n = PTS.length
  let d = `M${mid(PTS[n - 1], PTS[0]).map((v) => v.toFixed(1)).join(' ')}`
  for (let i = 0; i < n; i++) { const p = PTS[i], m = mid(p, PTS[(i + 1) % n]); d += ` Q${p[0].toFixed(1)} ${p[1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}` }
  return d + 'Z'
})()
const HALLA = [px(126.533), py(33.362)]

const hourOf = (t) => Number(t.slice(0, 2))
const isNight = (t) => hourOf(t) >= 19 || hourOf(t) < 6
const iconOf = (h) => (h.rain !== '없음' ? 'cloud-rain' : h.sky === '맑음' ? (isNight(h.time) ? 'moon-stars' : 'sun') : h.sky === '흐림' ? 'clouds' : 'cloud-sun')
const tempColor = (t) => (t <= 3 ? '#60a5fa' : t <= 10 ? '#38bdf8' : t <= 16 ? '#34d399' : t <= 22 ? '#fde047' : t <= 28 ? '#fb923c' : '#f87171')
const feel = (h) => (h.rain !== '없음' ? `${h.rain}가 와요. 우산을 챙기세요` : h.wind >= 7 ? '바람이 센 편이에요' : h.rainChance >= 50 ? '비가 올 수 있어요' : h.temp <= 5 ? '꽤 쌀쌀해요' : h.sky === '맑음' ? '하늘이 맑아요' : h.sky === '흐림' ? '구름이 잔뜩 꼈어요' : '구름이 흘러가요')

export default function WeatherMap({ patch = null }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [hour, setHour] = useState(0)
  const [sel, setSel] = useState('제주시')
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    let alive = true
    Promise.allSettled(REGIONS.map((r) => fetchWeather(r.name))).then((rs) => {
      if (!alive) return
      const d = {}
      rs.forEach((x, i) => { if (x.status === 'fulfilled') d[REGIONS[i].name] = x.value.hours })
      if (Object.keys(d).length === 0) setError(rs[0].reason?.message ?? '불러오지 못했어요')
      else setData(d)
    })
    return () => { alive = false }
  }, [])

  // 자동 재생: 시간을 1.3초마다 한 칸씩 넘긴다
  useEffect(() => {
    if (!playing) return undefined
    const t = setInterval(() => setHour((h) => (h + 1) % 8), 1300)
    return () => clearInterval(t)
  }, [playing])

  const view = useMemo(() => {
    if (!data) return null
    const out = {}
    for (const [name, hs] of Object.entries(data)) out[name] = patch ? hs.map((h) => ({ ...h, ...patch, time: h.time })) : hs
    return out
  }, [data, patch])

  if (error) return <ErrorNote error={error} text="지역별 날씨를 불러오지 못했어요" />
  if (!view) return <Loading text="지역별 날씨 불러오는 중…" />

  const first = Object.values(view)[0]
  const steps = first.length
  const at = Math.min(hour, steps - 1)
  const rows = REGIONS.map((r) => ({ ...r, h: view[r.name]?.[at] })).filter((r) => r.h)
  const cur = rows.find((r) => r.name === sel) ?? rows[0]
  const hot = [...rows].sort((a, b) => b.h.temp - a.h.temp)[0]
  const cold = [...rows].sort((a, b) => a.h.temp - b.h.temp)[0]
  const windy = [...rows].sort((a, b) => b.h.wind - a.h.wind)[0]
  const wet = [...rows].sort((a, b) => b.h.rainChance - a.h.rainChance)[0]
  const label = (h, i) => (i === 0 ? '지금' : `${hourOf(h.time)}시`)

  return (
    <section className="wm" aria-label="지역별 날씨 지도">
      <div className="wm-head">
        <h2 className="wm-title serif"><i className="bi bi-geo-alt-fill me-2" />제주 지역별 날씨 지도</h2>
        <span className="wm-sub">기상청 단기예보 · 지역을 눌러 보세요</span>
      </div>
      <div className="wm-body">
        <div className="wm-map" style={{ aspectRatio: `${W} / ${H}` }}>
          <svg viewBox={`0 0 ${W} ${H}`} className="wm-svg" role="img" aria-label="제주섬 지도">
            <defs>
              <linearGradient id="wm-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0d3b66" /><stop offset="1" stopColor="#0a2745" /></linearGradient>
              <linearGradient id="wm-land" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3f9a6c" /><stop offset=".55" stopColor="#2f7d5b" /><stop offset="1" stopColor="#2c6e50" /></linearGradient>
              <radialGradient id="wm-glow"><stop offset="0" stopColor="#7dd3fc" stopOpacity=".35" /><stop offset="1" stopColor="#7dd3fc" stopOpacity="0" /></radialGradient>
            </defs>
            <rect width={W} height={H} fill="url(#wm-sea)" />
            {[0.18, 0.4, 0.62, 0.84].map((f, i) => <path key={i} className="wm-wave" d={`M0 ${H * f} ` + Array.from({ length: 18 }, (_, k) => `Q${k * 60 + 30} ${H * f - 8} ${k * 60 + 60} ${H * f}`).join(' ')} style={{ animationDelay: `${i * -1.4}s` }} />)}
            <path d={LAND} className="wm-shore" />
            <path d={LAND} fill="url(#wm-land)" className="wm-land" />
            {ISLETS.map(([lng, lat, r], i) => <ellipse key={i} cx={px(lng)} cy={py(lat)} rx={r} ry={r * 0.7} className="wm-islet" />)}
            {[[74, 40], [56, 30], [38, 20], [20, 11]].map(([rx, ry], i) => <ellipse key={i} cx={HALLA[0]} cy={HALLA[1]} rx={rx} ry={ry} className="wm-contour" />)}
            <path d={`M${HALLA[0] - 8} ${HALLA[1] + 5} L${HALLA[0]} ${HALLA[1] - 8} L${HALLA[0] + 8} ${HALLA[1] + 5}Z`} className="wm-peak" />
            <text x={HALLA[0]} y={HALLA[1] + 22} textAnchor="middle" className="wm-name">한라산</text>
            <text x={px(126.95) + 14} y={py(33.5) - 8} className="wm-name small">우도</text>
            <text x={px(126.265) + 12} y={py(33.115) + 4} className="wm-name small">마라도</text>
            <circle cx={px(126.7)} cy={py(33.38)} r="140" fill="url(#wm-glow)" className="wm-halo" />
          </svg>
          {windy && windy.h.wind >= 4 && <div className="wm-windlines" aria-hidden="true">{Array.from({ length: 5 }, (_, i) => <i key={i} style={{ top: `${18 + i * 16}%`, animationDelay: `${i * 0.7}s`, animationDuration: `${Math.max(2.2, 5.5 - windy.h.wind * 0.3)}s` }} />)}</div>}
          {rows.map((r, i) => (
            <button key={r.name} type="button" className={`wm-pin ${r.name === cur.name ? 'on' : ''} ${r.h.rain !== '없음' ? 'rainy' : ''}`}
              style={{ left: `${(px(r.pos[0]) / W) * 100}%`, top: `${(py(r.pos[1]) / H) * 100}%`, '--tc': tempColor(r.h.temp), '--i': i }}
              onClick={() => setSel(r.name)} aria-label={`${r.name} ${r.h.temp}도 ${r.h.sky}`} aria-pressed={r.name === cur.name}>
              <span className="wm-bubble">
                <i className={`bi bi-${iconOf(r.h)} wm-ic`} />
                <b>{r.h.temp}°</b>
                {r.h.rain !== '없음' && <span className="wm-drops" aria-hidden="true"><u /><u /><u /></span>}
              </span>
              <span className="wm-pname">{r.name}</span>
            </button>
          ))}
        </div>

        <div className="wm-side">
          <div className="wm-card" style={{ '--tc': tempColor(cur.h.temp) }} key={cur.name}>
            <div className="wm-card-top">
              <div><span className="wm-card-name serif">{cur.name}</span><span className="wm-card-time">{label(cur.h, at)} 기준</span></div>
              <i className={`bi bi-${iconOf(cur.h)} wm-card-ic`} />
            </div>
            <div className="wm-card-temp">{cur.h.temp}<sup>°C</sup></div>
            <div className="wm-card-feel">{feel(cur.h)}</div>
            <div className="wm-bars">
              <div><span><i className="bi bi-droplet" />강수확률</span><b>{cur.h.rainChance}%</b><u><s style={{ width: `${cur.h.rainChance}%` }} /></u></div>
              <div><span><i className="bi bi-wind" />바람</span><b>{cur.h.wind}m/s</b><u><s style={{ width: `${Math.min(100, (cur.h.wind / 14) * 100)}%` }} /></u></div>
            </div>
          </div>
          <ul className="wm-facts">
            <li><i className="bi bi-thermometer-high" style={{ color: '#fb923c' }} />가장 따뜻한 곳 <b>{hot.name} {hot.h.temp}°</b></li>
            <li><i className="bi bi-thermometer-low" style={{ color: '#38bdf8' }} />가장 시원한 곳 <b>{cold.name} {cold.h.temp}°</b></li>
            <li><i className="bi bi-wind" style={{ color: '#c4b5fd' }} />바람이 센 곳 <b>{windy.name} {windy.h.wind}m/s</b></li>
            <li><i className="bi bi-umbrella" style={{ color: '#7dd3fc' }} />비 소식 <b>{wet.h.rainChance >= 30 ? `${wet.name} ${wet.h.rainChance}%` : '거의 없어요'}</b></li>
          </ul>
        </div>
      </div>

      <div className="wm-time">
        <button type="button" className={`wm-play ${playing ? 'on' : ''}`} onClick={() => setPlaying(!playing)} aria-label={playing ? '자동 재생 멈추기' : '시간 자동 재생'}>
          <i className={`bi bi-${playing ? 'pause-fill' : 'play-fill'}`} />
        </button>
        <div className="wm-slider">
          <input type="range" min="0" max={steps - 1} value={at} onChange={(e) => { setPlaying(false); setHour(Number(e.target.value)) }} aria-label="시간 고르기" />
          <div className="wm-ticks">{first.map((h, i) => <span key={h.date + h.time} className={i === at ? 'on' : ''}>{label(h, i)}</span>)}</div>
        </div>
      </div>
      <div className="wm-legend" aria-hidden="true">
        {[['≤3°', '#60a5fa'], ['4~10°', '#38bdf8'], ['11~16°', '#34d399'], ['17~22°', '#fde047'], ['23~28°', '#fb923c'], ['29°↑', '#f87171']].map(([t, c]) => <span key={t}><i style={{ background: c }} />{t}</span>)}
      </div>
    </section>
  )
}
