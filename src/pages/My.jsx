import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import GodArt from '../components/GodArt'
import GodAvatar from '../components/GodAvatar'
import CountUp from '../components/CountUp'
import { Empty } from '../components/Status'
import { godById } from '../data/gods'
import { useAppStore } from '../store/useAppStore'
import { supabase } from '../lib/supabase'

const fmt = (iso) => new Date(iso).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })

// 내 신 기록: 닉네임별로 Supabase 에 저장된 즐겨찾기 신과 대화 기록
export default function My() {
  const { nickname, setNickname, favorites, loadFavorites, logs, loadLogs, dbError } = useAppStore()
  const [draft, setDraft] = useState(nickname)

  useEffect(() => { loadFavorites(); loadLogs() }, [nickname, loadFavorites, loadLogs])

  const save = (e) => { e.preventDefault(); setNickname(draft) }
  const talked = new Set(logs.map((l) => l.god_id)).size // 대화를 나눈 신의 수

  return (
    <>
      <PageHeader title="내 신 기록" desc="닉네임으로 구분해서 즐겨찾기한 신과 나눈 대화를 보관해요. 새로고침해도 남아 있어요." />

      {!supabase && <div className="alert alert-warning">Supabase가 연결되지 않았어요. <code>.env.local</code>의 <code>VITE_SUPABASE_URL</code>과 <code>VITE_SUPABASE_ANON_KEY</code>를 채워 주세요.</div>}
      {dbError && supabase && <div className="alert alert-danger">{dbError}</div>}

      <section className="profile-card">
        <div className="profile-id">
          <span className="profile-moon"><i className="bi bi-moon-stars-fill" /></span>
          <div>
            <div className="small text-secondary">여행자</div>
            <div className="profile-name serif">{nickname || '익명'}</div>
          </div>
        </div>
        <div className="profile-stats">
          <div><b><CountUp value={favorites.length} /></b><span>즐겨찾기한 신</span></div>
          <div><b><CountUp value={logs.length} /></b><span>나눈 말</span></div>
          <div><b><CountUp value={talked} /></b><span>만난 신</span></div>
        </div>
        <form className="profile-form" onSubmit={save}>
          <input className="form-control" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="닉네임 (비우면 익명)" maxLength={20} />
          <button className="btn btn-hanji text-nowrap">닉네임 저장</button>
        </form>
      </section>

      <h2 className="h5 sea mb-3"><i className="bi bi-star me-1" />즐겨찾기한 신</h2>
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

      <h2 className="h5 sea mt-4 mb-3"><i className="bi bi-chat-quote me-1" />최근 대화</h2>
      {logs.length === 0 ? (
        <Empty>아직 없어요. <Link to="/agent">신과 대화</Link>를 해 보세요.</Empty>
      ) : (
        <ul className="list-unstyled log-feed">
          {logs.map((l, i) => {
            const g = godById(l.god_id)
            const me = l.role === 'user'
            return (
              <li key={l.id} className={me ? 'me' : 'god'} style={{ '--i': Math.min(i, 12) }}>
                {!me && <GodAvatar id={l.god_id} size={34} />}
                <div className="log-main">
                  <div className="log-meta">{me ? '나' : g?.name ?? l.god_id} · {fmt(l.created_at)}</div>
                  <div className="log-text">{l.text}</div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
