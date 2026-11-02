import { useEffect, useMemo, useState } from 'react'
import { fetchVisitors } from '../api/client'
import { ErrorNote, Loading } from './Status'
import CountUp from './CountUp'

const COLORS = ['#7dd3fc', '#a78bfa', '#f9a8d4', '#5eead4', '#fde68a', '#fdba74', '#93c5fd', '#fca5a5']
const W = 760, H = 170, PX = 24, PT = 18, PB = 28

// 서귀포 직영관광지 월별 관람객: 위는 달별 전체 흐름(별빛 선), 아래는 그 달의 관광지 순위
export default function VisitorChart() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [idx, setIdx] = useState(null) // 선택한 달 (처음엔 가장 최근 달)

  useEffect(() => {
    fetchVisitors().then(setData).catch((e) => setError(e.message))
  }, [])

  const chart = useMemo(() => {
    if (!data) return null
    const totals = data.months.map((m) => Object.values(m.sites).reduce((a, b) => a + b, 0))
    const top = Math.max(...totals)
    const n = totals.length
    const pts = totals.map((t, k) => ({
      x: PX + (n === 1 ? 0 : (k * (W - PX * 2)) / (n - 1)),
      y: PT + (1 - t / top) * (H - PT - PB),
    }))
    const line = pts.map((p, k) => `${k ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
    const area = `${line} L${pts[n - 1].x} ${H - PB} L${pts[0].x} ${H - PB}Z`
    const names = [...new Set(data.months.flatMap((m) => Object.keys(m.sites)))].sort()
    return { totals, pts, line, area, names }
  }, [data])

  if (error) return <ErrorNote error={error} text="관람객 정보를 불러오지 못했어요" />
  if (!data) return <Loading text="관람객 정보를 불러오는 중…" />

  const i = idx ?? data.months.length - 1
  const m = data.months[i]
  const max = Math.max(...data.months.flatMap((x) => Object.values(x.sites))) // 달이 바뀌어도 막대 길이 기준을 같게
  const rows = Object.entries(m.sites).sort((a, b) => b[1] - a[1])
  const total = chart.totals[i]
  const prev = i > 0 ? chart.totals[i - 1] : null
  const delta = prev ? Math.round(((total - prev) / prev) * 100) : null
  const peak = chart.totals.indexOf(Math.max(...chart.totals))
  const sel = chart.pts[i]

  return (
    <section className="visitor-chart">
      <div className="vc-head">
        <div>
          <h2 className="h5 mb-1"><i className="bi bi-people me-1 sea" />서귀포 관광지, 이 달엔 몇 명이 찾았을까</h2>
          <div className="vc-month">{m.year}년 {m.month}월</div>
        </div>
        <div className="vc-total">
          <div className="vc-total-num"><CountUp value={total} /><small>명</small></div>
          <div className="vc-delta">
            {delta === null ? '첫 달' : (
              <span className={delta >= 0 ? 'up' : 'down'}>
                <i className={`bi bi-caret-${delta >= 0 ? 'up' : 'down'}-fill`} /> 전달보다 {Math.abs(delta)}%
              </span>
            )}
            {i === peak && <span className="vc-peak"><i className="bi bi-stars" /> 가장 붐빈 달</span>}
          </div>
        </div>
      </div>

      <svg className="vc-line" viewBox={`0 0 ${W} ${H}`} role="group" aria-label="월별 전체 관람객 추이">
        <defs>
          <linearGradient id="vc-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7dd3fc" stopOpacity=".45" />
            <stop offset="1" stopColor="#7dd3fc" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="vc-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#7dd3fc" />
            <stop offset=".55" stopColor="#a78bfa" />
            <stop offset="1" stopColor="#f9a8d4" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={PX} x2={W - PX} y1={PT + f * (H - PT - PB)} y2={PT + f * (H - PT - PB)} className="vc-grid" />
        ))}
        <path d={chart.area} fill="url(#vc-area)" className="vc-area" />
        <path d={chart.line} fill="none" stroke="url(#vc-stroke)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
          pathLength="1" className="vc-path" />
        <line x1={sel.x} x2={sel.x} y1={sel.y} y2={H - PB} className="vc-guide" />
        {chart.pts.map((p, k) => {
          const mm = data.months[k]
          return (
            <g key={k} className={`vc-dot ${k === i ? 'on' : ''}`} role="button" tabIndex={0}
              aria-label={`${mm.year}년 ${mm.month}월`} aria-pressed={k === i}
              onClick={() => setIdx(k)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIdx(k) } }}>
              <circle cx={p.x} cy={p.y} r="14" fill="transparent" />
              {k === i && <circle cx={p.x} cy={p.y} r="10" className="vc-ring" />}
              <circle cx={p.x} cy={p.y} r={k === i ? 5.5 : 3.2} className="vc-core" />
              {(k % 3 === 0 || k === i) && (
                <text x={p.x} y={H - 8} textAnchor="middle" className="vc-tick">
                  {mm.month === 1 || k === 0 ? `${String(mm.year).slice(2)}.${mm.month}` : `${mm.month}월`}
                </text>
              )}
            </g>
          )
        })}
      </svg>
      <p className="vc-hint"><i className="bi bi-hand-index me-1" />별을 눌러 달을 바꿔 보세요</p>

      <ul className="list-unstyled mb-2">
        {rows.map(([name, n], r) => {
          const color = COLORS[chart.names.indexOf(name) % COLORS.length]
          return (
            <li key={name} className="bar-row" style={{ '--c': color }}>
              <span className="bar-name"><b className="bar-rank">{r + 1}</b>{name.replace('_', ' · ')}</span>
              <span className="bar-track"><span className="bar-fill" style={{ width: `${(n / max) * 100}%` }} /></span>
              <span className="bar-num"><CountUp value={n} />명<small>{total ? Math.round((n / total) * 100) : 0}%</small></span>
            </li>
          )
        })}
      </ul>
      <p className="text-secondary small mb-0">자료: 제주특별자치도 서귀포시 직영관광지 관람객수 추이(공공데이터포털)</p>
    </section>
  )
}
