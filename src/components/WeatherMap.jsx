import { useEffect, useMemo, useRef, useState } from 'react'
import { COAST } from '../lib/jeju'
import { fetchWeather } from '../api/client'
import { ErrorNote, Loading } from './Status'
import '../styles/wxmap.css'

// 지역별 날씨 지도 (평면): 읍·면 13곳의 예보를 올리고, 확대·이동하며 기온/강수/바람을 바꿔 가며 볼 수 있다.
const B = { w: 126.10, e: 127.02, n: 33.60, s: 33.08 }
const W = 800
const H = Math.round((W * (B.n - B.s) * 111) / ((B.e - B.w) * 92.5))
const px = (lng) => ((lng - B.w) / (B.e - B.w)) * W
const py = (lat) => ((B.n - lat) / (B.n - B.s)) * H

const REGIONS = [
  { name: '제주시', pos: [126.5312, 33.4996] }, { name: '조천', pos: [126.635, 33.543] }, { name: '구좌', pos: [126.86, 33.525] }, { name: '성산', pos: [126.9425, 33.4584] },
  { name: '애월', pos: [126.331, 33.463] }, { name: '한림', pos: [126.264, 33.4136] }, { name: '한경', pos: [126.163, 33.294] }, { name: '대정', pos: [126.253, 33.214] },
  { name: '안덕', pos: [126.335, 33.242] }, { name: '서귀포시', pos: [126.5601, 33.2541] }, { name: '남원', pos: [126.714, 33.277] }, { name: '표선', pos: [126.833, 33.326] },
  { name: '한라산', pos: [126.533, 33.362] },
]
const ISLETS = [[126.95, 33.5, 9], [126.233, 33.418, 5], [126.148, 33.31, 5], [126.27, 33.17, 6], [126.265, 33.115, 6]]
const MODES = [{ id: 'temp', label: '기온', icon: 'thermometer-half' }, { id: 'rain', label: '강수', icon: 'umbrella' }, { id: 'wind', label: '바람', icon: 'wind' }]
const MAXK = 4

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
const rainColor = (p) => (p < 20 ? '#7c8aa5' : p < 40 ? '#60a5fa' : p < 60 ? '#38bdf8' : p < 80 ? '#818cf8' : '#a78bfa')
const windColor = (w) => (w < 3 ? '#34d399' : w < 6 ? '#a3e635' : w < 9 ? '#fde047' : w < 12 ? '#fb923c' : '#f87171')
const DIRS = ['북', '북동', '동', '남동', '남', '남서', '서', '북서']
const dirName = (deg) => (deg == null ? '-' : `${DIRS[Math.round(deg / 45) % 8]}풍`)
const feel = (h) => (h.rain !== '없음' ? `${h.rain}가 와요. 우산을 챙기세요` : h.wind >= 7 ? '바람이 센 편이에요' : h.rainChance >= 50 ? '비가 올 수 있어요' : h.temp <= 5 ? '꽤 쌀쌀해요' : h.sky === '맑음' ? '하늘이 맑아요' : h.sky === '흐림' ? '구름이 잔뜩 꼈어요' : '구름이 흘러가요')
const modeOf = (mode, h) => (mode === 'temp' ? { val: `${h.temp}°`, color: tempColor(h.temp) } : mode === 'rain' ? { val: `${h.rainChance}%`, color: rainColor(h.rainChance) } : { val: `${h.wind}`, color: windColor(h.wind) })

const LEGENDS = {
  temp: [['≤3°', '#60a5fa'], ['4~10°', '#38bdf8'], ['11~16°', '#34d399'], ['17~22°', '#fde047'], ['23~28°', '#fb923c'], ['29°↑', '#f87171']],
  rain: [['<20%', '#7c8aa5'], ['20~39%', '#60a5fa'], ['40~59%', '#38bdf8'], ['60~79%', '#818cf8'], ['80%↑', '#a78bfa']],
  wind: [['<3m/s', '#34d399'], ['3~5', '#a3e635'], ['6~8', '#fde047'], ['9~11', '#fb923c'], ['12↑', '#f87171']],
}

