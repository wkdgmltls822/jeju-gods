import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GOD_COLORS, godById } from '../data/gods'
import { useAppStore } from '../store/useAppStore'
import GodAvatar from './GodAvatar'
import Reveal from './Reveal'

const dayLabel = (iso) => new Date(iso).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })
const timeLabel = (iso) => new Date(iso).toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' })

// 한 줄의 대화: 길면 접어 두고, 신의 말에는 "이 신과 이어서 대화" 버튼이 붙는다
function LogItem({ l, i }) {
  const navigate = useNavigate()
  const setChatGod = useAppStore((s) => s.setChatGod)
  const [open, setOpen] = useState(false)
  const g = godById(l.god_id)
  const me = l.role === 'user'
  const long = l.text.length > 110
  const resume = () => { setChatGod(l.god_id); navigate('/agent') }
  return (
    <li className={`tl-item ${me ? 'me' : 'god'} ${i === 0 ? 'latest' : ''}`} style={{ '--c': me ? '#7dd3fc' : GOD_COLORS[l.god_id] ?? '#7dd3fc' }}>
      <span className="tl-dot" />
      <Reveal>
        <div className="tl-card">
          {me ? <span className="tl-me"><i className="bi bi-person-fill" /></span> : <GodAvatar id={l.god_id} size={38} />}
          <div className="tl-main">
            <div className="tl-meta">
              <b>{me ? '나' : g?.name ?? l.god_id}</b><span>{timeLabel(l.created_at)}</span>
            </div>
            <div className={`tl-text ${long && !open ? 'clamp' : ''}`}>{l.text}</div>
            <div className="tl-actions">
              {long && <button type="button" className="tl-more" onClick={() => setOpen(!open)}>{open ? '접기' : '더 보기'}</button>}
              {!me && g && <button type="button" className="tl-resume" onClick={resume}><i className="bi bi-arrow-return-right me-1" />이 신과 이어서 대화</button>}
            </div>
          </div>
        </div>
      </Reveal>
    </li>
  )
}

// 최근 대화 타임라인: 신별로 거르고, 날짜가 바뀌면 구분 칩이 들어간다
export default function ChatTimeline({ logs }) {
  const [filter, setFilter] = useState('all')
  const counts = {}
  logs.forEach((l) => { counts[l.god_id] = (counts[l.god_id] ?? 0) + 1 })
  const gods = Object.keys(counts).filter((id) => godById(id)).sort((a, b) => counts[b] - counts[a])
  const active = filter !== 'all' && counts[filter] ? filter : 'all'
  const shown = active === 'all' ? logs : logs.filter((l) => l.god_id === active)

  return (
    <div className="tl">
      <div className="tl-filter" role="tablist" aria-label="신별 대화 보기">
        <button type="button" role="tab" aria-selected={active === 'all'} className={`tl-chip all ${active === 'all' ? 'on' : ''}`} onClick={() => setFilter('all')}>
          전체 <b>{logs.length}</b>
        </button>
        {gods.map((id) => (
          <button key={id} type="button" role="tab" aria-selected={active === id} className={`tl-chip ${active === id ? 'on' : ''}`}
            style={{ '--c': GOD_COLORS[id] }} onClick={() => setFilter(id)}>
            <GodAvatar id={id} size={24} />{godById(id).name.replace(/\(.*\)/, '')} <b>{counts[id]}</b>
          </button>
        ))}
      </div>
      <ul key={active} className="tl-list list-unstyled">
        {shown.map((l, i) => {
          const day = dayLabel(l.created_at)
          const newDay = i === 0 || day !== dayLabel(shown[i - 1].created_at)
          return (
            <FragmentItem key={l.id} day={newDay ? day : null}>
              <LogItem l={l} i={i} />
            </FragmentItem>
          )
        })}
      </ul>
    </div>
  )
}

function FragmentItem({ day, children }) {
  return (
    <>
      {day && <li className="tl-day"><span><i className="bi bi-calendar3 me-2" />{day}</span></li>}
      {children}
    </>
  )
}
