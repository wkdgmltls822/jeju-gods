import { useCallback, useEffect, useRef, useState } from 'react'
import { GOD_COLORS } from '../data/gods'
import TetrisScene3D from './TetrisScene3D'

// 신들의 테트리스: 조각 7개는 신 7명(색·이름), 줄을 지우면 신이 축복을 내리고, 지운 줄은 한라산(1,947m)을 쌓는다.
// 설문대할망이 치마폭에 흙을 날라 오름과 한라산을 만들었다는 이야기에서 따왔다.
const COLS = 10, ROWS = 20
const BEST_KEY = 'jeju-game:tetris-best'
const MOUNTAIN = 1947, M_PER_LINE = 20

const PIECES = {
  I: { god: 'seolmundae', name: '설문대할망', m: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]] },
  O: { god: 'samseong', name: '삼성신', m: [[1, 1], [1, 1]] },
  T: { god: 'cheonjiwang', name: '천지왕', m: [[0, 1, 0], [1, 1, 1], [0, 0, 0]] },
  S: { god: 'yeongdeung', name: '영등할망', m: [[0, 1, 1], [1, 1, 0], [0, 0, 0]] },
  Z: { god: 'baekjuddo', name: '백주또', m: [[1, 1, 0], [0, 1, 1], [0, 0, 0]] },
  J: { god: 'jacheongbi', name: '자청비', m: [[1, 0, 0], [1, 1, 1], [0, 0, 0]] },
  L: { god: 'munjeon', name: '문전신', m: [[0, 0, 1], [1, 1, 1], [0, 0, 0]] },
}
const TYPES = Object.keys(PIECES)
const color = (t) => GOD_COLORS[PIECES[t].god]
const BLESS = ['', '조왕할망이 부엌 불을 지펴 줘요', '문전신이 문을 열어 줘요', '영등할망이 바람을 불어 줘요', '설문대할망이 한라산을 한 번에 쌓았어요!']
const SCORE = [0, 100, 300, 500, 800]

let fxId = 0
const rotate = (m) => m[0].map((_, i) => m.map((row) => row[i]).reverse())
const rotateCCW = (m) => rotate(rotate(rotate(m)))
const emptyBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(null))
const readBest = () => { try { return Number(localStorage.getItem(BEST_KEY)) || 0 } catch { return 0 } }

function collide(board, m, x, y) {
  for (let r = 0; r < m.length; r++) for (let c = 0; c < m[r].length; c++) {
    if (!m[r][c]) continue
    const nx = x + c, ny = y + r
    if (nx < 0 || nx >= COLS || ny >= ROWS) return true
    if (ny >= 0 && board[ny][nx]) return true
  }
  return false
}

// 7개 조각을 한 번씩 섞어서 내는 방식(같은 조각이 몇 번씩 연달아 나오지 않게)
function makeBag() {
  const a = [...TYPES]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
}

// 바닥에 닿은 조각은 곧바로 굳지 않고 잠깐(0.45초) 더 움직일 수 있다. 움직이거나 돌릴 때마다 시간이 다시 시작된다(최대 15번).
const LOCK_MS = 450, DAS = 130, ARR = 38, SOFT_ARR = 30
function touchLock(s) {
  if (collide(s.board, s.cur.m, s.cur.x, s.cur.y + 1)) {
    if (s.lockStart && s.resets < 15) { s.lockStart = performance.now(); s.resets += 1 }
  } else s.lockStart = 0
}

function drawCell(ctx, x, y, col, size, alpha = 1) {
  ctx.globalAlpha = alpha
  const g = ctx.createLinearGradient(x, y, x + size, y + size)
  g.addColorStop(0, '#ffffff66'); g.addColorStop(0.35, col); g.addColorStop(1, col)
  ctx.fillStyle = g
  ctx.shadowColor = col; ctx.shadowBlur = size * 0.35
  ctx.beginPath(); ctx.roundRect(x + 1.5, y + 1.5, size - 3, size - 3, size * 0.2); ctx.fill()
  ctx.shadowBlur = 0
  ctx.strokeStyle = '#ffffff55'; ctx.lineWidth = 1; ctx.stroke()
  ctx.globalAlpha = 1
}

