import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
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

  return (
    <>
      <PageHeader title="내 신 기록" desc="닉네임으로 구분해서 즐겨찾기한 신과 나눈 대화를 보관해요. 새로고침해도 남아 있어요." />

      {!supabase && <div className="alert alert-warning">Supabase가 연결되지 않았어요. <code>.env.local</code>의 <code>VITE_SUPABASE_URL</code>과 <code>VITE_SUPABASE_ANON_KEY</code>를 채워 주세요.</div>}
      {dbError && supabase && <div className="alert alert-danger">{dbError}</div>}

      <form className="d-flex gap-2 mb-4" onSubmit={save}>
        <input className="form-control" style={{ maxWidth: 260 }} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="닉네임 (비우면 익명)" maxLength={20} />
        <button className="btn btn-hanji text-nowrap">닉네임 저장</button>
      </form>

      <h2 className="h5 sea mb-3"><i className="bi bi-star me-1" />즐겨찾기한 신</h2>
      {favorites.length === 0 ? (
        <Empty>아직 없어요. <Link to="/myths">별자리</Link>에서 신을 골라 즐겨찾기를 눌러 보세요.</Empty>
      ) : (
        <div className="d-flex gap-2 flex-wrap mb-4">
          {favorites.map((id) => {
            const g = godById(id)
            return g && <span key={id} className="fav-chip"><strong>{g.name}</strong> · {g.role}</span>
          })}
        </div>
      )}

      <h2 className="h5 sea mt-4 mb-3"><i className="bi bi-chat-quote me-1" />최근 대화</h2>
      {logs.length === 0 ? (
        <Empty>아직 없어요. <Link to="/agent">신과 대화</Link>를 해 보세요.</Empty>
      ) : (
        <ul className="list-unstyled log-list">
          {logs.map((l, i) => (
            <li key={l.id} style={{ '--i': Math.min(i, 12) }}>
              <span className="text-secondary small">{fmt(l.created_at)} · {godById(l.god_id)?.name ?? l.god_id} · {l.role === 'user' ? '나' : '신'}</span>
              <div>{l.text}</div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
