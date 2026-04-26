import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Icon from '../components/common/Icon.jsx'
import Button from '../components/common/Button.jsx'

export default function LoginPage() {
  const { login, changeInitialPassword, booting, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('')
  const [requirePasswordChange, setRequirePasswordChange] = useState(false)
  const [pendingUsername, setPendingUsername] = useState('')
  const [pendingCurrentPassword, setPendingCurrentPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!booting && isAuthenticated) navigate('/', { replace: true })
  }, [booting, isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!username.trim() || !password) {
      setError('아이디와 비밀번호를 입력하세요.')
      return
    }
    setSubmitting(true)
    try {
      const result = await login(username.trim(), password)
      if (result?.requiresPasswordChange) {
        setRequirePasswordChange(true)
        setPendingUsername(username.trim())
        setPendingCurrentPassword(password)
        setNewPassword('')
        setNewPasswordConfirm('')
        return
      }
      navigate('/', { replace: true })
    } catch (err) {
      setError(err?.message || '로그인에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setError('')
    if (!newPassword || !newPasswordConfirm) {
      setError('새 비밀번호와 확인 비밀번호를 입력하세요.')
      return
    }
    if (newPassword.length < 4) {
      setError('새 비밀번호는 최소 4자 이상이어야 합니다.')
      return
    }
    if (newPassword !== newPasswordConfirm) {
      setError('새 비밀번호 확인이 일치하지 않습니다.')
      return
    }
    if (!pendingUsername || !pendingCurrentPassword) {
      setError('다시 로그인 후 비밀번호를 변경해주세요.')
      setRequirePasswordChange(false)
      return
    }

    setSubmitting(true)
    try {
      await changeInitialPassword(
        pendingUsername,
        pendingCurrentPassword,
        newPassword,
      )
      navigate('/', { replace: true })
    } catch (err) {
      setError(err?.message || '비밀번호 변경에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  if (booting) {
    return (
      <div className="login-page">
        <div className="login-card">
          <p style={{ color: 'var(--text-muted)' }}>세션 확인 중…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <span className="sidebar-logo">3-2</span>
          <div>
            <div className="sidebar-title" style={{ fontSize: 18 }}>
              ClassPage
            </div>
            <div className="sidebar-sub">학급 운영 워크스페이스</div>
          </div>
        </div>

        {requirePasswordChange ? (
          <>
            <h2 style={{ fontSize: 18, marginBottom: 6 }}>최초 비밀번호 변경</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 22, fontSize: 13 }}>
              첫 로그인입니다. 앞으로 사용할 새 비밀번호를 설정해주세요.
            </p>
            <form onSubmit={handleChangePassword}>
              <div className="form-field">
                <label htmlFor="cp-new-pass">새 비밀번호</label>
                <input
                  id="cp-new-pass"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="form-field">
                <label htmlFor="cp-new-pass-confirm">새 비밀번호 확인</label>
                <input
                  id="cp-new-pass-confirm"
                  type="password"
                  autoComplete="new-password"
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                />
              </div>
              {error && (
                <div className="file-error" style={{ marginBottom: 12 }}>
                  {error}
                </div>
              )}
              <div className="form-actions">
                <Button type="submit" disabled={submitting}>
                  <Icon name="lock" size={15} />
                  {submitting ? '변경 중…' : '비밀번호 변경 후 로그인'}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: 18, marginBottom: 6 }}>로그인</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 22, fontSize: 13 }}>
              학번(아이디) + 공통 비밀번호로 로그인합니다. (예: 3216 / 1234)
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <label htmlFor="cp-user">아이디</label>
                <input
                  id="cp-user"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="예: 3216"
                />
              </div>
              <div className="form-field">
                <label htmlFor="cp-pass">비밀번호</label>
                <input
                  id="cp-pass"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && (
                <div className="file-error" style={{ marginBottom: 12 }}>
                  {error}
                </div>
              )}
              <div className="form-actions">
                <Button type="submit" disabled={submitting}>
                  <Icon name="user" size={15} />
                  {submitting ? '로그인 중…' : '로그인'}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
