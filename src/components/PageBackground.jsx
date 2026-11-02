import { useMemo } from 'react'
import { makeBackgroundStars } from '../lib/stars'
import Meteors from './Meteors'

// 홈을 뺀 화면들의 배경: 화면에 고정된 밤하늘(별·오로라·별똥별)과 아래쪽의 한라산 실루엣.
// theme 마다 오로라 색과 하늘 한 곳의 장식(달/새벽빛)이 달라서 화면마다 분위기가 다릅니다.
const SEEDS = { myths: 77, agent: 1234, my: 4321 }

export default function PageBackground({ theme }) {
  const stars = useMemo(() => makeBackgroundStars(150, SEEDS[theme] ?? 1), [theme])
  return (
    <div className={`pbg pbg-${theme}`} aria-hidden="true">
      <div className="pbg-aurora a1" />
      <div className="pbg-aurora a2" />
      <div className="pbg-deco" />
      <svg className="pbg-stars" viewBox="0 0 800 520" preserveAspectRatio="xMidYMid slice">
        {stars.map((s) => (
          <circle key={s.id} cx={s.x} cy={s.y} r={s.r} className={`bg-star ${s.warm ? 'warm' : ''}`}
            style={{ animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s` }} />
        ))}
        <Meteors count={7} seed={SEEDS[theme] ?? 1} />
      </svg>
      <svg className="pbg-land" viewBox="0 0 1200 220" preserveAspectRatio="none">
        <path className="far" d="M0 220 V150 Q120 120 240 140 T480 130 Q560 90 600 70 Q640 90 720 130 T960 140 T1200 130 V220Z" />
        <path className="near" d="M0 220 V180 Q100 150 200 175 T400 170 T620 172 Q700 140 780 170 T1000 175 T1200 165 V220Z" />
      </svg>
    </div>
  )
}
