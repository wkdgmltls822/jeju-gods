// 데이터 · 로딩 · 에러 3종 세트를 화면에 보여주는 공용 컴포넌트
// 공공 API 를 부르는 곳(GodPanel, VisitorChart ...)이 모두 같은 모양으로 상태를 보여줍니다.

export function Loading({ text = '불러오는 중…' }) {
  return (
    <p className="text-secondary small mb-0" role="status">
      <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />{text}
    </p>
  )
}

export function ErrorNote({ error, text = '불러오지 못했어요' }) {
  if (!error) return null
  return (
    <p className="small mb-0 status-error" role="alert">
      <i className="bi bi-exclamation-triangle me-1" />{text} ({String(error)})
    </p>
  )
}

export function Empty({ children = '결과가 없어요' }) {
  return (
    <p className="text-secondary small mb-0">
      <i className="bi bi-inbox me-1" />{children}
    </p>
  )
}
