import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { GOD_COLORS, pickGodForWeather } from '../data/gods'
import { useAppStore } from '../store/useAppStore'
import GodBanner from './GodBanner'
import { Chars, Words } from './AnimatedText'
import { godTimeline } from '../lib/godTimeline'
import '../styles/todaygod.css'

// 홈 화면: 오늘 날씨가 불러온 신 한 명. 카드가 보이면 글이 차례로 나타난다.
export default function TodayGod() {
  const weather = useAppStore((s) => s.weather)
  const loadWeather = useAppStore((s) => s.loadWeather)
  const setChatGod = useAppStore((s) => s.setChatGod)
  useEffect(() => { loadWeather() }, [loadWeather])

  const { god, reason } = pickGodForWeather(weather)
  const t = godTimeline({ name: god.name, reason, text: god.text })

  return (
    <section className="today-card" style={{ '--c': GOD_COLORS[god.id] }}>
      <div className="today-art">
        <GodBanner key={god.id} god={god} />
        <span className="today-badge"><i className="bi bi-stars me-1" />오늘의 신</span>
      </div>
      {/* 신이 바뀌면(날씨가 불러와지면) 글이 처음부터 다시 나타난다 */}
      <div key={god.id} className="today-body">
        <div className="today-tale tg-pop" style={{ '--d': `${t.tale}s` }}><i className="bi bi-book me-1" />{god.tale}</div>
        <h2 className="today-name serif"><Chars text={god.name} base={t.nameStart} /></h2>
        <p className="today-role tg-pop" style={{ '--d': `${t.role.toFixed(2)}s` }}>{god.role}</p>
        <p className="today-reason tg-pop" style={{ '--d': `${t.reasonPop.toFixed(2)}s` }}><i className="bi bi-quote" /><Words text={reason} base={t.reasonWords} /></p>
        <p className="today-text"><Words text={god.text} base={t.textStart} step={0.03} /></p>
        <div className="today-actions tg-pop" style={{ '--d': `${t.actions.toFixed(2)}s` }}>
          <Link to="/myths" className="btn btn-yuchae px-3">별자리에서 만나기</Link>
          <Link to="/agent" className="btn btn-hanji px-3" onClick={() => setChatGod(god.id)}>
            <i className="bi bi-chat-quote me-1" />이 신과 대화
          </Link>
        </div>
      </div>
    </section>
  )
}
