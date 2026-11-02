import { useEffect, useRef } from 'react'
import { GODS, GOD_COLORS } from '../data/gods'
import '../styles/sidedecor.css'

// 넓은 화면의 양옆 빈 곳을 채우는 장식 (화면에 고정, 눌러지지 않음).
// 왼쪽: 하늘의 별자리 줄 + 한라산 능선 / 오른쪽: 신들이 도는 천구 + 물결. 스크롤하면 살짝 다른 속도로 움직인다.
const STARS = [[150, 40, 2.4], [96, 120, 3.2], [188, 205, 2.2], [120, 300, 3.6], [212, 372, 2.6], [150, 470, 3.2], [82, 548, 2.2], [176, 640, 3], [128, 730, 2.4]]
const LINE = STARS.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ')
const DOTS = [[40, 90], [250, 160], [60, 420], [262, 590], [30, 700], [230, 810]]
const RIDGE = 'M0 120 L40 96 L78 108 L122 60 L150 78 L186 22 L214 70 L250 52 L300 100 L300 130 Z'

export default function SideDecor() {
  const root = useRef(null)
  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => root.current?.style.setProperty('--sy', String(window.scrollY)))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf) }
  }, [])

  return (
    <div className="sd" ref={root} aria-hidden="true">
      <div className="sd-col sd-left">
        <svg className="sd-svg sd-par" viewBox="0 0 300 900" preserveAspectRatio="xMidYMid slice">
          <path d={LINE} className="sd-line" pathLength="1" />
          {STARS.map(([x, y, r], i) => (
            <g key={i} style={{ '--d': `${i * 0.45}s` }}>
              <circle cx={x} cy={y} r={r * 4.5} className="sd-halo" />
              <circle cx={x} cy={y} r={r} className="sd-star" />
            </g>
          ))}
          {DOTS.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.6" className="sd-dust" style={{ '--d': `${i * 0.7}s` }} />)}
        </svg>
        <p className="sd-vert sd-par2 serif">1만 8천 신이 깃든 섬</p>
        <svg className="sd-ridge" viewBox="0 0 300 130" preserveAspectRatio="none">
          <defs><linearGradient id="sd-r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5eead4" stopOpacity=".28" /><stop offset="1" stopColor="#5eead4" stopOpacity="0" /></linearGradient></defs>
          <path d={RIDGE} fill="url(#sd-r)" />
          <path d={RIDGE.replace(' L300 130 Z', '')} className="sd-ridge-line" fill="none" />
        </svg>
      </div>

      <div className="sd-col sd-right">
        <div className="sd-orrery sd-par">
          <i className="sd-ring r1" /><i className="sd-ring r2" /><i className="sd-ring r3" />
          <span className="sd-sun" />
          {GODS.map((g, i) => (
            <span key={g.id} className="sd-orbit" style={{ '--a': `${(i / GODS.length) * 360}deg`, '--r': `${58 + (i % 3) * 38}px`, '--t': `${26 + (i % 3) * 14}s` }}>
              <b style={{ background: GOD_COLORS[g.id], boxShadow: `0 0 12px ${GOD_COLORS[g.id]}` }} />
            </span>
          ))}
        </div>
        <p className="sd-vert sd-par2 serif">공공데이터 × AI 에이전트</p>
        <div className="sd-meteors"><i /><i /><i /></div>
        <svg className="sd-waves" viewBox="0 0 300 120" preserveAspectRatio="none">
          {[0, 1, 2].map((i) => (
            <path key={i} className={`sd-wave w${i}`} d={`M0 ${60 + i * 16} ` + Array.from({ length: 6 }, (_, k) => `Q${k * 100 + 25} ${48 + i * 16} ${k * 100 + 50} ${60 + i * 16} T${k * 100 + 100} ${60 + i * 16}`).join(' ')} />
          ))}
        </svg>
      </div>
    </div>
  )
}
