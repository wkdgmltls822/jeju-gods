import { Fragment, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import GodArt from '../components/GodArt'
import GodAvatar from '../components/GodAvatar'
import CountUp from '../components/CountUp'
import { Empty } from '../components/Status'
import { godById } from '../data/gods'
import { useAppStore } from '../store/useAppStore'
import { supabase } from '../lib/supabase'

const dayLabel = (iso) => new Date(iso).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })
const fmt = (iso) => new Date(iso).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })

// 내 신 기록: 닉네임별로 Supabase 에 저장된 즐겨찾기 신과 대화 기록
export default function My() {
  const { nickname, setNickname, favorites, loadFavorites, logs, loadLogs, dbError } = useAppStore()
  const [draft, setDraft] = useState(nickname)

  useEffect(() => { loadFavorites(); loadLogs() }, [nickname, loadFavorites, loadLogs])

  const [saved, setSaved] = useState(false)
  const save = (e) => {
    e.preventDefault()
    setNickname(draft)
    setSaved(true)
    setTimeout(() => setSaved(false), 1600)
  }
  const talked = new Set(logs.map((l) => l.god_id)).size // 대화를 나눈 신의 수
  // 가장 자주 이야기한 신
  const counts = {}
  logs.forEach((l) => { counts[l.god_id] = (counts[l.god_id] ?? 0) + 1 })
  const topId = Object.keys(counts).sort((x, y) => counts[y] - counts[x])[0]
  const topGod = topId ? godById(topId) : null
  // 나눈 말이 쌓일수록 올라가는 칭호
  const rank = logs.length >= 30 ? '탐라의 이야기꾼' : logs.length >= 12 ? '신들의 벗' : logs.length >= 3 ? '별 헤는 여행자' : '새내기 여행자'

  return (
    <>
      <PageHeader title="내 신 기록" desc="닉네임으로 구분해서 즐겨찾기한 신과 나눈 대화를 보관해요. 새로고침해도 남아 있어요." />

      {!supabase && <div className="alert alert-warning">Supabase가 연결되지 않았어요. <code>.env.local</code>의 <code>VITE_SUPABASE_URL</code>과 <code>VITE_SUPABASE_ANON_KEY</code>를 채워 주세요.</div>}
      {dbError && supabase && <div className="alert alert-danger">{dbError}</div>}

      <section className="pf">
        <svg className="pf-sky" viewBox="0 0 800 260" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <polyline points="520,60 590,100 660,70 730,120 780,90" fill="none" stroke="#fff" strokeOpacity=".25" />
          {[[520, 60], [590, 100], [660, 70], [730, 120], [780, 90], [470, 150], [610, 190], [700, 200]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i < 5 ? 2.6 : 1.5} fill="#fff" className="bg-star" style={{ animationDelay: `${i * 0.4}s` }} />
          ))}
        </svg>
        <div className="pf-main">
          <div className="pf-avatar">
            <span className="pf-orbit" /><span className="pf-orbit o2" />
            <i className="pf-sat" />
            <span className="pf-moon"><i className="bi bi-moon-stars-fill" /></span>
          </div>
          <div className="pf-info">
            <span className="pf-rank"><i className="bi bi-stars me-1" />{rank}</span>
            <div className="pf-name serif">{nickname || '익명'}</div>
            <form className="pf-form" onSubmit={save}>
              <i className="bi bi-pencil" aria-hidden="true" />
              <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="닉네임을 바꿔 보세요 (비우면 익명)" maxLength={20} aria-label="닉네임" />
              <button aria-label="닉네임 저장"><i className={`bi ${saved ? 'bi-check2' : 'bi-arrow-right'}`} /></button>
            </form>
          </div>
        </div>
        <div className="pf-stats">
          <div className="pf-stat"><i className="bi bi-star-fill" /><b><CountUp value={favorites.length} /></b><span>즐겨찾기한 신</span></div>
          <div className="pf-stat"><i className="bi bi-chat-quote-fill" /><b><CountUp value={logs.length} /></b><span>나눈 말</span></div>
          <div className="pf-stat"><i className="bi bi-people-fill" /><b><CountUp value={talked} /></b><span>만난 신</span></div>
          <div className="pf-stat top">
            {topGod ? <GodAvatar id={topGod.id} size={46} active /> : <i className="bi bi-question-circle" />}
            <b className="serif">{topGod ? topGod.name.replace(/\(.*\)/, '') : '아직 없어요'}</b>
            <span>가장 자주 만난 신</span>
          </div>
        </div>
      </section>

      <h2 className="h5 sea mb-3"><i className="bi bi-star me-1" />즐겨찾기한 신 <span className="sec-count">{favorites.length}</span></h2>
      {favorites.length === 0 ? (
        <Empty>아직 없어요. <Link to="/myths">별자리</Link>에서 신을 골라 즐겨찾기를 눌러 보세요.</Empty>
      ) : (
        <div className="fav-grid mb-4">
          {favorites.map((id, i) => {
            const g = godById(id)
            return g && (
              <Link key={id} to="/myths" className="fav-card" style={{ '--i': i }}>
                <GodArt id={id} className="fav-card-art" />
                <div className="fav-card-body">
                  <strong className="serif">{g.name}</strong>
                  <span>{g.role}</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      <h2 className="h5 sea mt-4 mb-3"><i className="bi bi-chat-quote me-1" />최근 대화 <span className="sec-count">{logs.length}</span></h2>
      {logs.length === 0 ? (
        <Empty>아직 없어요. <Link to="/agent">신과 대화</Link>를 해 보세요.</Empty>
      ) : (
        <ul className="list-unstyled log-feed">
          {logs.map((l, i) => {
            const g = godById(l.god_id)
            const me = l.role === 'user'
            const day = dayLabel(l.created_at)
            const newDay = i === 0 || day !== dayLabel(logs[i - 1].created_at)
            return (
              <Fragment key={l.id}>
              {newDay && <li className="log-day"><span>{day}</span></li>}
              <li className={me ? 'me' : 'god'} style={{ '--i': Math.min(i, 12) }}>
                {!me && <GodAvatar id={l.god_id} size={34} />}
                <div className="log-main">
                  <div className="log-meta">{me ? '나' : g?.name ?? l.god_id} · {fmt(l.created_at)}</div>
                  <div className="log-text">{l.text}</div>
                </div>
              </li>
              </Fragment>
            )
          })}
        </ul>
      )}
    </>
  )
}
