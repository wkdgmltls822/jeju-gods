import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { GOD_COLORS } from '../data/gods'
import '../styles/warp.css'

// 메뉴를 눌러 화면을 옮길 때, 별빛이 중심에서 쏟아지듯 번지는 "별 사이를 날아가는" 전환 효과.
// 처음 열 때와 '움직임 줄이기' 설정에서는 나타나지 않는다.
const COLORS = Object.values(GOD_COLORS)
const N = 44

export default function PageWarp() {
  const { pathname } = useLocation()
  const [run, setRun] = useState(0) // 0: 쉬는 중, 그 외: 전환마다 바뀌는 번호(애니메이션을 처음부터 다시 시작)
  const first = useRef(true)
  const timer = useRef(0)

  const streaks = useMemo(() => Array.from({ length: N }, (_, i) => ({
    a: (i / N) * 360 + (Math.random() - 0.5) * 6,
    d: Math.random() * 0.12,
    l: 28 + Math.random() * 34,
    c: COLORS[i % COLORS.length],
    w: 1.2 + Math.random() * 2.2,
  })), [])

  useEffect(() => {
    if (first.current) { first.current = false; return undefined }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    setRun((r) => r + 1)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setRun(0), 950)
    return () => clearTimeout(timer.current)
  }, [pathname])

  if (!run) return null
  return (
    <div className="warp" key={run} aria-hidden="true">
      <span className="warp-flash" />
      {streaks.map((s, i) => (
        <i key={i} style={{ '--a': `${s.a}deg`, '--d': `${s.d}s`, '--l': `${s.l}vmax`, '--c': s.c, '--w': `${s.w}px` }} />
      ))}
    </div>
  )
}
