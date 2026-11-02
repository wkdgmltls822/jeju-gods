import { useMemo } from 'react'
import { GODS, EDGES, godById } from '../data/gods'
import { makeBackgroundStars } from '../lib/stars'
import Meteors from './Meteors'

// 신들을 별자리로 그린 지도. 별을 누르면 onSelect(id) 가 불립니다.
export default function StarMap({ selectedId, todayId, onSelect }) {
  const bgStars = useMemo(() => makeBackgroundStars(), [])

  return (
    <svg className="starmap" viewBox="0 0 800 520" role="group" aria-label="제주 신들의 별자리 지도">
      <defs>
        <radialGradient id="nebula-a" cx="25%" cy="30%" r="55%">
          <stop offset="0%" stopColor="#4f7dff" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#4f7dff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="nebula-b" cx="80%" cy="75%" r="50%">
          <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="star-glow">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#7dd3fc" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 은하수 같은 빛 번짐 */}
      <rect width="800" height="520" fill="url(#nebula-a)" />
      <rect width="800" height="520" fill="url(#nebula-b)" />

      {/* 깜빡이는 배경 별 */}
      <g aria-hidden="true">
        {bgStars.map((s) => (
          <circle key={s.id} cx={s.x} cy={s.y} r={s.r} className={`bg-star ${s.warm ? 'warm' : ''}`}
            style={{ animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s` }} />
        ))}
        {/* 쏟아지는 별똥별 */}
        <Meteors count={8} seed={42} />
      </g>

      {/* 별과 별을 잇는 선: 고른 별에 이어진 선은 빛이 흐른다 */}
      {EDGES.map(([a, b]) => {
        const p = godById(a), q = godById(b)
        const lit = selectedId === a || selectedId === b
        return <line key={a + b} x1={p.x} y1={p.y} x2={q.x} y2={q.y} className={lit ? 'edge lit' : 'edge'} />
      })}

      {GODS.map((g, i) => {
        const active = g.id === selectedId
        return (
          <g
            key={g.id} className={`star ${active ? 'active' : ''}`} transform={`translate(${g.x} ${g.y})`}
            style={{ '--d': `${0.3 + i * 0.12}s` }} /* 별이 하나씩 차례로 켜진다 */
            role="button" tabIndex={0} aria-label={g.name} aria-pressed={active}
            onClick={() => onSelect(g.id)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(g.id) } }}
          >
            <circle r="30" className="halo" />
            <circle r="22" fill="url(#star-glow)" className="glow" style={{ animationDelay: `${(i % 5) * 0.6}s` }} />
            {g.id === todayId && <circle r="20" className="today-ring" />}
            <circle r="7" className="core" />
            <text y="36" textAnchor="middle" className="label">{g.name}</text>
          </g>
        )
      })}
    </svg>
  )
}
