import { useEffect, useRef, useState } from 'react'

const prefersReduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// 숫자가 이전 값에서 새 값까지 올라가는(내려가는) 효과. 움직임 줄이기 설정이면 바로 새 값을 보여 준다.
export default function CountUp({ value, duration = 700 }) {
  const reduce = prefersReduced()
  const [shown, setShown] = useState(0)
  const from = useRef(0)

  useEffect(() => {
    if (reduce) return
    const startVal = from.current
    const start = performance.now()
    let raf
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration)
      const v = Math.round(startVal + (value - startVal) * (1 - Math.pow(1 - p, 3))) // 끝으로 갈수록 느려지게
      from.current = v
      setShown(v)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration, reduce])

  return (reduce ? value : shown).toLocaleString()
}
