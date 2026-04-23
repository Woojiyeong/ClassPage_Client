import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div style={{ padding: 48, textAlign: 'center' }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>페이지를 찾을 수 없습니다</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
        주소가 잘못되었거나 이동되었을 수 있습니다.
      </p>
      <Link to="/" className="btn btn-primary">대시보드로 돌아가기</Link>
    </div>
  )
}