// 선택한 지역의 시간별 기온 곡선(위)과 강수확률 막대(아래). 칸을 누르면 그 시각으로 이동한다.
function MiniChart({ hours, at, onPick, color }) {
  const n = hours.length
  const ts = hours.map((h) => h.temp)
  const max = Math.max(...ts), min = Math.min(...ts), range = Math.max(max - min, 3)
  const x = (i) => ((i + 0.5) / n) * 240
  const y = (t) => 10 + ((max - t) / range) * 30
  const line = hours.map((h, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(h.temp).toFixed(1)}`).join(' ')
  return (
    <svg className="wm-mini" viewBox="0 0 240 78" role="img" aria-label="시간별 기온과 강수확률">
      <path d={`${line} L${x(n - 1)} 48 L${x(0)} 48Z`} fill={color} opacity=".14" />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" className="wm-mini-line" />
      {hours.map((h, i) => (
        <g key={h.date + h.time} onClick={() => onPick(i)} className="wm-mini-col" style={{ cursor: 'pointer' }}>
          <rect x={x(i) - 15} y="0" width="30" height="78" fill="transparent" />
          <rect x={x(i) - 5} y={78 - Math.max(2, (h.rainChance / 100) * 22)} width="10" height={Math.max(2, (h.rainChance / 100) * 22)} rx="3" fill="#7dd3fc" opacity={i === at ? 0.95 : 0.4} />
          <circle cx={x(i)} cy={y(h.temp)} r={i === at ? 4.6 : 2.8} fill={i === at ? '#fff' : color} />
          {i === at && <circle cx={x(i)} cy={y(h.temp)} r="9" fill="none" stroke={color} className="wm-mini-ring" />}
          <text x={x(i)} y="62" textAnchor="middle" className={i === at ? 'on' : ''}>{i === 0 ? '지금' : hourOf(h.time)}</text>
        </g>
      ))}
    </svg>
  )
}

export default function WeatherMap({ patch = null }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [failed, setFailed] = useState(0)
  const [hour, setHour] = useState(0)
  const [sel, setSel] = useState('제주시')
  const [playing, setPlaying] = useState(false)
  const [mode, setMode] = useState('temp')
  const [view, setView] = useState({ k: 1, x: 0, y: 0 })
  const mapRef = useRef(null)
  const drag = useRef(null)
  const moved = useRef(0)

  // 13곳을 네 곳씩 나눠 불러온다: 도착하는 대로 핀이 하나씩 나타나고, 기상청 서버에 한꺼번에 몰리지 않는다
  useEffect(() => {
    let alive = true
    ;(async () => {
      const acc = {}
      let ok = 0, bad = 0, firstErr = ''
      for (let i = 0; i < REGIONS.length; i += 4) {
        const chunk = REGIONS.slice(i, i + 4)
        const rs = await Promise.allSettled(chunk.map((r) => fetchWeather(r.name)))
        if (!alive) return
        rs.forEach((x, j) => {
          if (x.status === 'fulfilled') { acc[chunk[j].name] = x.value.hours; ok++ } else { bad++; firstErr ||= x.reason?.message ?? '' }
        })
        if (ok) setData({ ...acc })
      }
      setFailed(bad)
      if (!ok) setError(firstErr || '불러오지 못했어요')
    })()
    return () => { alive = false }
  }, [])

  // 자동 재생: 시간을 1.3초마다 한 칸씩 넘긴다
  useEffect(() => {
    if (!playing) return undefined
    const t = setInterval(() => setHour((h) => (h + 1) % 8), 1300)
    return () => clearInterval(t)
  }, [playing])

  const view2 = useMemo(() => {
    if (!data) return null
    const out = {}
    for (const [name, hs] of Object.entries(data)) out[name] = patch ? hs.map((h) => ({ ...h, ...patch, time: h.time })) : hs
    return out
  }, [data, patch])

  // 확대·이동: 지도 바깥으로 나가지 않게 가둔다
  const clampView = (v) => {
    const el = mapRef.current
    if (!el) return v
    const { width: w, height: h } = el.getBoundingClientRect()
    const k = Math.min(MAXK, Math.max(1, v.k))
    return { k, x: Math.min(0, Math.max(w * (1 - k), v.x)), y: Math.min(0, Math.max(h * (1 - k), v.y)) }
  }
  const zoomBy = (f) => {
    const el = mapRef.current
    if (!el) return
    const { width: w, height: h } = el.getBoundingClientRect()
    setView((v) => { const nk = Math.min(MAXK, Math.max(1, v.k * f)); const r = nk / v.k; return clampView({ k: nk, x: w / 2 - (w / 2 - v.x) * r, y: h / 2 - (h / 2 - v.y) * r }) })
  }
  const focusOn = (r) => {
    const el = mapRef.current
    if (!el) return
    const { width: w, height: h } = el.getBoundingClientRect()
    const k = 2.8
    setView(clampView({ k, x: w / 2 - (px(r.pos[0]) / W) * w * k, y: h / 2 - (py(r.pos[1]) / H) * h * k }))
  }
  const onDown = (e) => {
    if (view.k <= 1 || e.target.closest('.wm-ctl')) return
    drag.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y, d: 0 }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onMove = (e) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.x, dy = e.clientY - d.y
    d.d = Math.max(d.d, Math.hypot(dx, dy))
    setView((v) => clampView({ ...v, x: d.vx + dx, y: d.vy + dy }))
  }
  const onUp = () => {
    if (!drag.current) return
    moved.current = drag.current.d
    drag.current = null
    setTimeout(() => { moved.current = 0 }, 0)
  }

  if (error) return <ErrorNote error={error} text="지역별 날씨를 불러오지 못했어요" />
  if (!view2) return <Loading text="지역별 날씨 불러오는 중…" />

  const first = Object.values(view2)[0]
  const steps = first.length
  const at = Math.min(hour, steps - 1)
  const rows = REGIONS.map((r) => ({ ...r, h: view2[r.name]?.[at] })).filter((r) => r.h)
  const cur = rows.find((r) => r.name === sel) ?? rows[0]
  const curHours = view2[cur.name]
  const best = (fn) => [...rows].sort(fn)[0]
  const hot = best((a, b) => b.h.temp - a.h.temp), cold = best((a, b) => a.h.temp - b.h.temp)
  const windy = best((a, b) => b.h.wind - a.h.wind), wet = best((a, b) => b.h.rainChance - a.h.rainChance)
  const label = (h, i) => (i === 0 ? '지금' : `${hourOf(h.time)}시`)
  const compact = view.k < 1.7
  const cm = modeOf(mode, cur.h)

  return (
    <section className="wm" aria-label="지역별 날씨 지도">
      <div className="wm-head">
        <h2 className="wm-title serif"><i className="bi bi-geo-alt-fill me-2" />제주 지역별 날씨 지도</h2>
        <span className="wm-sub">기상청 단기예보 · 읍·면 {rows.length}곳{failed > 0 ? ` (${failed}곳은 불러오지 못했어요)` : ''}</span>
      </div>
      <div className="wm-modes" role="tablist" aria-label="지도에 보여 줄 값">
        {MODES.map((m) => (
          <button key={m.id} type="button" role="tab" aria-selected={mode === m.id} className={mode === m.id ? 'on' : ''} onClick={() => setMode(m.id)}>
            <i className={`bi bi-${m.icon} me-1`} />{m.label}
          </button>
        ))}
      </div>
      <div className="wm-body">
        <div className={`wm-map ${view.k > 1 ? 'zoomed' : ''}`} ref={mapRef} style={{ aspectRatio: `${W} / ${H}` }}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onDoubleClick={(e) => { if (!e.target.closest('.wm-pin') && !e.target.closest('.wm-ctl')) zoomBy(1.6) }}>
          <div className="wm-zoom" style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})`, '--k': view.k }}>
            <svg viewBox={`0 0 ${W} ${H}`} className="wm-svg" role="img" aria-label="제주섬 지도">
              <defs>
                <linearGradient id="wm-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0d3b66" /><stop offset="1" stopColor="#0a2745" /></linearGradient>
                <linearGradient id="wm-land" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3f9a6c" /><stop offset=".55" stopColor="#2f7d5b" /><stop offset="1" stopColor="#2c6e50" /></linearGradient>
                <clipPath id="wm-clip"><path d={LAND} /></clipPath>
                <filter id="wm-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22" /></filter>
              </defs>
              <rect width={W} height={H} fill="url(#wm-sea)" />
              {[0.18, 0.4, 0.62, 0.84].map((f, i) => <path key={i} className="wm-wave" d={`M0 ${H * f} ` + Array.from({ length: 18 }, (_, k) => `Q${k * 60 + 30} ${H * f - 8} ${k * 60 + 60} ${H * f}`).join(' ')} style={{ animationDelay: `${i * -1.4}s` }} />)}
              <path d={LAND} className="wm-shore" />
              <path d={LAND} fill="url(#wm-land)" className="wm-land" />
              <g clipPath="url(#wm-clip)" filter="url(#wm-blur)" className="wm-heat">
                {rows.map((r) => <circle key={r.name} cx={px(r.pos[0])} cy={py(r.pos[1])} r="62" fill={modeOf(mode, r.h).color} />)}
              </g>
              {ISLETS.map(([lng, lat, r], i) => <ellipse key={i} cx={px(lng)} cy={py(lat)} rx={r} ry={r * 0.7} className="wm-islet" />)}
              {[[74, 40], [56, 30], [38, 20], [20, 11]].map(([rx, ry], i) => <ellipse key={i} cx={HALLA[0]} cy={HALLA[1]} rx={rx} ry={ry} className="wm-contour" />)}
              <path d={`M${HALLA[0] - 8} ${HALLA[1] + 5} L${HALLA[0]} ${HALLA[1] - 8} L${HALLA[0] + 8} ${HALLA[1] + 5}Z`} className="wm-peak" />
              <text x={px(126.95) + 14} y={py(33.5) - 8} className="wm-name small">우도</text>
              <text x={px(126.265) + 12} y={py(33.115) + 4} className="wm-name small">마라도</text>
            </svg>
            {mode === 'wind' && windy.h.wind >= 3 && <div className="wm-windlines" aria-hidden="true">{Array.from({ length: 5 }, (_, i) => <i key={i} style={{ top: `${18 + i * 16}%`, animationDelay: `${i * 0.7}s`, animationDuration: `${Math.max(2.2, 5.5 - windy.h.wind * 0.3)}s` }} />)}</div>}
            {rows.map((r, i) => {
              const m = modeOf(mode, r.h)
              const on = r.name === cur.name
              return (
                <button key={r.name} type="button" className={`wm-pin ${on ? 'on' : ''} ${compact && !on ? 'compact' : ''} ${r.h.rain !== '없음' ? 'rainy' : ''}`}
                  style={{ left: `${(px(r.pos[0]) / W) * 100}%`, top: `${(py(r.pos[1]) / H) * 100}%`, '--tc': m.color, '--i': i }}
                  onClick={() => { if (moved.current > 5) return; setSel(r.name) }} aria-label={`${r.name} ${r.h.temp}도 ${r.h.sky}`} aria-pressed={on}>
                  <span className="wm-bubble">
                    {mode === 'wind'
                      ? <i className="bi bi-arrow-up wm-arrow" style={{ transform: `rotate(${((r.h.windDir ?? 0) + 180) % 360}deg)` }} />
                      : mode === 'rain' ? <i className="bi bi-droplet-fill wm-ic" /> : <i className={`bi bi-${iconOf(r.h)} wm-ic`} />}
                    <b>{m.val}</b>
                    {r.h.rain !== '없음' && mode !== 'wind' && <span className="wm-drops" aria-hidden="true"><u /><u /><u /></span>}
                  </span>
                  <span className="wm-pname">{r.name}</span>
                </button>
              )
            })}
          </div>
          <div className="wm-ctl" role="group" aria-label="지도 확대">
            <button type="button" onClick={() => zoomBy(1.6)} aria-label="확대" disabled={view.k >= MAXK}><i className="bi bi-plus-lg" /></button>
            <button type="button" onClick={() => zoomBy(1 / 1.6)} aria-label="축소" disabled={view.k <= 1}><i className="bi bi-dash-lg" /></button>
            <button type="button" onClick={() => setView({ k: 1, x: 0, y: 0 })} aria-label="처음 크기로" disabled={view.k === 1}><i className="bi bi-arrows-angle-contract" /></button>
          </div>
          <span className="wm-hint"><i className="bi bi-hand-index me-1" />{view.k > 1 ? '끌어서 이동 · 두 번 누르면 더 확대' : '두 번 누르거나 + 로 확대'}</span>
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
              {cur.h.humidity != null && <div><span><i className="bi bi-moisture" />습도</span><b>{cur.h.humidity}%</b><u><s style={{ width: `${cur.h.humidity}%` }} /></u></div>}
              <div><span><i className="bi bi-wind" />바람</span><b>{dirName(cur.h.windDir)} {cur.h.wind}m/s{cur.h.windDir != null && <i className="bi bi-arrow-up wm-dirarrow" style={{ transform: `rotate(${(cur.h.windDir + 180) % 360}deg)` }} />}</b><u><s style={{ width: `${Math.min(100, (cur.h.wind / 14) * 100)}%`, background: windColor(cur.h.wind) }} /></u></div>
            </div>
            <MiniChart hours={curHours} at={at} onPick={(i) => { setPlaying(false); setHour(i) }} color={tempColor(cur.h.temp)} />
            <button type="button" className="wm-focus" onClick={() => focusOn(cur)}><i className="bi bi-zoom-in me-1" />{cur.name} 크게 보기</button>
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
        <b style={{ color: cm.color }}>{MODES.find((m) => m.id === mode).label}</b>
        {LEGENDS[mode].map(([t, c]) => <span key={t}><i style={{ background: c }} />{t}</span>)}
      </div>
    </section>
  )
}
