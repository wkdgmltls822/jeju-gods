import { Link } from 'react-router-dom'
import WeatherBadge from '../components/WeatherBadge'
import TodayGod from '../components/TodayGod'
import HealthCheck from '../components/HealthCheck'
import SkyBackground from '../components/SkyBackground'
import Reveal from '../components/Reveal'
import IntroVideo from '../components/IntroVideo'

// 첫 화면: 기획 의도가 한 줄로 보여야 합니다
const INTENT = '1만 8천 신이 깃든 땅의 신화와 설화를 AI 이야기꾼과 함께 오늘의 날씨와 장소 위에서 다시 만납니다.'

export default function Home() {
  return (
    <>
      <section className="hero">
        <SkyBackground />
        <div className="aurora" aria-hidden="true" />
        <div className="moon" />
        <div className="mb-3 rise" style={{ animationDelay: '.05s' }}><WeatherBadge /></div>
        <p className="page-eyebrow mb-2 rise" style={{ animationDelay: '.15s' }}>Jeju Myth · Public Data · AI Agent</p>
        <h1 className="display-3 hero-title title-shimmer mb-3 rise" style={{ animationDelay: '.25s' }}>신들의 섬, <span className="accent">제주</span></h1>
        <p className="lead mx-auto mb-4 serif rise" style={{ maxWidth: 640, lineHeight: 1.8, animationDelay: '.4s' }}>{INTENT}</p>
        <div className="d-flex gap-2 justify-content-center flex-wrap rise" style={{ animationDelay: '.55s' }}>
          <Link to="/myths" className="btn btn-yuchae btn-lg px-4">별자리 열기</Link>
          <Link to="/agent" className="btn btn-hanji btn-lg px-4">신과 대화</Link>
        </div>
        <svg className="waves" viewBox="0 0 1200 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 50 Q150 0 300 50 T600 50 T900 50 T1200 50 V100 H0Z" />
          <path d="M0 65 Q150 15 300 65 T600 65 T900 65 T1200 65 V100 H0Z" />
        </svg>
      </section>
      <Reveal className="mb-5"><IntroVideo /></Reveal>
      <Reveal><TodayGod /></Reveal>
      <Reveal delay={0.1}><HealthCheck /></Reveal>
    </>
  )
}
