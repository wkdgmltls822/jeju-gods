import { Link } from 'react-router-dom'
import CountUp from './CountUp'
import Reveal from './Reveal'

// 홈: 숫자로 보는 요약, 메뉴 카드

const STATS = [
  { icon: 'stars', value: 10, label: '신화 속 신', color: '#7dd3fc' },
  { icon: 'database', value: 3, label: '공공데이터 API', color: '#fde68a' },
  { icon: 'badge-3d', value: 3, label: '별자리 보기 방식', color: '#c4b5fd' },
  { icon: 'tools', value: 4, label: 'AI 에이전트 도구', color: '#f9a8d4' },
]

export function HomeStats() {
  return (
    <section className="home-stats" aria-label="한눈에 보기">
      {STATS.map((s, i) => (
        <div key={s.label} className="hs-tile" style={{ '--c': s.color, '--i': i }}>
          <i className={`bi bi-${s.icon}`} />
          <b><CountUp value={s.value} duration={1200} /></b>
          <span>{s.label}</span>
        </div>
      ))}
    </section>
  )
}

const TILES = [
  { to: '/myths', icon: 'stars', color: '#c4b5fd', title: '별자리', desc: '신 열 명을 평면·3D 별자리와 3D 제주 지도로 만나요', tag: 'TourAPI · Three.js' },
  { to: '/weather', icon: 'cloud-sun', color: '#fde68a', title: '날씨', desc: '기상청 예보가 오늘 어울리는 신을 불러와요', tag: '기상청 단기예보' },
  { to: '/agent', icon: 'chat-quote', color: '#f9a8d4', title: '신과 대화', desc: 'AI가 도구를 스스로 골라 신의 목소리로 답해요', tag: 'AI 에이전트' },
  { to: '/my', icon: 'bookmark-star', color: '#5eead4', title: '내 신 기록', desc: '즐겨찾기한 신과 나눈 대화가 저장돼요', tag: 'Supabase' },
]

export function FeatureTiles() {
  return (
    <section className="feat" aria-label="둘러보기">
      <h2 className="feat-title serif"><i className="bi bi-compass me-2" />어디부터 둘러볼까요?<span className="feat-line" /></h2>
      <div className="feat-grid">
        {TILES.map((t, i) => (
          <Reveal key={t.to} delay={i * 0.09}>
            <Link to={t.to} className="feat-tile" style={{ '--c': t.color }}>
              <span className="ft-icon"><i className={`bi bi-${t.icon}`} /></span>
              <h3 className="serif">{t.title}</h3>
              <p>{t.desc}</p>
              <span className="ft-tag">{t.tag}</span>
              <i className="bi bi-arrow-right ft-arrow" />
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
