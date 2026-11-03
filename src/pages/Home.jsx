import { lazy, Suspense, useRef } from 'react'
import { Link } from 'react-router-dom'
import TodayGod from '../components/TodayGod'
import SkyBackground from '../components/SkyBackground'
import HeroConstellation from '../components/HeroConstellation'
import GodMarquee from '../components/GodMarquee'
import { FeatureTiles } from '../components/HomeBlocks'
import Reveal from '../components/Reveal'
import IntroVideo from '../components/IntroVideo'
import '../styles/home.css'

// 3D 별자리: WebGL 을 쓸 수 있고 '움직임 줄이기'가 아닐 때만. 아니면(또는 불러오는 동안) 기존 2D 별자리를 보여 준다
const HeroConstellation3D = lazy(() => import('../components/HeroConstellation3D'))
const canUse3D = () => {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    const c = document.createElement('canvas')
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'))
  } catch { return false }
}

// 첫 화면: 기획 의도가 한 줄로 보여야 합니다
const INTENT = '1만 8천 신이 깃든 땅의 신화와 설화를 AI 이야기꾼과 함께 오늘의 날씨와 장소 위에서 다시 만납니다.'

export default function Home() {
  const hero = useRef(null)
  const use3d = useRef(canUse3D()).current
  // 마우스를 움직이면 달·오로라·별자리가 층마다 다르게 따라 움직인다 (시차)
  const onMove = (e) => {
    const r = hero.current.getBoundingClientRect()
    hero.current.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3))
    hero.current.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5).toFixed(3))
  }
  return (
    <>
      <section ref={hero} className="hero" onMouseMove={onMove}>
        <SkyBackground />
        {use3d ? <Suspense fallback={<HeroConstellation />}><HeroConstellation3D /></Suspense> : <HeroConstellation />}
        <div className="aurora" aria-hidden="true" />
        <div className="moon" />
        <p className="page-eyebrow mb-2 rise" style={{ animationDelay: '.15s' }}>Jeju Myth · Public Data · AI Agent</p>
        <h1 className="display-3 hero-title title-shimmer mb-3 rise" style={{ animationDelay: '.25s' }}>신들의 섬, <span className="accent">제주</span></h1>
        <p className="lead mx-auto mb-4 serif rise" style={{ maxWidth: 640, lineHeight: 1.8, animationDelay: '.4s' }}>{INTENT}</p>
        <div className="d-flex gap-2 justify-content-center flex-wrap rise" style={{ animationDelay: '.55s' }}>
          <Link to="/myths" className="btn btn-yuchae btn-lg px-4">별자리 열기</Link>
          <Link to="/agent" className="btn btn-hanji btn-lg px-4">신과 대화</Link>
        </div>
        <a href="#home-more" className="hero-scroll rise" style={{ animationDelay: '.9s' }} aria-label="아래로 내려가기">
          <span>아래로</span><i className="bi bi-chevron-double-down" />
        </a>
        <svg className="waves" viewBox="0 0 1200 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 50 Q150 0 300 50 T600 50 T900 50 T1200 50 V100 H0Z" />
          <path d="M0 65 Q150 15 300 65 T600 65 T900 65 T1200 65 V100 H0Z" />
        </svg>
      </section>
      <div id="home-more" />
      <Reveal className="mb-5"><GodMarquee /></Reveal>
      <Reveal className="mb-5"><IntroVideo /></Reveal>
      <Reveal><TodayGod /></Reveal>
      <FeatureTiles />
    </>
  )
}
