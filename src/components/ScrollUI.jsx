import { useEffect, useRef, useState } from 'react'

// 화면 맨 위에 읽은 정도를 보여 주는 가는 색 띠, 많이 내려오면 나타나는 "맨 위로" 버튼
export default function ScrollUI() {
  const bar = useRef(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0
      if (bar.current) bar.current.style.transform = `scaleX(${p})`
      setShow(window.scrollY > 700)
      document.documentElement.classList.toggle("scrolled", window.scrollY > 24)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll) }
  }, [])

  return (
    <>
      <div className="scroll-progress" aria-hidden="true"><i ref={bar} /></div>
      <button type="button" className={`to-top ${show ? 'on' : ''}`} aria-label="맨 위로" tabIndex={show ? 0 : -1}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <i className="bi bi-chevron-up" />
      </button>
    </>
  )
}
