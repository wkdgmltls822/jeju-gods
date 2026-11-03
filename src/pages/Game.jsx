import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import TetrisGame from '../components/TetrisGame'
import MatchGame from '../components/MatchGame'
import GodAvatar from '../components/GodAvatar'
import '../styles/game.css'

// 게임: 신들의 테트리스 / 신 카드 짝맞추기. 최고 기록은 이 브라우저에 저장된다.
const read = (k) => { try { return JSON.parse(localStorage.getItem(k)) } catch { return null } }
const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

export default function Game() {
  const [mode, setMode] = useState(null) // null: 게임 목록, 'tetris', 'match'
  const back = () => setMode(null)

  if (mode === 'tetris') return <div className="page-game"><TetrisGame onBack={back} /></div>
  if (mode === 'match') return <div className="page-game"><MatchGame onBack={back} /></div>

  const tBest = Number(read('jeju-game:tetris-best')) || 0
  const mBest = read('jeju-game:match-best')

  return (
    <div className="page-game">
      <PageHeader title="신들의 놀이터" desc="제주 신들과 함께 즐기는 두 가지 게임. 최고 기록은 이 기기에 저장돼요." />
      <div className="gh-grid">
        <button type="button" className="gh-card tetris" onClick={() => setMode('tetris')}>
          <span className="gh-art" aria-hidden="true">
            {['#c4b5fd', '#7dd3fc', '#fde68a', '#f9a8d4'].map((c, i) => <i key={i} style={{ '--c': c, '--i': i }} />)}
          </span>
          <h2 className="serif">신들의 테트리스</h2>
          <p>신 7명의 조각을 쌓아 줄을 지우면 신들이 축복을 내려요. 쌓은 줄은 한라산 1,947m 가 돼요.</p>
          <span className="gh-meta"><i className="bi bi-trophy" />{tBest ? `최고 ${tBest.toLocaleString()}점` : '아직 기록이 없어요'}</span>
          <span className="gh-go">시작하기<i className="bi bi-arrow-right" /></span>
        </button>

        <button type="button" className="gh-card match" onClick={() => setMode('match')}>
          <span className="gh-faces" aria-hidden="true">
            {["seolmundae", "yeongdeung", "jacheongbi", "cheonjiwang"].map((id) => <GodAvatar key={id} id={id} size={54} />)}
          </span>
          <h2 className="serif">신 카드 짝맞추기</h2>
          <p>뒤집힌 카드 16장 속에서 같은 신 두 장을 찾아요. 짝을 맞출 때마다 그 신의 이야기가 나와요.</p>
          <span className="gh-meta"><i className="bi bi-trophy" />{mBest ? `최고 ${mBest.moves}번 · ${fmt(mBest.secs)}` : '아직 기록이 없어요'}</span>
          <span className="gh-go">시작하기<i className="bi bi-arrow-right" /></span>
        </button>
      </div>
    </div>
  )
}
