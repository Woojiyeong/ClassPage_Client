export const toDate = (value) => (value instanceof Date ? value : new Date(value))

export const formatDate = (value, withWeekday = false) => {
  const d = toDate(value)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const base = `${y}.${m}.${day}`
  if (!withWeekday) return base
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()]
  return `${base} (${weekday})`
}

export const toISO = (value) => {
  const d = toDate(value)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const isSameDay = (a, b) => toISO(a) === toISO(b)

export const startOfDay = (value) => {
  const d = toDate(value)
  d.setHours(0, 0, 0, 0)
  return d
}

/** 월요일 시작 주 (백엔드 penalties week_start 와 동일) */
export const startOfWeek = (value) => {
  const d = startOfDay(value)
  const day = d.getDay()
  const diffToMonday = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diffToMonday)
  return d
}

export const endOfWeek = (value) => {
  const d = startOfWeek(value)
  d.setDate(d.getDate() + 6)
  d.setHours(23, 59, 59, 999)
  return d
}

export const daysUntil = (value) => {
  const diff = startOfDay(value).getTime() - startOfDay(new Date()).getTime()
  return Math.round(diff / (1000 * 60 * 60 * 24))
}

export const daysUntilLabel = (value) => {
  const n = daysUntil(value)
  if (n === 0) return '오늘'
  if (n === 1) return '내일'
  if (n > 0) return `D-${n}`
  return `지난 ${Math.abs(n)}일`
}

export const buildMonthMatrix = (year, month) => {
  const first = new Date(year, month, 1)
  const startDay = first.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < startDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}
