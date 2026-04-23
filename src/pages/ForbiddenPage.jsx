import { Link } from 'react-router-dom'

export default function ForbiddenPage() {
  return (
    <div style={{ padding: 48, textAlign: 'center' }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>접근 권한이 없습니다</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
        이 페이지는 권한이 있는 사용자만 이용할 수 있습니다.
      </p>
      <Link to="/" className="btn btn-primary">대시보드로 돌아가기</Link>
    </div>
  )
}
