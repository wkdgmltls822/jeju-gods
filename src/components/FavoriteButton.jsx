import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'

// 신을 즐겨찾기에 담고 빼는 별 버튼 (Supabase 에 저장돼서 새로고침해도 남음)
export default function FavoriteButton({ godId }) {
  const favorites = useAppStore((s) => s.favorites)
  const toggle = useAppStore((s) => s.toggleFavorite)
  const load = useAppStore((s) => s.loadFavorites)
  useEffect(() => { load() }, [load])

  const on = favorites.includes(godId)
  return (
    <button type="button" className={`btn btn-sm ${on ? 'btn-yuchae' : 'btn-hanji'}`} onClick={() => toggle(godId)} aria-pressed={on}>
      <i className={`bi bi-star${on ? '-fill' : ''} me-1`} />{on ? '즐겨찾기됨' : '즐겨찾기'}
    </button>
  )
}
