import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container py-5 text-center">
      <h1 className="display-5 hero-title">길을 잃었어요</h1>
      <p className="text-secondary">없는 주소입니다.</p>
      <Link to="/" className="btn btn-yuchae">홈으로</Link>
    </div>
  )
}
