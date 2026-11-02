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

const SUGGESTIONS = ['오늘 날씨에 어디를 가면 좋을까요?', '당신의 이야기를 들려주세요', '당신과 이어진 장소는 어디인가요?']

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
          <div className="text-center text-secondary py-4">
            <GodAvatar id={god.id} size={72} active />
            <p className="serif my-3">{god.name}에게 무엇이든 물어보세요.</p>
            <div className="d-flex gap-2 justify-content-center flex-wrap">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" className="btn btn-hanji btn-sm" onClick={() => submit(null, s)}>{s}</button>
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

      <form className="d-flex gap-2 mt-3" onSubmit={submit}>
        <input className="form-control" value={text} onChange={(e) => setText(e.target.value)}
          placeholder={`${god.name}에게 묻기`} maxLength={300} disabled={chatLoading} />
        <button className="btn btn-yuchae px-4 text-nowrap" disabled={chatLoading || !text.trim()}>보내기</button>
      </form>
    </>
  )
}
