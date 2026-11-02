import { Link } from 'react-router-dom'
import { GODS, GOD_COLORS } from '../data/gods'
import GodAvatar from './GodAvatar'

// 신 열 명이 옆으로 끊임없이 흘러가는 띠 (마우스를 올리면 멈춘다)
export default function GodMarquee() {
  const items = [...GODS, ...GODS]
  return (
    <div className="marquee" aria-label="제주의 신들">
      <div className="marquee-track">
        {items.map((g, i) => (
          <Link key={i} to="/myths" className="mq-item" style={{ '--c': GOD_COLORS[g.id] }} aria-hidden={i >= GODS.length} tabIndex={i >= GODS.length ? -1 : 0}>
            <GodAvatar id={g.id} size={46} />
            <span><b className="serif">{g.name.replace(/\(.*\)/, '')}</b><small>{g.role}</small></span>
          </Link>
        ))}
      </div>
    </div>
  )
}
