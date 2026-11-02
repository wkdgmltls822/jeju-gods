import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { NAV_ITEMS } from '../router'

// 사이트 맨 아래: 별자리 구분선(빛이 흐름), 바로가기, 데이터 출처, 아래쪽 한라산과 바다
// 푸터가 화면에 들어오면 한 번 "등장" 연출이 시작되고, 그 뒤로는 별가루·별똥별·파도가 계속 움직인다.
const DOTS = [[60, 26], [150, 12], [250, 30], [360, 10], [470, 28], [580, 14], [690, 26], [760, 12]]
const PATH = 'M' + DOTS.map((d) => d.join(' ')).join(' L')
// 떠다니는 별가루: 매번 같은 모양이 나오도록 숫자로 고정
const DUST = Array.from({ length: 18 }, (_, i) => ({ left: (i * 53 + 11) % 100, size: 2 + (i % 3), dur: 9 + (i * 7) % 8, delay: -((i * 3.7) % 12) }))
const WAVE = (y) => `M0 ${y} ` + Array.from({ length: 24 }, (_, i) => `Q${i * 50 + 25} ${y - 7} ${i * 50 + 50} ${y}`).join(' ')

export default function SiteFooter() {
  const ref = useRef(null)
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const el = ref.current
    if (inView || !el) return undefined
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold: 0.12 })
    io.observe(el)
    // 안전장치: 관찰이 늦어져도, 푸터가 화면에 보이면 스크롤·타이머로 한 번 더 확인한다
    const check = () => { if (el.getBoundingClientRect().top < window.innerHeight * 0.92) setInView(true) }
    window.addEventListener('scroll', check, { passive: true })
    const t = setTimeout(check, 1200)
    return () => { io.disconnect(); window.removeEventListener('scroll', check); clearTimeout(t) }
  }, [inView])

  // 바로가기: 홈 · 별자리 · 날씨 · 신과 대화 · 내 신 기록 · 소개 영상
  const links = [
    ...NAV_ITEMS.map((n) => ({ key: n.to, to: n.to, icon: n.icon, label: n.label, color: n.color ?? '#7dd3fc' })),
    { key: 'film', href: '/film?auto&exit', icon: 'camera-video', label: '소개 영상', color: '#fdba74' },
  ]

  return (
    <footer ref={ref} className={`site-footer page-main ${inView ? 'in' : ''}`}>
      <div className="sf-sky" aria-hidden="true">
        {DUST.map((d, i) => <i key={i} style={{ left: `${d.left}%`, width: d.size, height: d.size, animationDuration: `${d.dur}s`, animationDelay: `${d.delay}s` }} />)}
        <span className="sf-meteor" /><span className="sf-meteor m2" />
      </div>
      <svg className="sf-line" viewBox="0 0 820 40" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="sf-grad" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#7dd3fc" /><stop offset=".5" stopColor="#a78bfa" /><stop offset="1" stopColor="#f9a8d4" /></linearGradient>
        </defs>
        <path d={PATH} fill="none" stroke="#8fb4ff" strokeOpacity=".3" strokeDasharray="2 6" />
        <path d={PATH} fill="none" stroke="url(#sf-grad)" strokeWidth="1.6" pathLength="1" className="sf-draw" />
        {DOTS.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 3 : 2} className="sf-dot" style={{ animationDelay: `${i * 0.35}s` }} />)}
        <circle r="3.4" className="sf-travel" style={{ offsetPath: `path('${PATH}')` }} />
      </svg>
      <div className="container sf-content">
        <div className="sf-grid">
          <div className="sf-brand sf-in" style={{ '--k': 0 }}>
            <div className="sf-logo serif"><i className="bi bi-moon-stars-fill me-2" /><span>신들의 섬, 제주</span></div>
            <p>1만 8천 신이 깃든 섬의 신화를<br />공공데이터와 AI 이야기꾼으로 다시 만납니다.</p>
            <a className="sf-qr" href="https://jeju-gods.vercel.app" aria-label="휴대폰으로 열기: 신들의 섬, 제주 QR 코드">
              <img src="/images/qr.png" alt="신들의 섬, 제주 사이트 주소 QR 코드" width="104" height="104" loading="lazy" />
              <span><b><i className="bi bi-phone me-1" />휴대폰으로 열기</b><small>카메라로 QR을 스캔하면<br />이 사이트가 열려요</small></span>
            </a>
          </div>
          <nav className="sf-links" aria-label="바로가기">
            <b className="sf-in" style={{ '--k': 1 }}>바로가기</b>
            <div className="sf-rail" aria-hidden="true"><i /></div>
            {links.map((l, i) => {
              const inner = <><i className={`bi bi-${l.icon} me-2`} />{l.label}</>
              const style = { '--k': i, '--lc': l.color }
              return l.to
                ? <Link key={l.key} to={l.to} className="sf-link" style={style}>{inner}</Link>
                : <a key={l.key} href={l.href} target="_blank" rel="noreferrer" className="sf-link" style={style}>{inner}</a>
            })}
          </nav>
          <div className="sf-credits">
            <b className="sf-in" style={{ '--k': 1 }}>데이터 출처</b>
            <span className="sf-in" style={{ '--k': 2 }}>한국관광공사 국문 관광정보(TourAPI)</span>
            <span className="sf-in" style={{ '--k': 3 }}>기상청 단기예보 조회서비스</span>
            <span className="sf-in" style={{ '--k': 4 }}>제주특별자치도 서귀포시 직영관광지 관람객수</span>
            <span className="sf-note sf-in" style={{ '--k': 5 }}>공공데이터포털 · 장소 사진은 한국관광공사 제공</span>
          </div>
        </div>
        <p className="sf-copy sf-in" style={{ '--k': 9 }}>제주대 청년도약 부트캠프 BOOT UP · 제주 신화·설화 IP</p>
      </div>
      <svg className="sf-hills" viewBox="0 0 1200 140" preserveAspectRatio="none" aria-hidden="true">
        <path className="sf-hill far" d="M-40 140 V92 Q150 60 300 86 T600 82 Q690 42 760 28 Q830 42 910 82 T1240 88 V140Z" />
        <path className="sf-hill near" d="M-40 140 V114 Q200 92 400 110 T800 108 T1240 102 V140Z" />
        <path className="sf-wave" d={WAVE(132)} />
        <path className="sf-wave w2" d={WAVE(124)} />
      </svg>
    </footer>
  )
}
