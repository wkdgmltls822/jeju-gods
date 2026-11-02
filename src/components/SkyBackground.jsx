import { useMemo } from 'react'
import { makeBackgroundStars } from '../lib/stars'

// 홈 히어로 뒤에 깔리는 밤하늘: 깜빡이는 별과 별똥별 (장식이라 스크린리더는 건너뜀)
export default function SkyBackground() {
  const stars = useMemo(() => makeBackgroundStars(170, 1104), [])
  return (
    <svg className="sky-bg" viewBox="0 0 800 520" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {stars.map((s) => (
        <circle key={s.id} cx={s.x} cy={s.y} r={s.r} className={`bg-star ${s.warm ? 'warm' : ''}`}
          style={{ animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s` }} />
      ))}
      <line className="shooting-star" x1="0" y1="0" x2="80" y2="30" style={{ animationDelay: '1s' }} />
    </svg>
  )
}
