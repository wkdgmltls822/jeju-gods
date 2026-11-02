import { useMemo } from 'react'
import { GODS, EDGES, GOD_COLORS, godById } from '../data/gods'
import { makeBackgroundStars } from '../lib/stars'

// 별자리 도형으로 색칠할 닫힌 고리 (EDGES 의 큰 순환 고리)
const LOOP = ['cheonjiwang', 'seolmundae', 'samseong', 'baekjuddo', 'yeongdeung', 'jacheongbi', 'munjeon', 'daebyeol']

// 신들을 한지 위에 먹으로 그린 옛 성도(星圖) 느낌의 평면 지도. 3D 우주 별자리와 한눈에 구별되게 밝은 종이 톤.
// 별을 누르면 onSelect(id) 가 불립니다.
export default function StarMap({ selectedId, todayId, onSelect }) {
  const dots = useMemo(() => makeBackgroundStars(110, 31), [])
  const loop = LOOP.map((id) => godById(id)).map((g) => `${g.x},${g.y}`).join(' ')

  return (
    <svg className="hj-map" viewBox="0 0 800 520" role="group" aria-label="제주 신들의 별자리 지도">
      <defs>
        <radialGradient id="hj-paper" cx="50%" cy="42%" r="75%">
          <stop offset="0" stopColor="#f8f1de" /><stop offset="1" stopColor="#e4d3ae" />
        </radialGradient>
        <filter id="hj-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4" />
          <feColorMatrix values="0 0 0 0 .35  0 0 0 0 .25  0 0 0 0 .12  0 0 0 .55 0" />
        </filter>
      </defs>

      <rect width="800" height="520" fill="url(#hj-paper)" />
      <rect width="800" height="520" filter="url(#hj-grain)" opacity=".5" aria-hidden="true" />

      {/* 천구 눈금: 먹선 동심원과 방위 글자 */}
      <g aria-hidden="true" className="hj-grid">
        {[110, 200, 300].map((r) => <circle key={r} cx="400" cy="270" r={r} />)}
        <line x1="400" y1="30" x2="400" y2="490" /><line x1="70" y1="270" x2="730" y2="270" />
        <text x="400" y="24" textAnchor="middle">北</text><text x="400" y="508" textAnchor="middle">南</text>
        <text x="18" y="276" textAnchor="middle">西</text><text x="782" y="276" textAnchor="middle">東</text>
      </g>

      {/* 먹점 배경 별 */}
      <g aria-hidden="true" className="hj-dots">
        {dots.map((s) => <circle key={s.id} cx={s.x} cy={s.y} r={s.r * 0.9} />)}
      </g>

      {/* 해 · 달 도장 */}
      <g aria-hidden="true">
        <circle cx="712" cy="74" r="26" className="hj-sun" />
        <path d="M92 52 a22 22 0 1 0 0 44 a17 17 0 1 1 0 -44Z" className="hj-moon" />
      </g>

      {/* 한라산과 바다: 먹으로 번진 산 그림 */}
      <g aria-hidden="true">
        <path d="M0 520 V470 Q90 462 170 470 Q260 468 330 448 Q372 418 400 396 Q430 418 470 448 Q540 468 640 470 Q720 462 800 470 V520Z" className="hj-hill" />
        <path d="M0 470 Q90 462 170 470 Q260 468 330 448 Q372 418 400 396 Q430 418 470 448 Q540 468 640 470 Q720 462 800 470" className="hj-ridge" />
        {[492, 506].map((y, i) => <path key={y} d={`M0 ${y} Q25 ${y - 6} 50 ${y} T100 ${y} T150 ${y} T200 ${y} T250 ${y} T300 ${y} T350 ${y} T400 ${y} T450 ${y} T500 ${y} T550 ${y} T600 ${y} T650 ${y} T700 ${y} T750 ${y} T800 ${y}`} className="hj-sea" style={{ animationDelay: `${i * 1.4}s` }} />)}
      </g>

      {/* 별자리 도형: 큰 고리를 붉은 먹으로 은은하게 칠한다 */}
      <polygon points={loop} className="hj-figure" aria-hidden="true" />

      {/* 별과 별을 잇는 선 */}
      {EDGES.map(([a, b]) => {
        const p = godById(a), q = godById(b)
        const lit = selectedId === a || selectedId === b
        return (
          <g key={a + b}>
            <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} className={lit ? 'hj-edge lit' : 'hj-edge'} />
            {lit && <circle r="3.5" className="hj-flow" style={{ offsetPath: `path('M${p.x} ${p.y} L${q.x} ${q.y}')` }} />}
          </g>
        )
      })}

      {GODS.map((g, i) => {
        const active = g.id === selectedId
        return (
          <g
            key={g.id} className={`hj-star ${active ? 'active' : ''}`} transform={`translate(${g.x} ${g.y})`}
            style={{ '--d': `${0.2 + i * 0.1}s`, '--c': GOD_COLORS[g.id] }}
            role="button" tabIndex={0} aria-label={g.name} aria-pressed={active}
            onClick={() => onSelect(g.id)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(g.id) } }}
          >
            <circle r="34" fill="transparent" />
            {active && <circle r="16" className="hj-ripple" />}
            {g.id === todayId && <circle r="21" className="hj-today" />}
            <circle r={active ? 13 : 10} className="hj-core" />
            <circle r={active ? 5 : 3.5} className="hj-dot" />
            {/* 도장 번호 */}
            <g transform="translate(17 -17)"><rect x="-8" y="-8" width="16" height="16" rx="3" className="hj-seal" /><text y="4" textAnchor="middle" className="hj-no">{i + 1}</text></g>
            <text y="32" textAnchor="middle" className="hj-label">{g.name}</text>
            {active && <text y="48" textAnchor="middle" className="hj-role">{g.role}</text>}
            {active && <text y="63" textAnchor="middle" className="hj-tale">「{g.tale}」</text>}
          </g>
        )
      })}

      <g className="hj-legend" aria-hidden="true" transform="translate(120 30)">
        <circle cx="0" cy="0" r="6" className="hj-today" style={{ animation: 'none' }} />
        <text x="12" y="4">오늘의 신</text>
        <text x="96" y="4">별을 눌러 보세요</text>
      </g>
    </svg>
  )
}
