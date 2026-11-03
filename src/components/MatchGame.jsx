import { useCallback, useEffect, useRef, useState } from 'react'
import { GODS, GOD_COLORS } from '../data/gods'
import CardScene3D from './CardScene3D'

// 신 카드 짝맞추기: 신 8명의 카드 두 장씩(16장)을 섞어 놓고 같은 신 두 장을 찾는다.
// 짝을 맞출 때마다 그 신의 한 줄 소개가 나오고, 걸린 시간·뒤집은 횟수를 기록한다(최고 기록은 이 브라우저에 저장).
const PAIRS = 8
const BEST_KEY = 'jeju-game:match-best'

const shuffle = (a) => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]] } return r }
const newDeck = () => shuffle(shuffle(GODS).slice(0, PAIRS).flatMap((g) => [{ uid: g.id + 'a', id: g.id }, { uid: g.id + 'b', id: g.id }]))
const readBest = () => { try { return JSON.parse(localStorage.getItem(BEST_KEY)) } catch { return null } }
const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
const godOf = (id) => GODS.find((g) => g.id === id)

export default function MatchGame({ onBack }) {
  const [deck, setDeck] = useState(newDeck)
  const [flipped, setFlipped] = useState([]) // 지금 뒤집혀 있는(아직 짝 판정 전) 카드 uid
  const [matched, setMatched] = useState([]) // 짝을 맞춘 신 id
  const [moves, setMoves] = useState(0)
  const [secs, setSecs] = useState(0)
  const [started, setStarted] = useState(false)
  const [note, setNote] = useState(null)
  const [best, setBest] = useState(readBest)
  const lock = useRef(false)
  const done = matched.length === PAIRS
  const stars = moves <= 11 ? 3 : moves <= 16 ? 2 : 1

  useEffect(() => {
    if (!started || done) return undefined
    const t = setInterval(() => setSecs((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [started, done])

  // 다 맞추면 기록 저장(뒤집은 횟수가 적을수록, 같으면 더 빠를수록 좋은 기록)
  useEffect(() => {
    if (!done) return
    const old = readBest()
    if (!old || moves < old.moves || (moves === old.moves && secs < old.secs)) {
      try { localStorage.setItem(BEST_KEY, JSON.stringify({ moves, secs })) } catch { /* 저장이 막혀 있어도 게임은 계속 */ }
      setBest({ moves, secs })
    }
  }, [done, moves, secs])

  const flip = useCallback((card) => {
    if (lock.current || flipped.includes(card.uid) || matched.includes(card.id)) return
    setStarted(true)
    const next = [...flipped, card.uid]
    setFlipped(next)
    if (next.length < 2) return
    setMoves((m) => m + 1)
    const [a, b] = next.map((u) => deck.find((c) => c.uid === u))
    if (a.id === b.id) {
      setMatched((m) => [...m, a.id])
      setFlipped([])
      const g = godOf(a.id)
      setNote({ id: g.id, text: `${g.name} · ${g.role}`, key: Date.now() })
    } else {
      lock.current = true
      setTimeout(() => { setFlipped([]); lock.current = false }, 850)
    }
  }, [flipped, matched, deck])

  const restart = () => { setDeck(newDeck()); setFlipped([]); setMatched([]); setMoves(0); setSecs(0); setStarted(false); setNote(null); lock.current = false }

  return (
    <section className="gm" aria-label="신 카드 짝맞추기">
      <div className="gm-bar">
        <button type="button" className="gm-back" onClick={onBack}><i className="bi bi-chevron-left" />게임 목록</button>
        <div className="gm-stats">
          <span><i className="bi bi-stopwatch" />{fmt(secs)}</span>
          <span><i className="bi bi-hand-index" />{moves}번</span>
          <span><i className="bi bi-patch-check" />{matched.length}/{PAIRS}</span>
          {best && <span className="best"><i className="bi bi-trophy" />최고 {best.moves}번 · {fmt(best.secs)}</span>}
        </div>
        <button type="button" className="gm-restart" onClick={restart}><i className="bi bi-arrow-repeat" />다시 섞기</button>
      </div>

      <div className="gm-note" aria-live="polite">
        {note
          ? <span key={note.key} style={{ '--c': GOD_COLORS[note.id] }}><i className="bi bi-stars" />{note.text}</span>
          : <span className="idle">같은 신의 카드 두 장을 찾아 보세요</span>}
      </div>

      <div className="gm-3d" aria-label="카드 16장이 놓인 3D 탁자" data-deck={deck.map((c) => c.id).join(",")}>
        <CardScene3D deck={deck} flipped={flipped} matched={matched} onFlip={flip} />
      </div>

      {done && (
        <div className="gm-win" role="dialog" aria-label="게임 완료">
          <div className="gm-win-card">
            <div className="gm-win-stars">{[1, 2, 3].map((n) => <i key={n} className={`bi bi-star-fill ${n <= stars ? 'on' : ''}`} style={{ '--k': n }} />)}</div>
            <h3 className="serif">모든 신을 찾았어요!</h3>
            <p>{fmt(secs)} 동안 {moves}번 뒤집었어요.{best && best.moves === moves && best.secs === secs ? ' 최고 기록이에요!' : ''}</p>
            <div className="gm-win-btns">
              <button type="button" className="btn btn-yuchae px-4" onClick={restart}><i className="bi bi-arrow-repeat me-1" />한 번 더</button>
              <button type="button" className="btn btn-hanji px-4" onClick={onBack}>게임 목록</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
