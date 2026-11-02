import { useEffect, useRef, useState } from 'react'

// 화면에 들어올 때 부드럽게 나타나는 래퍼. 스크롤하면서 하나씩 등장한다.
export default function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  // 관찰 기능이 없는 환경에서는 처음부터 보여 준다
  const [shown, setShown] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const el = ref.current
    if (shown || !el) return
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setShown(true); io.disconnect() }
    }, { threshold: 0.12 })
    io.observe(el)
    return () => io.disconnect()
  }, [shown])

  return (
    <div ref={ref} className={`reveal ${shown ? 'in' : ''} ${className}`} style={{ transitionDelay: `${delay}s` }}>
      {children}
    </div>
  )
}
