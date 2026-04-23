import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Icon from '../components/common/Icon.jsx'

const demo = [
  { id: 'u-teacher-1', name: '김선생', sub: '교사 · 관리자 계정', role: 'teacher' },
  { id: 'u-student-1', name: '이준호', sub: '학생 계정 · 20301', role: 'student' },
  { id: 'u-student-2', name: '박소연', sub: '학생 계정 · 20302', role: 'student' },
]

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = (id) => {
    login(id)
    navigate('/', { replace: true })
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <span className="sidebar-logo">3-2</span>
          <div>
            <div className="sidebar-title" style={{ fontSize: 18 }}>3학년 2반</div>
            <div className="sidebar-sub">학급 운영 워크스페이스</div>
          </div>
        </div>

        <h2 style={{ fontSize: 18, marginBottom: 6 }}>계정을 선택해 로그인하세요</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 22, fontSize: 13 }}>
          데모 환경이므로 비밀번호 없이 역할 기반으로 로그인됩니다.
        </p>

        <div className="login-list">
          {demo.map((u) => (
            <button
              key={u.id}
              type="button"
              className="login-item"
              onClick={() => handleLogin(u.id)}
            >
              <div className="login-avatar">
                <Icon name={u.role === 'teacher' ? 'settings' : 'user'} size={18} />
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div className="login-name">{u.name}</div>
                <div className="login-sub">{u.sub}</div>
              </div>
              <span className="login-chevron">
                <Icon name="arrowRight" size={16} />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
