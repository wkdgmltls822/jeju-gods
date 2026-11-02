import { useMemo } from 'react'
import { GODS, EDGES, GOD_COLORS, godById } from '../data/gods'
import { makeBackgroundStars } from '../lib/stars'
import Meteors from './Meteors'

// 네 갈래로 반짝이는 별 모양 (중심 0,0, 크기 r)
const sparkle = (r) => `M0 ${-r} Q${r * 0.12} ${-r * 0.12} ${r} 0 Q${r * 0.12} ${r * 0.12} 0 ${r} Q${-r * 0.12} ${r * 0.12} ${-r} 0 Q${-r * 0.12} ${-r * 0.12} 0 ${-r}Z`

// 신들을 별자리로 그린 지도. 별을 누르면 onSelect(id) 가 불립니다.
export default function StarMap({ selectedId, todayId, onSelect }) {
  const bgStars = useMemo(() => makeBackgroundStars(), [])
  const dust = useMemo(() => makeBackgroundStars(260, 55), []) // 은하수 별가루

  return (
    <svg className="starmap2" viewBox="0 0 800 520" role="group" aria-label="제주 신들의 별자리 지도">
      <defs>
        <linearGradient id="sm-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a1340" />
          <stop offset=".55" stopColor="#1f1a6a" />
          <stop offset="1" stopColor="#0f5878" />
        </linearGradient>
        <radialGradient id="sm-neb-a" cx="22%" cy="28%" r="45%"><stop offset="0" stopColor="#7c5cff" stopOpacity=".5" /><stop offset="1" stopColor="#7c5cff" stopOpacity="0" /></radialGradient>
        <radialGradient id="sm-neb-b" cx="82%" cy="62%" r="45%"><stop offset="0" stopColor="#ff7ab8" stopOpacity=".3" /><stop offset="1" stopColor="#ff7ab8" stopOpacity="0" /></radialGradient>
        <radialGradient id="sm-neb-c" cx="60%" cy="12%" r="40%"><stop offset="0" stopColor="#22d3ee" stopOpacity=".3" /><stop offset="1" stopColor="#22d3ee" stopOpacity="0" /></radialGradient>
        <linearGradient id="sm-band" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#bfe6ff" stopOpacity="0" /><stop offset=".5" stopColor="#c9b8ff" stopOpacity=".3" /><stop offset="1" stopColor="#ffd1ec" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="sm-land" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0d3a5a" /><stop offset="1" stopColor="#06172b" /></linearGradient>
        <filter id="sm-blur" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="16" /></filter>
        {GODS.map((g) => (
          <radialGradient key={g.id} id={`sm-glow-${g.id}`}>
            <stop offset="0" stopColor="#fff" stopOpacity=".95" />
            <stop offset=".3" stopColor={GOD_COLORS[g.id]} stopOpacity=".65" />
            <stop offset="1" stopColor={GOD_COLORS[g.id]} stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>

      {/* 하늘과 성운 */}
      <rect width="800" height="520" fill="url(#sm-sky)" />
      <rect width="800" height="520" fill="url(#sm-neb-a)" />
      <rect width="800" height="520" fill="url(#sm-neb-b)" />
      <rect width="800" height="520" fill="url(#sm-neb-c)" />

      {/* 은하수: 비스듬한 빛의 띠와 별가루 */}
      <g aria-hidden="true" transform="rotate(-24 400 260)">
        <rect x="-120" y="190" width="1040" height="120" fill="url(#sm-band)" filter="url(#sm-blur)" className="sm-band" />
        {dust.filter((s) => Math.abs(s.y - 260) < 52).map((s) => (
          <circle key={s.id} cx={s.x * 1.2 - 80} cy={s.y} r={s.r * 0.7} fill="#fff" opacity=".5" />
        ))}
      </g>

      {/* 깜빡이는 배경 별과 별똥별 */}
      <g aria-hidden="true">
        {bgStars.map((s) => (
          <circle key={s.id} cx={s.x} cy={s.y} r={s.r} className={`bg-star ${s.warm ? 'warm' : ''}`}
            style={{ animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s` }} />
        ))}
        <Meteors count={8} seed={42} />
      </g>

      {/* 아래쪽 제주 땅: 한라산과 오름, 일렁이는 바다 */}
      <g aria-hidden="true">
        <path d="M0 520 V478 Q70 466 130 476 Q170 482 210 474 Q300 470 360 452 Q392 424 400 418 Q408 424 440 452 Q500 470 590 474 Q640 480 690 470 Q750 464 800 474 V520Z" fill="url(#sm-land)" />
        <path d="M0 478 Q70 466 130 476 Q170 482 210 474 Q300 470 360 452 Q392 424 400 418 Q408 424 440 452 Q500 470 590 474 Q640 480 690 470 Q750 464 800 474" fill="none" stroke="#7dd3fc" strokeOpacity=".5" />
        <path d="M0 506 Q50 498 100 506 T200 506 T300 506 T400 506 T500 506 T600 506 T700 506 T800 506 V520 H0Z" fill="#0a2a47" className="sm-wave" />
      </g>

      {/* 별과 별을 잇는 선: 고른 별에 이어진 선은 빛이 흐른다 */}
      {EDGES.map(([a, b]) => {
        const p = godById(a), q = godById(b)
        const lit = selectedId === a || selectedId === b
        return (
          <g key={a + b}>
            <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} className={lit ? 'sm-edge lit' : 'sm-edge'} />
            {lit && <circle r="3" className="sm-flow" style={{ offsetPath: `path('M${p.x} ${p.y} L${q.x} ${q.y}')` }} />}
          </g>
        )
      })}

      {GODS.map((g, i) => {
        const active = g.id === selectedId
        const color = GOD_COLORS[g.id]
        return (
          <g
            key={g.id} className={`sm-star ${active ? 'active' : ''}`} transform={`translate(${g.x} ${g.y})`}
            style={{ '--d': `${0.3 + i * 0.12}s`, '--c': color }} /* 별이 하나씩 차례로 켜진다 */
            role="button" tabIndex={0} aria-label={g.name} aria-pressed={active}
            onClick={() => onSelect(g.id)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(g.id) } }}
          >
            <circle r="34" fill="transparent" />
            {active && <circle r="14" className="sm-ripple" />}
            <circle r="30" fill={`url(#sm-glow-${g.id})`} className="sm-glow" style={{ animationDelay: `${(i % 5) * 0.6}s` }} />
            {g.id === todayId && <circle r="22" className="sm-today" />}
            <path d={sparkle(active ? 20 : 14)} className="sm-spark" />
            <circle r={active ? 6.5 : 5} className="sm-core" style={{ fill: active ? '#fff' : color }} />
            <text y="38" textAnchor="middle" className="sm-label">{g.name}</text>
          </g>
        )
      })}
    </svg>
  )
}
