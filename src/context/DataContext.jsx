import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import * as mock from '../data/mockData.js'

/**
 * 단일 프론트 전역 store.
 * 각 리소스에 대해 (list + mutate actions) 형태로 정리되어 있어
 * 추후 각 action을 fetch/axios 호출로 교체하면 곧바로 백엔드 연동 가능.
 */

const DataContext = createContext(null)

const uid = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`

export function DataProvider({ children }) {
  const [schedules, setSchedules] = useState(mock.schedules)
  const [jobPosts, setJobPosts] = useState(mock.jobPosts)
  const [meals] = useState(mock.meals)
  const [portfolios, setPortfolios] = useState(mock.portfolios)
  const [rules, setRules] = useState(mock.rules)
  const [penalties, setPenalties] = useState(mock.penalties)
  const [notices, setNotices] = useState(mock.notices)

  // --- Schedule ---
  const addSchedule = useCallback((payload) => {
    setSchedules((prev) => [{ id: uid('s'), ...payload }, ...prev])
  }, [])
  const updateSchedule = useCallback((id, patch) => {
    setSchedules((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }, [])
  const removeSchedule = useCallback((id) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id))
  }, [])

  // --- Job posts ---
  const addJobPost = useCallback((payload) => {
    setJobPosts((prev) => [
      { id: uid('j'), createdAt: new Date().toISOString(), visibility: 'teacher-only', ...payload },
      ...prev,
    ])
  }, [])
  const removeJobPost = useCallback((id) => {
    setJobPosts((prev) => prev.filter((j) => j.id !== id))
  }, [])

  // --- Portfolio ---
  const upsertPortfolio = useCallback((ownerId, ownerName, payload) => {
    setPortfolios((prev) => {
      const existing = prev.find((p) => p.ownerId === ownerId)
      const updatedAt = new Date().toISOString()
      if (existing) {
        return prev.map((p) =>
          p.ownerId === ownerId ? { ...p, ...payload, updatedAt } : p,
        )
      }
      return [
        {
          id: uid('p'),
          ownerId,
          ownerName,
          ...payload,
          updatedAt,
        },
        ...prev,
      ]
    })
  }, [])

  // --- Rules ---
  const addRule = useCallback((text) => {
    setRules((prev) => [...prev, { id: uid('r'), order: prev.length + 1, text }])
  }, [])
  const removeRule = useCallback((id) => {
    setRules((prev) =>
      prev.filter((r) => r.id !== id).map((r, i) => ({ ...r, order: i + 1 })),
    )
  }, [])

  // --- Penalties ---
  const addPenalty = useCallback((payload) => {
    setPenalties((prev) => [{ id: uid('pn'), status: 'open', ...payload }, ...prev])
  }, [])
  const updatePenaltyStatus = useCallback((id, status) => {
    setPenalties((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)))
  }, [])

  // --- Notices ---
  const addNotice = useCallback((payload) => {
    setNotices((prev) => [
      { id: uid('n'), createdAt: new Date().toISOString(), ...payload },
      ...prev,
    ])
  }, [])

  const value = useMemo(
    () => ({
      schedules,
      jobPosts,
      meals,
      portfolios,
      rules,
      penalties,
      notices,
      addSchedule,
      updateSchedule,
      removeSchedule,
      addJobPost,
      removeJobPost,
      upsertPortfolio,
      addRule,
      removeRule,
      addPenalty,
      updatePenaltyStatus,
      addNotice,
    }),
    [
      schedules,
      jobPosts,
      meals,
      portfolios,
      rules,
      penalties,
      notices,
      addSchedule,
      updateSchedule,
      removeSchedule,
      addJobPost,
      removeJobPost,
      upsertPortfolio,
      addRule,
      removeRule,
      addPenalty,
      updatePenaltyStatus,
      addNotice,
    ],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
