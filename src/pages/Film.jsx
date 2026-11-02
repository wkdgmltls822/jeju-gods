import '../styles/film.css'
import { useEffect, useState } from 'react'
import { GODS, EDGES, GOD_COLORS, godById } from '../data/gods'
import { PINS } from '../lib/jeju'
import GodBanner from '../components/GodBanner'
import SkyBackground from '../components/SkyBackground'

// 제주 신들 소개 영상용 페이지(/film). 신 열 명을 한 명씩 사진·일러스트·이야기 글로 소개하는 장면이 자동으로 이어집니다.
// 영상 파일은 이 페이지를 녹화해서 만듭니다. 주소 끝에 ?auto 를 붙이면 바로 재생됩니다.
const INTRO = 6500, SCENE = 7600, OUTRO = 9000

function MiniMap({ activeId }) {
  return (
    <svg className="film-mini" viewBox="0 0 800 520" aria-hidden="true">
      {EDGES.map(([a, b]) => {
        const p = godById(a), q = godById(b)
        const on = a === activeId || b === activeId
        return <line key={a + b} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={on ? '#fff' : '#9fc6ff'} strokeOpacity={on ? 0.95 : 0.4} strokeWidth={on ? 7 : 4} />
      })}
      {GODS.map((g) => (
        <circle key={g.id} cx={g.x} cy={g.y} r={g.id === activeId ? 30 : 15} fill={GOD_COLORS[g.id]} opacity={g.id === activeId ? 1 : 0.7}
          className={g.id === activeId ? 'film-mini-on' : ''} />
      ))}
    </svg>
  )
}

function GodScene({ god, index }) {
  const place = PINS.find((p) => p.god === god.id)?.place
  const sentences = god.text.split(/(?<=\.)\s+/)
  return (
    <div className="film-scene" style={{ '--c': GOD_COLORS[god.id] }}>
      <GodBanner god={god} className="film-bg" />
      <div className="film-shade" />
      <div className="film-count"><b>{String(index + 1).padStart(2, '0')}</b> / {GODS.length}</div>
      <MiniMap activeId={god.id} />
      <div className="film-text">
        <span className="film-tale" style={{ animationDelay: '.5s' }}><i className="bi bi-book me-2" />{god.tale}</span>
        <h1 className="film-name" style={{ animationDelay: '.9s' }}>{god.name}</h1>
        <p className="film-role" style={{ animationDelay: '1.5s' }}>{god.role}</p>
        {sentences.map((s, i) => <p key={i} className="film-line" style={{ animationDelay: `${2.3 + i * 1.7}s` }}>{s}</p>)}
        {place && <span className="film-place" style={{ animationDelay: '5.8s' }}><i className="bi bi-geo-alt-fill me-2" />이어지는 곳 · {place}</span>}
      </div>
    </div>
  )
}

export default function Film() {
  const [run, setRun] = useState(() => new URLSearchParams(window.location.search).has('auto'))
  // 사이트에서 연 경우(?exit)에는 나갈 길을 보여 준다. 녹화할 때는 이 표시가 영상에 찍히지 않게 ?exit 없이 연다.
  const exit = new URLSearchParams(window.location.search).has('exit')
  const [i, setI] = useState(-1) // -1: 시작 장면, 0~9: 신, 10: 마무리

  useEffect(() => {
    if (!run) return undefined
    const times = [INTRO, ...GODS.map(() => SCENE), OUTRO]
    const from = new URLSearchParams(window.location.search).get('from') // ?from=7 이면 8번째 신부터(확인용)
    let k = from === null ? 0 : Number(from) + 1, timer
    const step = () => {
      if (k >= times.length) { document.body.dataset.filmDone = '1'; return }
      setI(k - 1)
      timer = setTimeout(() => { k += 1; step() }, times[k])
    }
    step()
    return () => clearTimeout(timer)
  }, [run])

  useEffect(() => {
    if (!exit) return undefined
    const onKey = (e) => { if (e.key === 'Escape') window.location.href = '/' }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [exit])

  return (
    <div className="film">
      {exit && <a href="/" className="film-exit"><i className="bi bi-x-lg me-2" />사이트로 돌아가기<small>Esc</small></a>}
      {!run && (
        <div className="film-start">
          <h1 className="film-title">제주도의 신들</h1>
          <button type="button" className="btn btn-yuchae btn-lg px-5" onClick={() => setRun(true)}><i className="bi bi-play-fill me-1" />영상 미리보기</button>
        </div>
      )}
      {run && i === -1 && (
        <div className="film-scene film-intro" key="intro">
          <SkyBackground />
          <div className="film-intro-text">
            <p className="film-eyebrow">JEJU MYTH</p>
            <h1 className="film-title">제주도의 신들</h1>
            <p className="film-sub">1만 8천 신이 깃든 섬,<br />그 신화가 별이 되었습니다</p>
          </div>
        </div>
      )}
      {run && i >= 0 && i < GODS.length && <GodScene key={GODS[i].id} god={GODS[i]} index={i} />}
      {run && i === GODS.length && (
        <div className="film-scene film-outro" key="outro">
          <SkyBackground />
          <svg className="film-outro-map" viewBox="0 0 800 520" aria-hidden="true">
            {EDGES.map(([a, b]) => { const p = godById(a), q = godById(b); return <line key={a + b} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke="#b4d4ff" strokeOpacity=".6" strokeWidth="2" /> })}
            {GODS.map((g, n) => (
              <g key={g.id} className="film-outro-star" style={{ animationDelay: `${0.4 + n * 0.35}s` }}>
                <circle cx={g.x} cy={g.y} r="26" fill={GOD_COLORS[g.id]} opacity=".25" />
                <circle cx={g.x} cy={g.y} r="9" fill={GOD_COLORS[g.id]} />
                <text x={g.x} y={g.y + 44} textAnchor="middle" className="film-outro-label">{g.name.replace(/\(.*\)/, '')}</text>
              </g>
            ))}
          </svg>
          <div className="film-outro-text">
            <h1 className="film-title small">신들의 섬, 제주</h1>
            <p className="film-sub">jeju-gods.vercel.app</p>
            {exit && <a href="/" className="btn btn-yuchae btn-lg px-5 mt-3 film-back"><i className="bi bi-house-heart me-2" />사이트 둘러보기</a>}
          </div>
        </div>
      )}
    </div>
  )
}
