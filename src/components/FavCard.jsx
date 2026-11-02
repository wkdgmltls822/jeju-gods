import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GOD_COLORS, godById } from '../data/gods'
import { useAppStore } from '../store/useAppStore'
import GodArt from './GodArt'

// 즐겨찾기한 신 카드: 마우스를 올리면 살짝 기울고 빛이 따라다니며, 별을 누르면 즐겨찾기에서 빠진다
export default function FavCard({ id, index, talks = 0 }) {
  const ref = useRef(null)
  const [leaving, setLeaving] = useState(false)
  const navigate = useNavigate()
  const toggle = useAppStore((s) => s.toggleFavorite)
  const setChatGod = useAppStore((s) => s.setChatGod)
  const g = godById(id)
  if (!g) return null

  const move = (e) => {
    const el = ref.current
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height
    el.style.setProperty('--rx', `${((0.5 - y) * 9).toFixed(2)}deg`)
    el.style.setProperty('--ry', `${((x - 0.5) * 11).toFixed(2)}deg`)
    el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`)
    el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`)
  }
  const reset = () => { ref.current.style.setProperty('--rx', '0deg'); ref.current.style.setProperty('--ry', '0deg') }
  const remove = () => { setLeaving(true); setTimeout(() => toggle(id), 380) }
  const chat = () => { setChatGod(id); navigate('/agent') }

  return (
    <article ref={ref} className={`fav3 ${leaving ? 'leaving' : ''}`} style={{ '--c': GOD_COLORS[id], '--i': index }} onMouseMove={move} onMouseLeave={reset}>
      <div className="fav3-art"><GodArt id={id} /><span className="fav3-glare" /></div>
      <button type="button" className="fav3-star" onClick={remove} aria-label={`${g.name} 즐겨찾기 해제`} title="즐겨찾기 해제"><i className="bi bi-star-fill" /></button>
      {talks > 0 && <span className="fav3-talk"><i className="bi bi-chat-quote-fill me-1" />{talks}</span>}
      <div className="fav3-body">
        <span className="fav3-tale"><i className="bi bi-book me-1" />{g.tale}</span>
        <h3 className="fav3-name serif">{g.name}</h3>
        <p className="fav3-role">{g.role}</p>
        <p className="fav3-text">{g.text.split(/(?<=\.)\s+/)[0]}</p>
        <div className="fav3-actions">
          <button type="button" className="fav3-btn primary" onClick={chat}><i className="bi bi-chat-quote me-1" />대화하기</button>
          <Link to="/myths" className="fav3-btn"><i className="bi bi-stars me-1" />별자리</Link>
        </div>
      </div>
    </article>
  )
}
