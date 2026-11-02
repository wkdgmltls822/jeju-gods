import { NavLink, Outlet } from 'react-router-dom'
import { NAV_ITEMS } from '../router'

export default function RootLayout() {
  return (
    <>
      <nav className="navbar navbar-expand site-nav sticky-top">
        <div className="container">
          <NavLink to="/" className="navbar-brand serif fw-black accent">
            <i className="bi bi-moon-stars-fill me-2" />신들의 섬, 제주
          </NavLink>
          <ul className="navbar-nav ms-auto gap-1">
            {NAV_ITEMS.map((n) => (
              <li className="nav-item" key={n.to}>
                <NavLink to={n.to} end={n.to === '/'} className="nav-link">
                  <i className={`bi bi-${n.icon} me-1`} />
                  <span className="d-none d-md-inline">{n.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      <main className="container py-5">
        <Outlet />
      </main>
      <footer className="container py-4 text-center text-secondary small">
        제주대 청년도약 부트캠프 BOOT UP · 제주 신화·설화 IP
      </footer>
    </>
  )
}
