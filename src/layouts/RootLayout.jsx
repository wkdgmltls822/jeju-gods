import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { NAV_ITEMS } from '../router'
import { useAppStore } from '../store/useAppStore'
import PageBackground from '../components/PageBackground'
import SiteFooter from '../components/SiteFooter'
import ScrollUI from '../components/ScrollUI'
import SideDecor from '../components/SideDecor'
import CursorGlow from '../components/CursorGlow'
import PageWarp from '../components/PageWarp'

// 홈은 자기 하늘이 있어서, 나머지 화면만 주소에 맞는 배경을 깐다
const BG_THEME = { '/myths': 'myths', '/agent': 'agent', '/my': 'my' }

export default function RootLayout() {
  const nickname = useAppStore((s) => s.nickname)
  const { pathname } = useLocation()
  const bg = BG_THEME[pathname]
  return (
    <>
      {bg && <PageBackground key={bg} theme={bg} />}
      {/* 페이지 배경보다 뒤에 두면 가려지므로, 배경 다음(같은 층에서 위)에 그린다 */}
      <SideDecor hasBg={Boolean(bg)} />
      <nav className="navbar navbar-expand site-nav sticky-top">
        <div className="container">
          <NavLink to="/" className="navbar-brand serif fw-black brand-shimmer">
            <i className="bi bi-moon-stars-fill me-2" />신들의 섬, 제주
          </NavLink>
          <ul className="navbar-nav ms-auto gap-1">
            {NAV_ITEMS.map((n, i) => (
              <li className="nav-item" key={n.to} style={{ '--nc': n.color, '--i': i }}>
                <NavLink to={n.to} end={n.to === '/'} className="nav-link">
                  <i className={`bi bi-${n.icon} me-1`} />
                  <span className="d-none d-md-inline">{n.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
          {nickname && (
            <span className="navbar-text ms-3 small d-none d-sm-inline nick">
              <i className="bi bi-person-circle me-1" />{nickname}
            </span>
          )}
        </div>
      </nav>
      <main className="container py-5 page-main">
        {/* 주소가 바뀔 때마다 key 가 달라져서 페이지가 새로 떠오르며 나타난다 */}
        <div key={pathname} className="page-enter"><Outlet /></div>
      </main>
      <SiteFooter />
      <ScrollUI />
      <CursorGlow />
      <PageWarp />
    </>
  )
}
