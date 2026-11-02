import { GODS, EDGES, GOD_COLORS, godById } from '../data/gods'

// 홈 히어로 뒤에 그려지는 신들의 별자리: 선이 그려지고, 별이 하나씩 켜지고, 빛알갱이가 선을 따라 흐른다
export default function HeroConstellation() {
  return (
    <svg className="sky-bg hero-const" viewBox="0 0 800 520" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {EDGES.map(([a, b], i) => {
        const p = godById(a), q = godById(b)
        return <line key={a + b} x1={p.x} y1={p.y} x2={q.x} y2={q.y} pathLength="1" className="hc-edge" style={{ animationDelay: `${0.7 + i * 0.22}s` }} />
      })}
      {EDGES.map(([a, b], i) => {
        const p = godById(a), q = godById(b)
        return <circle key={`f${a}${b}`} r="2.6" className="hc-flow" style={{ offsetPath: `path('M${p.x} ${p.y} L${q.x} ${q.y}')`, animationDelay: `${3 + i * 0.9}s` }} />
      })}
      {GODS.map((g, i) => (
        <g key={g.id} transform={`translate(${g.x} ${g.y})`}>
          <g className="hc-star" style={{ '--c': GOD_COLORS[g.id], animationDelay: `${0.5 + i * 0.2}s` }}>
            <circle r="13" className="hc-glow" style={{ animationDelay: `${(i % 5) * 0.6}s` }} />
            <circle r="3" className="hc-core" />
          </g>
        </g>
      ))}
    </svg>
  )
}
