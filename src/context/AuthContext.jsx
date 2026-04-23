import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { apiFetch, getStoredToken, setStoredToken } from '../api/api.js'

const AuthContext = createContext(null)

function mapUser(dto) {
  if (!dto) return null
  return {
    id: String(dto.id),
    username: dto.username,
    name: dto.name,
    role: dto.role,
    studentNo: dto.studentNo,
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken())
  const [user, setUser] = useState(null)
  const [canManageEmployment, setCanManageEmployment] = useState(false)
  const [booting, setBooting] = useState(true)

  const refreshEmploymentPermission = useCallback(async (t) => {
    if (!t) {
      setCanManageEmployment(false)
      return
    }
    try {
      const res = await apiFetch('/employment/permission', { token: t })
      setCanManageEmployment(!!res?.canManage)
    } catch {
      setCanManageEmployment(false)
    }
  }, [])

  const loadMe = useCallback(async (t) => {
    if (!t) {
      setUser(null)
      return
    }
    const me = await apiFetch('/auth/me', { token: t })
    setUser(mapUser(me))
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const t = getStoredToken()
      setToken(t)
      try {
        if (t) await loadMe(t)
        if (!cancelled && t) await refreshEmploymentPermission(t)
      } catch {
        if (!cancelled) {
          setStoredToken(null)
          setToken(null)
          setUser(null)
        }
      } finally {
        if (!cancelled) setBooting(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [loadMe, refreshEmploymentPermission])

  const login = useCallback(
    async (username, password) => {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: { username, password },
        token: null,
      })
      const access = res?.access_token
      if (!access) throw new Error('로그인 응답에 토큰이 없습니다.')
      setStoredToken(access)
      setToken(access)
      setUser(mapUser(res.user))
      await refreshEmploymentPermission(access)
    },
    [refreshEmploymentPermission],
  )

  const logout = useCallback(() => {
    setStoredToken(null)
    setToken(null)
    setUser(null)
    setCanManageEmployment(false)
  }, [])

  const value = useMemo(() => {
    const role = user?.role
    const isAdmin = role === 'admin'
    const isTeacherRole = role === 'teacher'
    const isStudent = role === 'student'
    const isStaff = isAdmin || isTeacherRole
    const canPostJobs =
      isStaff || (isStudent && canManageEmployment)

    return {
      token,
      user,
      booting,
      isAuthenticated: !!user && !!token,
      isStudent,
      isTeacher: isStaff,
      isStaff,
      isAdmin,
      canPostJobs,
      login,
      logout,
      refreshEmploymentPermission: () => refreshEmploymentPermission(token),
      loadMe: () => loadMe(token),
    }
  }, [
    token,
    user,
    booting,
    canManageEmployment,
    login,
    logout,
    loadMe,
    refreshEmploymentPermission,
  ])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
