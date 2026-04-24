import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useAuth } from './AuthContext.jsx'
import { apiFetch } from '../api/api.js'

const DataContext = createContext(null)

/** @param {string} content */
/** @param {string} date YYYY-MM-DD */
function mealMenuFromApiContent(content, date) {
  if (!content || typeof content !== 'string') {
    return { date, breakfast: undefined, lunch: undefined, dinner: undefined }
  }
  const trimmed = content.trim()
  if (trimmed.startsWith('{')) {
    try {
      const j = JSON.parse(trimmed)
      return {
        date,
        breakfast: j.breakfast,
        lunch: j.lunch,
        dinner: j.dinner,
      }
    } catch {
      /* fall through */
    }
  }
  const dishes = trimmed
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
  return {
    date,
    lunch: dishes.length ? { dishes } : undefined,
  }
}

function mapEvent(e) {
  const rawTitle = e.title || ''
  const important = rawTitle.startsWith('[중요]')
  const title = important ? rawTitle.replace(/^\[중요\]\s*/, '').trim() : rawTitle
  return {
    id: String(e.id),
    title,
    date: e.event_date,
    description: e.description || '',
    important,
    createdBy: e.created_by != null ? String(e.created_by) : '',
  }
}

function mapEmployment(row) {
  const c = row.creator
  return {
    id: String(row.id),
    title: row.title,
    company: row.company || '',
    content: row.content || '',
    url: row.url || '',
    authorId: c?.id != null ? String(c.id) : '',
    authorName: c?.name || '',
    createdAt: row.created_at,
    visibility: 'teacher-only',
  }
}

function parseStoredPortfolioPayload(raw) {
  if (!raw || typeof raw !== 'string') {
    return { resume: null, portfolio: null, legacyText: '' }
  }
  const t = raw.trim()
  if (t.startsWith('{')) {
    try {
      const j = JSON.parse(t)
      if (j && j.v === 1) {
        return {
          resume: j.resume ?? null,
          portfolio: j.portfolio ?? null,
          legacyText: '',
        }
      }
    } catch {
      /* fall through */
    }
  }
  return { resume: null, portfolio: null, legacyText: raw }
}

function mapPortfolio(p) {
  const st = p.student
  const sid = p.student_id ?? p.student?.id
  const raw = p.content || ''
  const { resume, portfolio, legacyText } = parseStoredPortfolioPayload(raw)
  return {
    id: String(p.id),
    ownerId: String(sid ?? ''),
    ownerName: st?.name || '',
    title: p.title || '',
    summary: p.summary || '',
    legacyContent: legacyText,
    link: p.link || '',
    updatedAt: p.updated_at,
    resume,
    portfolio,
  }
}

function mapRule(r) {
  return {
    id: String(r.id),
    order: r.position ?? 0,
    text: r.content || '',
  }
}

/** PostgreSQL DATE / ISO 문자열 모두 YYYY-MM-DD 로 맞춤 */
function penaltyWeekStartOnly(v) {
  if (v == null || v === '') return ''
  if (typeof v === 'string') return v.slice(0, 10)
  try {
    const d = new Date(v)
    if (Number.isNaN(d.getTime())) return ''
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  } catch {
    return ''
  }
}

function mapPenalty(p) {
  return {
    id: String(p.id),
    studentId: '',
    studentName: p.student_name || '',
    reason: p.reason || '',
    date: penaltyWeekStartOnly(p.week_start),
    status: 'open',
  }
}

function mapAnnouncement(a) {
  const c = a.creator
  return {
    id: String(a.id),
    title: a.title,
    body: a.content,
    createdAt: a.created_at,
    authorName: c?.name || '',
  }
}

