import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

/**
 * 역할 기반 라우트 가드.
 * - 비로그인 → /login
 * - 허용되지 않은 역할 → /forbidden
 *
 * <RoleGate allow={['teacher']}> ... </RoleGate>
 */
export default function RoleGate({ allow, children }) {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (allow && !allow.includes(user.role)) {
    return <Navigate to="/forbidden" replace />
  }
  return children
}
