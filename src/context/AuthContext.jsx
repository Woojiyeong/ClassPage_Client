import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { users } from '../data/mockData.js'

const STORAGE_KEY = 'classpage.currentUserId'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUserId, setCurrentUserId] = useState(() => {
    if (typeof window === 'undefined') return null
    return window.localStorage.getItem(STORAGE_KEY)
  })

  useEffect(() => {
    if (currentUserId) window.localStorage.setItem(STORAGE_KEY, currentUserId)
    else window.localStorage.removeItem(STORAGE_KEY)
  }, [currentUserId])

  const value = useMemo(() => {
    const user = users.find((u) => u.id === currentUserId) || null
    return {
      user,
      isAuthenticated: !!user,
      isStudent: user?.role === 'student',
      isTeacher: user?.role === 'teacher',
      canPostJobs: user?.role === 'teacher' || user?.canPostJobs === true,
      login: (userId) => setCurrentUserId(userId),
      logout: () => setCurrentUserId(null),
      availableUsers: users,
    }
  }, [currentUserId])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
