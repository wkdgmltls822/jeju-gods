import { Link } from 'react-router-dom'
import { NAV_ITEMS } from '../router'

// 사이트 맨 아래: 별자리 구분선, 메뉴 바로가기, 데이터 출처
const DOTS = [[60, 26], [150, 12], [250, 30], [360, 10], [470, 28], [580, 14], [690, 26], [760, 12]]

export default function SiteFooter() {
  return (
    <footer className="site-footer page-main">
      <svg className="sf-line" viewBox="0 0 820 40" preserveAspectRatio="none" aria-hidden="true">
        <polyline points={DOTS.map((d) => d.join(',')).join(' ')} fill="none" stroke="#8fb4ff" strokeOpacity=".35" strokeDasharray="2 6" />
        {DOTS.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 3 : 2} className="sf-dot" style={{ animationDelay: `${i * 0.35}s` }} />)}
      </svg>
      <div className="container">
        <div className="sf-grid">
          <div className="sf-brand">
            <div className="sf-logo serif"><i className="bi bi-moon-stars-fill me-2" />신들의 섬, 제주</div>
            <p>1만 8천 신이 깃든 섬의 신화를<br />공공데이터와 AI 이야기꾼으로 다시 만납니다.</p>
          </div>
          <nav className="sf-links" aria-label="바로가기">
            <b>바로가기</b>
            {NAV_ITEMS.map((n) => <Link key={n.to} to={n.to}><i className={`bi bi-${n.icon} me-2`} />{n.label}</Link>)}
            <a href="/film?auto" target="_blank" rel="noreferrer"><i className="bi bi-camera-video me-2" />소개 영상</a>
          </nav>
          <div className="sf-credits">
            <b>데이터 출처</b>
            <span>한국관광공사 국문 관광정보(TourAPI)</span>
            <span>기상청 단기예보 조회서비스</span>
            <span>제주특별자치도 서귀포시 직영관광지 관람객수</span>
            <span className="sf-note">공공데이터포털 · 장소 사진은 한국관광공사 제공</span>
          </div>
        </div>
        <p className="sf-copy">제주대 청년도약 부트캠프 BOOT UP · 제주 신화·설화 IP</p>
      </div>
    </footer>
  )
}
