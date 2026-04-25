import { useState } from 'react'
import Button from '../common/Button.jsx'
import { toISO } from '../../utils/date.js'

export default function ScheduleForm({ initialDate, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    title: '',
    startDate: initialDate || toISO(new Date()),
    endDate: '',
    description: '',
    important: false,
  })

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((prev) => {
      if (key === 'startDate') {
        // 시작일이 뒤로 밀리면 종료일이 과거가 되지 않도록 자동 정리
        const nextEndDate = prev.endDate && prev.endDate < value ? '' : prev.endDate
        return { ...prev, startDate: value, endDate: nextEndDate }
      }
      return { ...prev, [key]: value }
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    if (form.endDate && form.endDate < form.startDate) return
    onSubmit?.(form)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-field">
        <label>일정 제목</label>
        <input
          value={form.title}
          onChange={set('title')}
          placeholder="예) 중간고사"
          required
        />
      </div>

      <div className="form-field">
        <label>시작일</label>
        <input type="date" value={form.startDate} onChange={set('startDate')} required />
      </div>

      <div className="form-field">
        <label>종료일 (선택)</label>
        <input
          type="date"
          value={form.endDate}
          onChange={set('endDate')}
          min={form.startDate}
        />
      </div>

      <div className="form-field">
        <label>설명</label>
        <textarea
          value={form.description}
          onChange={set('description')}
          placeholder="상세 설명을 입력하세요"
        />
      </div>

      <label className="form-check">
        <input type="checkbox" checked={form.important} onChange={set('important')} />
        중요 일정으로 표시
      </label>

      <div className="form-actions">
        {onCancel && (
          <Button variant="ghost" type="button" onClick={onCancel}>취소</Button>
        )}
        <Button type="submit">저장</Button>
      </div>
    </form>
  )
}
