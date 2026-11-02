import { useEffect, useRef, useState } from 'react'
import PageHeader from '../components/PageHeader'
import GodAvatar from '../components/GodAvatar'
import GodArt from '../components/GodArt'
import { GODS, godById } from '../data/gods'
import { useAppStore } from '../store/useAppStore'

const TOOL_LABEL = {
  get_weather: { icon: 'cloud-sun', text: '기상청 날씨 조회' },
  search_places: { icon: 'geo-alt', text: '관광공사 장소 검색' },
  get_visitors: { icon: 'people', text: '서귀포 관람객 조회' },
  get_god: { icon: 'book', text: '신 이야기 조회' },
}

const SUGGESTIONS = [
  { text: '오늘 날씨에 어디를 가면 좋을까요?', icon: 'cloud-sun', tag: '날씨 · 장소' },
  { text: '당신의 이야기를 들려주세요', icon: 'book', tag: '신 이야기' },
  { text: '당신과 이어진 장소는 어디인가요?', icon: 'geo-alt', tag: '관광지' },
]

// 처음 만났을 때 신이 건네는 인사 (신마다 말투를 다르게)
const GREET = {
  seolmundae: '어서 오너라, 작은 이여. 한라산 자락까지 먼 길 왔구나.',
  cheonjiwang: '하늘 문이 열렸다. 무엇이 궁금해 올라왔느냐.',
  daebyeol: '이승에서 왔느냐, 저승이 궁금하더냐. 편히 물어보아라.',
  samseong: '삼성혈 앞에 선 걸 환영하네. 탐라의 옛이야기를 나눠 보세.',
  baekjuddo: '송당 오름 바람이 너를 데려왔구나. 앉아서 이야기하자꾸나.',
  yeongdeung: '바람 타고 왔다, 오래 머물진 못한다. 서둘러 물어보렴.',
  jacheongbi: '반갑구나! 씨앗 이야기부터 사랑 이야기까지, 다 들려주마.',
  munjeon: '문턱을 넘어왔으니 이제 한 식구다. 어서 들어오너라.',
  jowang: '아궁이 불이 따뜻하지? 가까이 앉아 이야기를 나누자.',
  chilseong: '쉿, 조용히 오거라. 이 집 복은 내가 지키고 있단다.',
}

// 에이전트가 이번 답을 위해 스스로 고른 도구들 (과제 확인 항목: "에이전트가 호출한 도구" 목록)
function Steps({ steps }) {
  if (!steps?.length) return <div className="steps text-secondary">도구 없이 답했어요</div>
  return (
    <div className="steps">
      <span className="text-secondary me-2">에이전트가 호출한 도구</span>
      {steps.map((s, i) => {
        const meta = TOOL_LABEL[s.tool] ?? { icon: 'tools', text: s.tool }
        const arg = Object.values(s.input ?? {})[0]
        return (
          <span key={i} className={`step-chip ${s.ok ? '' : 'fail'}`}>
            <i className={`bi bi-${meta.icon} me-1`} />{meta.text}{arg ? ` · ${arg}` : ''}
          </span>
        )
      })}
    </div>
  )
}

export default function Agent() {
  const { chatGodId, setChatGod, messages, chatLoading, chatError, sendMessage } = useAppStore()
  const [text, setText] = useState('')
  const bottom = useRef(null)
  const god = godById(chatGodId)

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [messages, chatLoading])

  const submit = (e, preset) => {
    e?.preventDefault()
    const t = (preset ?? text).trim()
    if (!t || chatLoading) return
    setText('')
    sendMessage(t)
  }

  return (
    <>
      <PageHeader title="신과 대화" desc="신을 고르면 그 신의 말투로 답해요. 날씨와 장소는 AI가 스스로 도구를 골라 확인해요." />

      <div className="god-picker" role="radiogroup" aria-label="대화할 신">
        {GODS.map((g) => (
          <button key={g.id} type="button" role="radio" aria-checked={g.id === chatGodId} className={g.id === chatGodId ? 'pick on' : 'pick'}
            onClick={() => setChatGod(g.id)}>
            <GodAvatar id={g.id} size={54} active={g.id === chatGodId} />
            <span>{g.name.replace(/\(.*\)/, '')}</span>
          </button>
        ))}
      </div>

      <div className="chat-head">
        <GodArt id={god.id} className="chat-head-art" />
        <div className="chat-head-text">
          <div className="tale-chip mb-1"><i className="bi bi-book me-1" />{god.tale}</div>
          <h2 className="h4 serif mb-0">{god.name}</h2>
          <div className="accent small">{god.role}</div>
        </div>
      </div>

      <div className="chat-box">
        {messages.length === 0 && (
          <div className="chat-empty">
            <div className="empty-orbit">
              <span className="orbit-ring" /><span className="orbit-ring r2" />
              <i className="orbit-star s1" /><i className="orbit-star s2" /><i className="orbit-star s3" />
              <GodAvatar id={god.id} size={84} active />
            </div>
            <p className="empty-name serif">{god.name}</p>
            <p className="empty-greet"><i className="bi bi-quote" />{GREET[god.id] ?? '무엇이든 물어보아라.'}</p>
            <p className="empty-hint">아래 질문을 눌러 시작하거나, 직접 물어보세요</p>
            <div className="suggest-grid">
              {SUGGESTIONS.map((s, i) => (
                <button key={s.text} type="button" className="suggest" style={{ '--i': i }} onClick={() => submit(null, s.text)}>
                  <i className={`bi bi-${s.icon}`} />
                  <span className="suggest-tag">{s.tag}</span>
                  <span className="suggest-text">{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.role}`}>
            {m.role === 'assistant' ? (
              <div className="b-row">
                <GodAvatar id={god.id} size={34} />
                <div className="b-main">
                  <div className="who">{god.name}</div>
                  <div className="body">{m.text}</div>
                  {m.demo
                    ? <div className="steps demo-note"><i className="bi bi-info-circle me-1" />데모 응답 · AI·API 없이 미리 준비한 답이에요 ({m.demoReason})</div>
                    : <Steps steps={m.steps} />}
                </div>
              </div>
            ) : <div className="body">{m.text}</div>}
          </div>
        ))}
        {chatLoading && (
          <div className="bubble assistant" role="status">
            <div className="b-row">
              <GodAvatar id={god.id} size={34} />
              <div className="b-main"><div className="body"><span className="typing" aria-hidden="true"><i /><i /><i /></span><span className="visually-hidden">{god.name}이(가) 생각하는 중</span></div></div>
            </div>
          </div>
        )}
        {chatError && <div className="alert alert-danger py-2 mb-0">{chatError}</div>}
        <div ref={bottom} />
      </div>

      <form className="ask-bar" onSubmit={submit}>
        <i className="bi bi-stars ask-icon" aria-hidden="true" />
        <input className="ask-input" value={text} onChange={(e) => setText(e.target.value)}
          placeholder={`${god.name}에게 묻기`} maxLength={300} disabled={chatLoading} aria-label={`${god.name}에게 묻기`} />
        <span className="ask-count" aria-hidden="true">{text.length}/300</span>
        <button className="ask-send" disabled={chatLoading || !text.trim()} aria-label="보내기">
          <i className="bi bi-send-fill" />
        </button>
      </form>
    </>
  )
}
