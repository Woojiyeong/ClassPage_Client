import { useMemo, useState } from 'react'
import PageHeader from '../components/common/PageHeader.jsx'
import Card from '../components/common/Card.jsx'
import Badge from '../components/common/Badge.jsx'
import Button from '../components/common/Button.jsx'
import Modal from '../components/common/Modal.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import Icon from '../components/common/Icon.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useData } from '../context/DataContext.jsx'
import { endOfWeek, formatDate, startOfWeek, toISO } from '../utils/date.js'
import { users } from '../data/mockData.js'

const statusTone = {
  open: 'danger',
  resolved: 'success',
  waived: 'default',
}
const statusLabel = {
  open: '진행중',
  resolved: '해결',
  waived: '면제',
}

export default function PenaltiesPage() {
  const { isTeacher } = useAuth()
  const { penalties, addPenalty, updatePenaltyStatus } = useData()
  const [tab, setTab] = useState('week')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({
    studentId: '',
    reason: '',
    date: toISO(new Date()),
  })

  const thisWeek = useMemo(() => {
    const s = startOfWeek(new Date()).getTime()
    const e = endOfWeek(new Date()).getTime()
    return penalties.filter((p) => {
      const t = new Date(p.date).getTime()
      return t >= s && t <= e
    })
  }, [penalties])

  const list = tab === 'week' ? thisWeek : penalties

  const students = users.filter((u) => u.role === 'student')

  const submit = (e) => {
    e.preventDefault()
    const student = students.find((s) => s.id === form.studentId)
    if (!student || !form.reason.trim()) return
    addPenalty({
      studentId: student.id,
      studentName: student.name,
      reason: form.reason.trim(),
      date: form.date,
    })
    setModalOpen(false)
    setForm({ studentId: '', reason: '', date: toISO(new Date()) })
  }

  return (
    <>
      <PageHeader
        title="이번 주 패널티"
        description={
          isTeacher
            ? '주간 패널티 현황을 관리할 수 있습니다.'
            : '이번 주 우리 반의 패널티 현황입니다.'
        }
        actions={
          isTeacher && (
            <Button onClick={() => setModalOpen(true)}>
              <Icon name="plus" size={15} />
              패널티 추가
            </Button>
          )
        }
      />

      <div className="filter-bar">
        <button
          type="button"
          className={`tab-btn${tab === 'week' ? ' is-active' : ''}`}
          onClick={() => setTab('week')}
        >
          이번 주 ({thisWeek.length})
        </button>
        <button
          type="button"
          className={`tab-btn${tab === 'all' ? ' is-active' : ''}`}
          onClick={() => setTab('all')}
        >
          전체 ({penalties.length})
        </button>
      </div>

      <Card>
        {list.length === 0 ? (
          <EmptyState
            title="해당 기간 패널티가 없습니다"
            description="모두 잘 지키고 있어요."
          />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>이름</th>
                <th>사유</th>
                <th>날짜</th>
                <th>상태</th>
                {isTeacher && <th style={{ textAlign: 'right' }}>관리</th>}
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id}>
                  <td>{p.studentName}</td>
                  <td>{p.reason}</td>
                  <td>{formatDate(p.date, true)}</td>
                  <td>
                    <Badge tone={statusTone[p.status]}>{statusLabel[p.status]}</Badge>
                  </td>
                  {isTeacher && (
                    <td style={{ textAlign: 'right' }}>
                      <select
                        value={p.status}
                        onChange={(e) => updatePenaltyStatus(p.id, e.target.value)}
                        style={{
                          padding: '6px 10px',
                          border: '1px solid var(--border)',
                          borderRadius: 6,
                          background: 'var(--surface)',
                        }}
                      >
                        <option value="open">진행중</option>
                        <option value="resolved">해결</option>
                        <option value="waived">면제</option>
                      </select>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal open={modalOpen} title="패널티 추가" onClose={() => setModalOpen(false)}>
        <form onSubmit={submit}>
          <div className="form-field">
            <label>학생</label>
            <select
              value={form.studentId}
              onChange={(e) => setForm((p) => ({ ...p, studentId: e.target.value }))}
              required
            >
              <option value="">선택하세요</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.studentNo})
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>사유</label>
            <input
              value={form.reason}
              onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
              required
            />
          </div>
          <div className="form-field">
            <label>날짜</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              required
            />
          </div>
          <div className="form-actions">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>취소</Button>
            <Button type="submit">저장</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
