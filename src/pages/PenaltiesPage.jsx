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
  const { penalties, addPenalty, removePenalty, updatePenaltyStatus, updatePenaltyDates } = useData()
  const [tab, setTab] = useState('week')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({
    studentName: '',
    reason: '',
    startDate: toISO(new Date()),
    endDate: '',
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

  const submit = async (e) => {
    e.preventDefault()
    if (!form.studentName.trim() || !form.reason.trim()) return
    try {
      await addPenalty({
        studentName: form.studentName.trim(),
        reason: form.reason.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
      })
      setModalOpen(false)
      setForm({ studentName: '', reason: '', startDate: toISO(new Date()), endDate: '' })
    } catch (err) {
      window.alert(err?.message || '저장에 실패했습니다.')
    }
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
                <th>시작일</th>
                <th>만료일</th>
                <th>상태</th>
                {isTeacher && <th style={{ textAlign: 'right' }}>관리</th>}
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id}>
                  <td>{p.studentName}</td>
                  <td>{p.reason}</td>
                  <td>{formatDate(p.startDate || p.date, true)}</td>
                  <td>{p.endDate ? formatDate(p.endDate, true) : '-'}</td>
                  <td>
                    <Badge tone={statusTone[p.status]}>{statusLabel[p.status]}</Badge>
                  </td>
                  {isTeacher && (
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 8 }}>
                        <select
                          value={p.status}
                          onChange={(e) => updatePenaltyStatus(p.id, e.target.value)}
                          style={{
                            padding: '6px 10px',
                            border: '1px solid var(--border)',
                            borderRadius: 6,
                            background: 'var(--surface)',
                          }}
                          title="백엔드에 상태 저장은 아직 없습니다"
                        >
                          <option value="open">진행중</option>
                          <option value="resolved">해결</option>
                          <option value="waived">면제</option>
                        </select>
                        <input
                          type="date"
                          value={p.startDate || p.date}
                          onChange={async (e) => {
                            try {
                              await updatePenaltyDates(p.id, {
                                startDate: e.target.value,
                                endDate: p.endDate || '',
                              })
                            } catch (err) {
                              window.alert(err?.message || '시작일 변경에 실패했습니다.')
                            }
                          }}
                          style={{ padding: '6px 8px', border: '1px solid var(--border)', borderRadius: 6 }}
                        />
                        <input
                          type="date"
                          value={p.endDate || ''}
                          onChange={async (e) => {
                            try {
                              await updatePenaltyDates(p.id, {
                                startDate: p.startDate || p.date,
                                endDate: e.target.value,
                              })
                            } catch (err) {
                              window.alert(err?.message || '만료일 변경에 실패했습니다.')
                            }
                          }}
                          style={{ padding: '6px 8px', border: '1px solid var(--border)', borderRadius: 6 }}
                        />
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={async () => {
                            if (!window.confirm('이 패널티를 삭제할까요?')) return
                            try {
                              await removePenalty(p.id)
                            } catch (err) {
                              window.alert(err?.message || '삭제에 실패했습니다.')
                            }
                          }}
                        >
                          삭제
                        </Button>
                      </div>
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
            <label>학생 이름</label>
            <input
              value={form.studentName}
              onChange={(e) => setForm((p) => ({ ...p, studentName: e.target.value }))}
              required
              placeholder="실명으로 입력"
            />
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
            <label>해당 주 시작일 (월요일 기준)</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
              required
            />
          </div>
          <div className="form-field">
            <label>만료일 (선택)</label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
            />
          </div>
          <div className="form-actions">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              취소
            </Button>
            <Button type="submit">저장</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
