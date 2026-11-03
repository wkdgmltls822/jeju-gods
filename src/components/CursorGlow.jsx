import { useEffect, useRef } from 'react'
import { GOD_COLORS } from '../data/gods'
import '../styles/cursor.css'

// 마우스를 따라다니는 은은한 달빛, 지나간 자리에 떨어지는 작은 별, 누르면 터지는 별.
// 마우스가 있는 화면에서만 켜지고, '움직임 줄이기' 설정이면 아예 만들지 않는다.
const COLORS = Object.values(GOD_COLORS)

export default function CursorGlow() {
  const glow = useRef(null)
  const layer = useRef(null)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    let last = 0, lx = 0, ly = 0, raf = 0, x = 0, y = 0
    const spawn = (px, py, burst = false) => {
      const el = document.createElement('i')
      el.textContent = '✦'
      const c = COLORS[Math.floor(Math.random() * COLORS.length)]
      const a = Math.random() * Math.PI * 2
      const d = burst ? 28 + Math.random() * 46 : 6 + Math.random() * 14
      el.style.cssText = `left:${px}px;top:${py}px;color:${c};font-size:${burst ? 10 + Math.random() * 12 : 7 + Math.random() * 7}px;--dx:${Math.cos(a) * d}px;--dy:${burst ? Math.sin(a) * d : 14 + Math.random() * 22}px;--r:${(Math.random() - 0.5) * 160}deg`
      el.className = burst ? 'cg-star burst' : 'cg-star'
      el.addEventListener('animationend', () => el.remove(), { once: true })
      layer.current?.appendChild(el)
    }
    const onMove = (e) => {
      x = e.clientX; y = e.clientY
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; if (glow.current) glow.current.style.transform = `translate(${x}px, ${y}px)` })
      const now = performance.now()
      if (now - last > 70 && Math.hypot(x - lx, y - ly) > 18 && (layer.current?.childElementCount ?? 0) < 40) {
        last = now; lx = x; ly = y
        spawn(x, y)
      }
    }
    const onDown = (e) => { for (let i = 0; i < 9; i++) spawn(e.clientX, e.clientY, true) }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    return () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerdown', onDown); cancelAnimationFrame(raf) }
  }, [])

  return (
    <div className="cg" aria-hidden="true">
      <div className="cg-glow" ref={glow} />
      <div className="cg-layer" ref={layer} />
    </div>
  )
}
