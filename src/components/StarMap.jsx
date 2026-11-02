import { useMemo } from 'react'
import { GODS, EDGES, godById } from '../data/gods'

// 장식용 배경 별: 매번 같은 모양이 나오도록 숫자 씨앗으로 만든다 (렌더마다 위치가 바뀌지 않게)
function makeBackgroundStars(count = 90) {
  let seed = 20261102
  const rand = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296 }
  return Array.from({ length: count }, (_, i) => ({
    id: i, x: rand() * 800, y: rand() * 520,
    r: 0.5 + rand() * 1.4,
    delay: rand() * 6, dur: 2.5 + rand() * 4,
    warm: rand() > 0.8, // 가끔 노란 별
  }))
}

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
        {/* 가끔 지나가는 별똥별 */}
        <line className="shooting-star" x1="0" y1="0" x2="70" y2="26" />
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
