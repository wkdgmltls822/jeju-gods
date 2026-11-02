import { Link } from 'react-router-dom'
import SkyBackground from '../components/SkyBackground'

// 없는 주소: 길을 잃은 여행자에게 별빛으로 돌아갈 길을 보여 준다
export default function NotFound() {
  return (
    <div className="nf">
      <SkyBackground />
      <div className="nf-body">
        <div className="nf-moon" aria-hidden="true"><span className="orbit-ring" /><i className="bi bi-moon-stars-fill" /></div>
        <div className="nf-code">404</div>
        <h1 className="nf-title serif">길을 잃었어요</h1>
        <p className="nf-sub">별도 이 길은 알려 주지 않네요. 없는 주소입니다.</p>
        <div className="d-flex gap-2 justify-content-center flex-wrap">
          <Link to="/" className="btn btn-yuchae btn-lg px-4">홈으로</Link>
          <Link to="/myths" className="btn btn-hanji btn-lg px-4">별자리 열기</Link>
        </div>
      </div>
    </div>
  )
}
