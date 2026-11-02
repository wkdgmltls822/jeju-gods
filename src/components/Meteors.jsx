import { useMemo } from 'react'
import { makeMeteors } from '../lib/stars'

// SVG 밤하늘 위에 떨어지는 별똥별 여러 개 (<svg> 안에 넣어서 쓴다)
// 각 유성의 위치·속도는 CSS 변수로 넘기고, 움직임은 theme.css 의 @keyframes meteor 가 맡는다.
export default function Meteors({ count = 12, seed = 7 }) {
  const meteors = useMemo(() => makeMeteors(count, seed), [count, seed])
  return (
    <g aria-hidden="true">
      {meteors.map((m) => (
        <line
          key={m.id} className="meteor" x1="0" y1="0" x2={m.len} y2={m.len * 0.375} strokeWidth={m.width}
          style={{ '--sx': `${m.sx}px`, '--sy': `${m.sy}px`, '--dx': `${m.dx}px`, '--dy': `${m.dy}px`, '--dur': `${m.dur}s`, '--delay': `${m.delay}s` }}
        />
      ))}
    </g>
  )
}