function drawMini(canvas, type) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const dpr = window.devicePixelRatio || 1
  const S = 96
  canvas.width = S * dpr; canvas.height = S * dpr
  ctx.scale(dpr, dpr); ctx.clearRect(0, 0, S, S)
  if (!type) return
  const m = PIECES[type].m, cs = 20
  const rows = m.map((r, i) => (r.some(Boolean) ? i : -1)).filter((i) => i >= 0)
  const cols = m[0].map((_, i) => (m.some((r) => r[i]) ? i : -1)).filter((i) => i >= 0)
  const w = (Math.max(...cols) - Math.min(...cols) + 1) * cs, h = (Math.max(...rows) - Math.min(...rows) + 1) * cs
  const ox = (S - w) / 2 - Math.min(...cols) * cs, oy = (S - h) / 2 - Math.min(...rows) * cs
  m.forEach((row, r) => row.forEach((v, c) => { if (v) drawCell(ctx, ox + c * cs, oy + r * cs, color(type), cs) }))
}

export default function TetrisGame({ onBack }) {
  const nextCv = useRef(null)
  const holdCv = useRef(null)
  const g = useRef(null) // 게임 상태(화면 갱신 없이 빠르게 바뀌는 값들)
  const held = useRef({}) // 지금 누르고 있는 방향키 { 키: { t0, last, on } }
  const [ui, setUi] = useState({ score: 0, lines: 0, level: 1, status: 'ready', next: null, hold: null })
  const [best, setBest] = useState(readBest)
  const [toast, setToast] = useState(null)

  const sync = useCallback(() => {
    const s = g.current
    setUi({ score: s.score, lines: s.lines, level: s.level, status: s.status, next: s.queue[0], hold: s.hold, cx: s.cur ? s.cur.x : null, shape: s.cur ? s.cur.m.flat().join('') : '' })
  }, [])

  const say = useCallback((text) => setToast({ text, key: Math.random() }), [])

  const spawn = useCallback(() => {
    const s = g.current
    while (s.queue.length < 7) s.queue.push(...makeBag())
    const type = s.queue.shift()
    const m = PIECES[type].m.map((r) => [...r])
    s.cur = { type, m, x: Math.floor((COLS - m[0].length) / 2), y: type === 'I' ? -1 : 0 }
    s.canHold = true
    s.lockStart = 0; s.resets = 0
    if (collide(s.board, s.cur.m, s.cur.x, s.cur.y)) {
      s.status = 'over'
      try { if (s.score > readBest()) { localStorage.setItem(BEST_KEY, String(s.score)); setBest(s.score) } } catch { /* 저장이 막혀 있어도 게임은 계속 */ }
    }
    sync()
  }, [sync])

  const reset = useCallback(() => {
    if (window.matchMedia("(hover: none)").matches) document.querySelector(".tg")?.scrollIntoView({ behavior: "smooth", block: "start" }) // 휴대폰: 판과 버튼이 한 화면에 보이게
    g.current = { board: emptyBoard(), cur: null, queue: makeBag(), hold: null, canHold: true, score: 0, lines: 0, level: 1, status: 'playing', acc: 0, last: 0, clearing: null }
    setToast(null)
    spawn()
  }, [spawn])

  const lockPiece = useCallback(() => {
    const s = g.current
    const { m, x, y, type } = s.cur
    m.forEach((row, r) => row.forEach((v, c) => { if (v && y + r >= 0) s.board[y + r][x + c] = type }))
    const rows = s.board.map((row, i) => (row.every(Boolean) ? i : -1)).filter((i) => i >= 0)
    if (rows.length) {
      s.clearing = { rows, until: performance.now() + 260 }
      s.fx = { id: ++fxId, cells: rows.flatMap((r) => s.board[r].map((tp, cx) => ({ x: cx, y: ROWS - 1 - r, color: color(tp) }))) } // 줄을 지울 때 터져 나갈 조각들
      s.cur = null
    } else spawn()
  }, [spawn])

  const finishClear = useCallback(() => {
    const s = g.current
    const n = s.clearing.rows.length
    s.board = [...Array.from({ length: n }, () => Array(COLS).fill(null)), ...s.board.filter((_, i) => !s.clearing.rows.includes(i))]
    s.lines += n
    s.score += SCORE[n] * s.level
    const lv = 1 + Math.floor(s.score / 1000) // 레벨은 점수 1000점마다 한 단계
    if (lv > s.level) say(`한라산이 한 층 높아졌어요 (레벨 ${lv})`)
    else say(BLESS[n])
    s.level = lv
    s.clearing = null
    spawn()
  }, [spawn, say])

  const move = useCallback((dx) => { const s = g.current; if (s?.status !== 'playing' || !s.cur || s.clearing) return; if (!collide(s.board, s.cur.m, s.cur.x + dx, s.cur.y)) { s.cur.x += dx; touchLock(s) } }, [])
  const turn = useCallback((cw = true) => {
    const s = g.current
    if (s?.status !== 'playing' || !s.cur || s.clearing) return
    const m = cw ? rotate(s.cur.m) : rotateCCW(s.cur.m)
    for (const k of [0, -1, 1, -2, 2]) if (!collide(s.board, m, s.cur.x + k, s.cur.y)) { s.cur.m = m; s.cur.x += k; touchLock(s); return }
  }, [])
  const soft = useCallback(() => {
    const s = g.current
    if (s?.status !== 'playing' || !s.cur || s.clearing) return
    if (!collide(s.board, s.cur.m, s.cur.x, s.cur.y + 1)) { s.cur.y += 1; s.score += 1; s.acc = 0; s.lockStart = 0 } else lockPiece()
  }, [lockPiece])
  const hard = useCallback(() => {
    const s = g.current
    if (s?.status !== 'playing' || !s.cur || s.clearing) return
    let d = 0
    while (!collide(s.board, s.cur.m, s.cur.x, s.cur.y + 1)) { s.cur.y += 1; d += 1 }
    s.score += d * 2
    lockPiece()
  }, [lockPiece])
  const hold = useCallback(() => {
    const s = g.current
    if (s?.status !== 'playing' || !s.cur || s.clearing || !s.canHold) return
    const t = s.cur.type
    if (s.hold) { const back = s.hold; s.hold = t; s.queue.unshift(back) } else s.hold = t
    spawn()
    s.canHold = false
  }, [spawn])
  const pause = useCallback(() => {
    const s = g.current
    if (!s || s.status === 'over' || s.status === 'ready') return
    s.status = s.status === 'paused' ? 'playing' : 'paused'
    s.last = 0
    sync()
  }, [sync])

  // 게임 루프: 시간에 따라 조각이 내려온다 (화면은 TetrisScene3D 가 상태를 읽어서 3D로 그린다)
  useEffect(() => {
    g.current = { board: emptyBoard(), cur: null, queue: makeBag(), hold: null, canHold: true, score: 0, lines: 0, level: 1, status: 'ready', acc: 0, last: 0, clearing: null }
    sync()
    let raf = 0
    const frame = (t) => {
      const s = g.current
      if (s.status === 'playing') {
        if (s.clearing) { if (t >= s.clearing.until) finishClear() } else if (s.cur) {
          if (s.last) s.acc += t - s.last
          const speed = Math.max(80, 820 * Math.pow(0.9, s.score / 400)) // 점수가 오를수록 조금씩 계속 빨라진다
          if (collide(s.board, s.cur.m, s.cur.x, s.cur.y + 1)) {
            if (!s.lockStart) { s.lockStart = t; s.resets = 0 }
            if (t - s.lockStart >= LOCK_MS) lockPiece()
          } else if (s.acc >= speed) { s.acc = 0; s.cur.y += 1; s.lockStart = 0 }
          // 누르고 있는 방향키: 처음 한 칸 → 잠깐 뒤 빠르게 반복(DAS/ARR). 운영체제 키 반복보다 훨씬 부드럽다.
          const hd = held.current
          let moved = false
          for (const k of ['ArrowLeft', 'ArrowRight']) {
            const h = hd[k]
            if (!h || !g.current.cur) continue
            if (!h.on) { if (t - h.t0 >= DAS) { h.on = true; h.last = t } } else {
              while (t - h.last >= ARR && g.current.cur) { move(k === 'ArrowLeft' ? -1 : 1); h.last += ARR }
            }
          }
          const dn = hd.ArrowDown
          if (dn && g.current.cur) { while (t - dn.last >= SOFT_ARR && g.current.cur) { soft(); dn.last += SOFT_ARR; moved = true } }
          if (moved) sync()
        }
        s.last = t
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    const onHide = () => { if (document.hidden && g.current.status === 'playing') pause() }
    document.addEventListener('visibilitychange', onHide)
    return () => { cancelAnimationFrame(raf); document.removeEventListener('visibilitychange', onHide) }
  }, [finishClear, lockPiece, pause, sync, move, soft])

  // 키보드: ← → 이동, ↓ 내리기, ↑/X 돌리기, Z 반대로, 스페이스 한 번에, C 보관, P 멈춤
  // 방향키를 누르고 있을 때의 반복은 운영체제 대신 게임 루프에서 직접 한다(처음 지연이 짧고 빠르게 이어짐)
  useEffect(() => {
    const used = ['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' ', 'x', 'X', 'z', 'Z', 'c', 'C', 'Shift', 'p', 'P', 'Escape']
    const onKey = (e) => {
      const k = e.key
      if (!used.includes(k)) return
      const st = g.current?.status
      if (st === 'playing' || st === 'paused') e.preventDefault()
      if (e.repeat) return
      const now = performance.now()
      if (k === 'ArrowLeft' || k === 'ArrowRight') {
        held.current[k === 'ArrowLeft' ? 'ArrowRight' : 'ArrowLeft'] = undefined // 마지막으로 누른 방향이 우선
        held.current[k] = { t0: now, last: now, on: false }
        move(k === 'ArrowLeft' ? -1 : 1)
      } else if (k === 'ArrowDown') { held.current.ArrowDown = { t0: now, last: now, on: true }; soft() }
      else if (k === 'ArrowUp' || k === 'x' || k === 'X') turn(true)
      else if (k === 'z' || k === 'Z') turn(false)
      else if (k === ' ') hard()
      else if (k === 'c' || k === 'C' || k === 'Shift') hold()
      else pause()
      if (g.current) sync()
    }
    const onUp = (e) => { held.current[e.key] = undefined }
    const clear = () => { held.current = {} }
    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onUp)
    window.addEventListener('blur', clear)
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onUp); window.removeEventListener('blur', clear) }
  }, [move, soft, turn, hard, hold, pause, sync])

  useEffect(() => { drawMini(nextCv.current, ui.next) }, [ui.next])
  useEffect(() => { drawMini(holdCv.current, ui.hold) }, [ui.hold])
  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(null), 1500)
    return () => clearTimeout(t)
  }, [toast])

  // 화면 버튼(휴대폰): 누르고 있으면 반복
  // 반복 타이머는 한 곳(ref)에 둔다. 화면이 다시 그려질 때마다 새로 만들어지는 변수에 두면, 손을 뗄 때 이전 타이머를 못 꺼서 계속 반복된다.
  const rep = useRef({ a: 0, b: 0 })
  const stopRep = () => { clearTimeout(rep.current.a); clearInterval(rep.current.b) }
  useEffect(() => stopRep, []) // eslint-disable-line react-hooks/exhaustive-deps
  const holdBtn = (fn) => ({
    onPointerDown: (e) => {
      e.preventDefault(); stopRep(); fn(); sync()
      rep.current.a = setTimeout(() => { rep.current.b = setInterval(() => { fn(); sync() }, 45) }, 160)
    },
    onPointerUp: stopRep, onPointerLeave: stopRep, onPointerCancel: stopRep,
  })
  // 판을 직접 터치: 좌우로 밀면 이동, 아래로 밀면 내리기, 짧게 탭하면 돌리기, 아래로 빠르게 튕기면 한 번에 내리기
  const touch = useRef(null)
  const onTouchStart = (e) => {
    if (e.pointerType === 'mouse') return
    e.currentTarget.setPointerCapture?.(e.pointerId)
    touch.current = { x0: e.clientX, y0: e.clientY, t0: performance.now(), ax: 0, ay: 0, lx: e.clientX, ly: e.clientY, moved: false }
  }
  const onTouchMove = (e) => {
    const t = touch.current
    if (!t) return
    const cell = Math.max(18, e.currentTarget.clientWidth * 0.056) // 한 칸에 해당하는 손가락 이동 거리
    t.ax += e.clientX - t.lx; t.ay += e.clientY - t.ly; t.lx = e.clientX; t.ly = e.clientY
    while (Math.abs(t.ax) >= cell) { move(t.ax > 0 ? 1 : -1); t.ax -= Math.sign(t.ax) * cell; t.moved = true }
    while (t.ay >= cell * 1.15) { soft(); t.ay -= cell * 1.15; t.moved = true }
    if (t.ay < 0) t.ay = 0
    if (t.moved) sync()
  }
  const onTouchEnd = (e) => {
    const t = touch.current
    touch.current = null
    if (!t) return
    const dt = Math.max(1, performance.now() - t.t0), dx = e.clientX - t.x0, dy = e.clientY - t.y0
    if (!t.moved && Math.hypot(dx, dy) < 14 && dt < 320) turn(true) // 짧게 탭: 돌리기
    else if (dy > 70 && Math.abs(dx) < 50 && dy / dt > 0.8) hard() // 아래로 빠르게 튕기기: 한 번에 내리기
    sync()
  }
  const tap = (fn) => ({ onPointerDown: (e) => { e.preventDefault(); fn(); sync() } })

  const meters = Math.min(MOUNTAIN, ui.lines * M_PER_LINE)
  const done = meters >= MOUNTAIN

  return (
    <section className="tg" aria-label="신들의 테트리스">
      <div className="gm-bar">
        <button type="button" className="gm-back" onClick={onBack}><i className="bi bi-chevron-left" />게임 목록</button>
        <div className="gm-stats">
          <span><i className="bi bi-star" />{ui.score.toLocaleString()}점</span>
          <span><i className="bi bi-layers" />레벨 {ui.level}</span>
          {best > 0 && <span className="best"><i className="bi bi-trophy" />최고 {best.toLocaleString()}점</span>}
        </div>
        <button type="button" className="gm-restart" onClick={reset}><i className="bi bi-arrow-repeat" />{ui.status === 'ready' ? '시작' : '다시 시작'}</button>
      </div>

      <div className="tg-body">
        <div className="tg-board" data-cx={ui.cx ?? ""} data-shape={ui.shape}>
          <div className="tg-canvas" aria-label="테트리스 3D 판" onPointerDown={onTouchStart} onPointerMove={onTouchMove} onPointerUp={onTouchEnd} onPointerCancel={() => { touch.current = null }}><TetrisScene3D gref={g} colorOf={color} collide={collide} /></div>
          {toast && <div key={toast.key} className="tg-toast"><i className="bi bi-stars" />{toast.text}</div>}
          {ui.status === 'ready' && (
            <div className="tg-over">
              <h3 className="serif">신들의 테트리스</h3>
              <p>설문대할망처럼 흙(블록)을 쌓아<br />한라산 1,947m 를 만들어 보세요</p>
              <button type="button" className="btn btn-yuchae px-4" onClick={reset}><i className="bi bi-play-fill me-1" />시작하기</button>
            </div>
          )}
          {ui.status === 'paused' && (
            <div className="tg-over"><h3 className="serif">잠깐 쉬는 중</h3><button type="button" className="btn btn-yuchae px-4" onClick={pause}>계속하기</button></div>
          )}
          {ui.status === 'over' && (
            <div className="tg-over">
              <h3 className="serif">치마폭이 가득 찼어요</h3>
              <p>{ui.score.toLocaleString()}점 · 한라산 {meters.toLocaleString()}m{done ? ' 완성!' : ''}</p>
              <button type="button" className="btn btn-yuchae px-4" onClick={reset}><i className="bi bi-arrow-repeat me-1" />다시 도전</button>
            </div>
          )}
        </div>

        <aside className="tg-side">
          <div className="tg-box">
            <span className="tg-label">다음 신</span>
            <canvas ref={nextCv} className="tg-mini" aria-label="다음 조각" />
            <b style={{ color: ui.next ? color(ui.next) : undefined }}>{ui.next ? PIECES[ui.next].name : '—'}</b>
          </div>
          <div className="tg-box">
            <span className="tg-label">보관 (C)</span>
            <canvas ref={holdCv} className="tg-mini" aria-label="보관한 조각" />
            <b style={{ color: ui.hold ? color(ui.hold) : undefined }}>{ui.hold ? PIECES[ui.hold].name : '비었어요'}</b>
          </div>
          <div className="tg-box tg-mt">
            <span className="tg-label"><i className="bi bi-triangle-fill" /> 한라산 쌓기</span>
            <div className="tg-meter"><i style={{ "--p": `${(meters / MOUNTAIN) * 100}%` }} /></div>
            <b>{meters.toLocaleString()} / 1,947m</b>
            <small>{ui.lines}줄 지움</small>
          </div>
        </aside>
      </div>

      <div className="tg-pad" aria-label="화면 조작 버튼">
        <button type="button" aria-label="왼쪽" {...holdBtn(() => move(-1))}><i className="bi bi-arrow-left" /></button>
        <button type="button" aria-label="돌리기" {...tap(() => turn(true))}><i className="bi bi-arrow-clockwise" /></button>
        <button type="button" aria-label="오른쪽" {...holdBtn(() => move(1))}><i className="bi bi-arrow-right" /></button>
        <button type="button" aria-label="아래로" {...holdBtn(soft)}><i className="bi bi-arrow-down" /></button>
        <button type="button" aria-label="한 번에 내리기" className="wide" {...tap(hard)}><i className="bi bi-chevron-double-down" />한 번에</button>
        <button type="button" aria-label="보관" {...tap(hold)}><i className="bi bi-box-arrow-in-down" /></button>
      </div>
      <p className="tg-touch-help"><i className="bi bi-hand-index me-1" />판을 밀어서 이동 · 탭하면 돌리기 · 아래로 튕기면 한 번에 내려요</p>
      <p className="tg-help"><kbd>←</kbd><kbd>→</kbd> 이동 · <kbd>↑</kbd> 돌리기 · <kbd>↓</kbd> 내리기 · <kbd>Space</kbd> 한 번에 · <kbd>C</kbd> 보관 · <kbd>P</kbd> 멈춤</p>
    </section>
  )
}
