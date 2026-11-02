import { GODS, EDGES, godById } from '../data/gods'

// 신들을 별자리로 그린 지도. 별을 누르면 onSelect(id) 가 불립니다.
export default function StarMap({ selectedId, todayId, onSelect }) {
  return (
    <svg className="starmap" viewBox="0 0 800 520" role="group" aria-label="제주 신들의 별자리 지도">
      {EDGES.map(([a, b]) => {
        const p = godById(a), q = godById(b)
        const lit = selectedId === a || selectedId === b
        return <line key={a + b} x1={p.x} y1={p.y} x2={q.x} y2={q.y} className={lit ? 'edge lit' : 'edge'} />
      })}
      {GODS.map((g) => {
        const active = g.id === selectedId
        return (
          <g
            key={g.id} className={`star ${active ? 'active' : ''}`} transform={`translate(${g.x} ${g.y})`}
            role="button" tabIndex={0} aria-label={g.name} aria-pressed={active}
            onClick={() => onSelect(g.id)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(g.id) } }}
          >
            <circle r="26" className="halo" />
            {g.id === todayId && <circle r="20" className="today-ring" />}
            <circle r="7" className="core" />
            <text y="34" textAnchor="middle" className="label">{g.name}</text>
          </g>
        )
      })}
    </svg>
  )
}
