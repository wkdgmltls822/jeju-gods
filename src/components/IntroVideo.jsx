import { useState } from 'react'
import SkyBackground from './SkyBackground'
import { INTRO_VIDEO } from '../data/video'

// 홈 소개 영상. 누르기 전에는 영상을 불러오지 않아서 첫 화면이 가볍습니다.
export default function IntroVideo() {
  const { title, src, youtube, poster } = INTRO_VIDEO
  const ready = Boolean(src || youtube)
  const [playing, setPlaying] = useState(false)

  return (
    <section className="intro-video mx-auto">
      <div className="iv-head">
        <span className="tale-chip"><i className="bi bi-camera-video me-1" />소개 영상</span>
        <h2 className="h4 serif mb-0">{title}</h2>
      </div>
      <div className={`iv-frame ${ready ? '' : 'soon'}`}>
        {playing && ready ? (
          youtube ? (
            <iframe title={title} src={`https://www.youtube-nocookie.com/embed/${youtube}?autoplay=1&rel=0`}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
          ) : (
            <video src={src} poster={poster || undefined} controls autoPlay playsInline />
          )
        ) : (
          <button type="button" className="iv-cover" disabled={!ready} onClick={() => setPlaying(true)}
            aria-label={ready ? `${title} 재생` : '소개 영상 준비 중'}>
            {poster ? <img src={poster} alt="" /> : <SkyBackground />}
            <span className="iv-shade" />
            <span className="iv-play"><i className={`bi ${ready ? 'bi-play-fill' : 'bi-moon-stars-fill'}`} /></span>
            <span className="iv-label">{ready ? '눌러서 재생' : '영상 준비 중이에요'}</span>
          </button>
        )}
      </div>
    </section>
  )
}