export function DataProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [schedules, setSchedules] = useState([])
  const [jobPosts, setJobPosts] = useState([])
  const [meals, setMeals] = useState([])
  const [portfolios, setPortfolios] = useState([])
  const [rules, setRules] = useState([])
  const [penalties, setPenalties] = useState([])
  const [notices, setNotices] = useState([])
  const [scheduleMonth, setScheduleMonth] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
  const scheduleMonthRef = useRef(scheduleMonth)
  scheduleMonthRef.current = scheduleMonth

  const refreshSchedules = useCallback(async (monthYYYYMM) => {
    const m = monthYYYYMM || scheduleMonthRef.current
    const rows = await apiFetch(`/events?month=${encodeURIComponent(m)}`)
    setSchedules(Array.isArray(rows) ? rows.map(mapEvent) : [])
    if (monthYYYYMM) setScheduleMonth(monthYYYYMM)
  }, [])

  const refreshMeals = useCallback(async () => {
    const todayRes = await apiFetch('/meals/today')
    const weekRes = await apiFetch('/meals?offset=0')
    const map = new Map()
    if (todayRes?.date && typeof todayRes.content === 'string') {
      map.set(todayRes.date, mealMenuFromApiContent(todayRes.content, todayRes.date))
    }
    if (Array.isArray(weekRes)) {
      for (const row of weekRes) {
        if (row?.date)
          map.set(row.date, mealMenuFromApiContent(row.content ?? '', row.date))
      }
    }
    setMeals([...map.values()].sort((a, b) => a.date.localeCompare(b.date)))
  }, [])

  const refreshPortfolios = useCallback(async () => {
    const rows = await apiFetch('/portfolios')
    setPortfolios(Array.isArray(rows) ? rows.map(mapPortfolio) : [])
  }, [])

  const refreshRules = useCallback(async () => {
    const rows = await apiFetch('/rules')
    const mapped = Array.isArray(rows)
      ? rows.map(mapRule).sort((a, b) => a.order - b.order)
      : []
    setRules(mapped)
  }, [])

  const refreshPenalties = useCallback(async () => {
    const rows = await apiFetch('/penalties/recent')
    setPenalties(Array.isArray(rows) ? rows.map(mapPenalty) : [])
  }, [])

  const refreshJobPosts = useCallback(async () => {
    const rows = await apiFetch('/employment')
    setJobPosts(Array.isArray(rows) ? rows.map(mapEmployment) : [])
  }, [])

  const refreshNotices = useCallback(async () => {
    const rows = await apiFetch('/announcements')
    setNotices(Array.isArray(rows) ? rows.map(mapAnnouncement) : [])
  }, [])

  const refreshAll = useCallback(async () => {
    const d = new Date()
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    await Promise.all([
      refreshSchedules(month),
      refreshMeals(),
      refreshPortfolios(),
      refreshRules(),
      refreshPenalties(),
      refreshJobPosts(),
      refreshNotices(),
    ])
  }, [
    refreshJobPosts,
    refreshMeals,
    refreshNotices,
    refreshPenalties,
    refreshPortfolios,
    refreshRules,
    refreshSchedules,
  ])

  useEffect(() => {
    if (!isAuthenticated) {
      setSchedules([])
      setJobPosts([])
      setMeals([])
      setPortfolios([])
      setRules([])
      setPenalties([])
      setNotices([])
      return
    }
    refreshAll().catch(() => {})
  }, [isAuthenticated, refreshAll])

  const addSchedule = useCallback(
    async (payload) => {
      const title = payload.important
        ? `[중요] ${payload.title.trim()}`
        : payload.title.trim()
      await apiFetch('/events', {
        method: 'POST',
        body: {
          title,
          description: payload.description?.trim() || '',
          event_date: payload.date,
        },
      })
      const month = payload.date?.slice(0, 7) || scheduleMonthRef.current
      await refreshSchedules(month)
    },
    [refreshSchedules],
  )

  const updateSchedule = useCallback(async (_id, _patch) => {
    /* 백엔드에 일정 수정 API 없음 */
  }, [])

  const removeSchedule = useCallback(
    async (id) => {
      await apiFetch(`/events/${encodeURIComponent(id)}`, { method: 'DELETE' })
      await refreshSchedules()
    },
    [refreshSchedules],
  )

  const addJobPost = useCallback(
    async (payload) => {
      await apiFetch('/employment', {
        method: 'POST',
        body: {
          title: payload.title,
          company: payload.company || '',
          content: payload.content,
        },
      })
      await refreshJobPosts()
    },
    [refreshJobPosts],
  )

  const removeJobPost = useCallback(
    async (id) => {
      await apiFetch(`/employment/${encodeURIComponent(id)}`, { method: 'DELETE' })
      await refreshJobPosts()
    },
    [refreshJobPosts],
  )

  const upsertPortfolio = useCallback(
    async (_ownerId, _ownerName, payload) => {
      const mine = await apiFetch('/portfolios/me')
      if (Array.isArray(mine)) {
        for (const row of mine) {
          if (row?.id != null) {
            await apiFetch(`/portfolios/${encodeURIComponent(row.id)}`, {
              method: 'DELETE',
            })
          }
        }
      }
      const body = {
        title: payload.title,
        summary: payload.summary ?? '',
        link: payload.link ?? '',
      }
      if (payload.resume) body.resume = payload.resume
      if (payload.portfolio) body.portfolio = payload.portfolio
      await apiFetch('/portfolios', {
        method: 'POST',
        body,
      })
      await refreshPortfolios()
    },
    [refreshPortfolios],
  )

  const addRule = useCallback(
    async (text) => {
      await apiFetch('/rules', { method: 'POST', body: { content: text } })
      await refreshRules()
    },
    [refreshRules],
  )

  const removeRule = useCallback(
    async (id) => {
      await apiFetch(`/rules/${encodeURIComponent(id)}`, { method: 'DELETE' })
      await refreshRules()
    },
    [refreshRules],
  )

  const addPenalty = useCallback(
    async (payload) => {
      await apiFetch('/penalties', {
        method: 'POST',
        body: {
          student_name: payload.studentName,
          reason: payload.reason,
          week_start: payload.date,
        },
      })
      await refreshPenalties()
    },
    [refreshPenalties],
  )

  const updatePenaltyStatus = useCallback(async (_id, _status) => {
    /* 백엔드에 패널티 상태 필드 없음 — UI만 유지 */
  }, [])

  const addNotice = useCallback(
    async (payload) => {
      await apiFetch('/announcements', {
        method: 'POST',
        body: { title: payload.title, content: payload.body },
      })
      await refreshNotices()
    },
    [refreshNotices],
  )

  const value = useMemo(
    () => ({
      schedules,
      jobPosts,
      meals,
      portfolios,
      rules,
      penalties,
      notices,
      scheduleMonth,
      setScheduleMonth,
      refreshSchedules,
      refreshMeals,
      refreshAll,
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
      scheduleMonth,
      refreshSchedules,
      refreshMeals,
      refreshAll,
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
