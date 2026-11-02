import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ping } from '../api/client'
import { supabase } from '../lib/supabase'

// 홈 화면 "동작 체크": 앱의 각 부분이 지금 정말 동작하는지 실제로 확인해서 보여줍니다.
// 상태: ok(정상) · warn(동작은 하지만 확인 필요) · fail(문제) · pending(확인 중)
const MARK = { ok: ['check-circle-fill', 'ok'], warn: ['exclamation-circle-fill', 'warn'], fail: ['x-circle-fill', 'fail'], pending: ['hourglass-split', 'pending'] }

export default function HealthCheck() {
  const location = useLocation() // 라우터가 동작하면 값이 들어옴
  const [server, setServer] = useState({ state: 'pending' })
  const [db, setDb] = useState(
    supabase ? { state: 'pending' } : { state: 'fail', note: '.env.local 에 Supabase 값이 없어요' },
  )

  useEffect(() => {
    ping()
      .then((d) => setServer({ state: 'ok', data: d }))
      .catch((e) => setServer({ state: 'fail', note: e.message }))

    supabase?.from('favorite_gods').select('id', { count: 'exact', head: true })
      .then(({ error }) => setDb(error ? { state: 'fail', note: error.message } : { state: 'ok' }))
  }, [])

  const d = server.data
  const aiState = !d ? 'pending' : d.hasClaudeKey ? 'ok' : 'warn' // Claude 키가 아니면 임시 Gemini 또는 데모 채팅
  const aiNote = !d ? '' : d.hasClaudeKey ? 'Claude' : d.hasGeminiKey ? '임시 Gemini 사용 중' : '키 없음 → 데모 채팅'

  const items = [
    { name: 'React', state: 'ok' },
    { name: '라우터', state: location.pathname ? 'ok' : 'fail', note: location.pathname },
    { name: 'Supabase', ...db },
    { name: '서버 함수 /api', ...server },
    { name: '공공데이터 키', state: !d ? 'pending' : d.hasDataKey ? 'ok' : 'fail', note: d && !d.hasDataKey ? '서버에 키가 없어요' : '' },
    { name: 'AI 키', state: aiState, note: aiNote },
  ]

  return (
    <section className="health mx-auto" aria-label="동작 체크">
      <h2 className="h6 sea mb-2"><i className="bi bi-activity me-1" />동작 체크</h2>
      <ul className="list-unstyled mb-0 health-list">
        {items.map((it) => {
          const [icon, cls] = MARK[it.state]
          return (
            <li key={it.name} className={`health-item ${cls}`} title={it.note || ''}>
              <i className={`bi bi-${icon} me-1`} />{it.name}
              {it.note && <span className="health-note"> · {it.note}</span>}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
