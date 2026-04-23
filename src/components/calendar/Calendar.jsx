import { useMemo, useState } from 'react'
import { buildMonthMatrix, isSameDay, toISO } from '../../utils/date.js'
import Icon from '../common/Icon.jsx'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

export default function Calendar({ schedules, selectedDate, onSelect }) {
  const [cursor, setCursor] = useState(() => {
    const d = selectedDate ? new Date(selectedDate) : new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  const cells = useMemo(
    () => buildMonthMatrix(cursor.year, cursor.month),
    [cursor],
  )

  const byDate = useMemo(() => {
    const map = new Map()
    for (const s of schedules) {
      const key = toISO(s.date)
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(s)
    }
    return map
  }, [schedules])

  const prev = () => {
    setCursor(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 },
    )
  }
  const next = () => {
    setCursor(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 },
    )
  }
  const today = new Date()

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button type="button" onClick={prev} className="btn btn-icon" aria-label="이전 달">
          <Icon name="chevronLeft" size={18} />
        </button>
        <div className="calendar-title">
          {cursor.year}년 {cursor.month + 1}월
        </div>
        <button type="button" onClick={next} className="btn btn-icon" aria-label="다음 달">
          <Icon name="chevronRight" size={18} />
        </button>
      </div>

      <div className="calendar-weekdays">
        {WEEKDAYS.map((w, i) => (
          <div key={w} className={`calendar-weekday ${i === 0 ? 'is-sun' : ''} ${i === 6 ? 'is-sat' : ''}`}>
            {w}
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} className="calendar-cell is-empty" />
          const iso = toISO(day)
          const events = byDate.get(iso) || []
          const isToday = isSameDay(day, today)
          const isSelected = selectedDate && isSameDay(day, selectedDate)
          return (
            <button
              type="button"
              key={iso}
              className={`calendar-cell${isToday ? ' is-today' : ''}${isSelected ? ' is-selected' : ''}`}
              onClick={() => onSelect?.(iso)}
            >
              <span className="calendar-day">{day.getDate()}</span>
              <div className="calendar-events">
                {events.slice(0, 2).map((e) => (
                  <span
                    key={e.id}
                    className={`calendar-event${e.important ? ' is-important' : ''}`}
                    title={e.title}
                  >
                    {e.title}
                  </span>
                ))}
                {events.length > 2 && (
                  <span className="calendar-event is-more">+{events.length - 2}</span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
