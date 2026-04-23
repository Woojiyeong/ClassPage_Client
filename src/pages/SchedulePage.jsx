import { useMemo, useState } from 'react'
import Calendar from '../components/calendar/Calendar.jsx'
import ScheduleForm from '../components/calendar/ScheduleForm.jsx'
import Card from '../components/common/Card.jsx'
import Button from '../components/common/Button.jsx'
import Modal from '../components/common/Modal.jsx'
import Badge from '../components/common/Badge.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import Icon from '../components/common/Icon.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useData } from '../context/DataContext.jsx'
import {
  daysUntilLabel,
  formatDate,
  startOfDay,
  toISO,
} from '../utils/date.js'
import '../components/calendar/Calendar.css'

export default function SchedulePage() {
  const { user, isTeacher } = useAuth()
  const { schedules, addSchedule, removeSchedule, refreshSchedules } = useData()
  const [selectedDate, setSelectedDate] = useState(toISO(new Date()))
  const [modalOpen, setModalOpen] = useState(false)

  const selectedSchedules = useMemo(
    () =>
      schedules
        .filter((s) => s.date === selectedDate)
        .sort((a, b) => (a.important === b.important ? 0 : a.important ? -1 : 1)),
    [schedules, selectedDate],
  )

  const upcoming = useMemo(() => {
    const today = startOfDay(new Date()).getTime()
    return schedules
      .filter((s) => new Date(s.date).getTime() >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 6)
  }, [schedules])

  const handleAdd = async (payload) => {
    try {
      await addSchedule({ ...payload, createdBy: user.id })
      setModalOpen(false)
      setSelectedDate(payload.date)
    } catch (e) {
      window.alert(e?.message || '일정 저장에 실패했습니다.')
    }
  }

  const handleCalendarView = ({ year, month }) => {
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`
    refreshSchedules(monthStr)
  }

  return (
    <>
      <PageHeader
        title="학사 일정"
        description="달력으로 학사 일정을 확인하고 새 일정을 추가할 수 있어요."
        actions={
          isTeacher ? (
            <Button onClick={() => setModalOpen(true)}>
              <Icon name="plus" size={15} />
              일정 추가
            </Button>
          ) : null
        }
      />

      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <Calendar
          schedules={schedules}
          selectedDate={selectedDate}
          onSelect={setSelectedDate}
          onViewChange={handleCalendarView}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Card
            title={`${formatDate(selectedDate, true)} 일정`}
            subtitle={`총 ${selectedSchedules.length}건`}
          >
            {selectedSchedules.length === 0 ? (
              <EmptyState title="이 날짜에는 일정이 없습니다" />
            ) : (
              <ul className="schedule-list">
                {selectedSchedules.map((s) => (
                  <li key={s.id} className="schedule-item">
                    <div className="schedule-main">
                      <div className="schedule-title">
                        {s.important && <Badge tone="warning">중요</Badge>} {s.title}
                      </div>
                      {s.description && (
                        <div className="schedule-desc">{s.description}</div>
                      )}
                    </div>
                    {isTeacher && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSchedule(s.id)}
                      >
                        삭제
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="임박한 일정" subtitle="가까운 순">
            <ul className="upcoming-list">
              {upcoming.map((s) => (
                <li key={s.id} className="upcoming-item">
                  <div>
                    <div className="upcoming-title">{s.title}</div>
                    <div className="upcoming-date">{formatDate(s.date, true)}</div>
                  </div>
                  <Badge tone={s.important ? 'warning' : 'primary'}>
                    {daysUntilLabel(s.date)}
                  </Badge>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <Modal
        open={modalOpen && isTeacher}
        title="새 일정 추가"
        onClose={() => setModalOpen(false)}
      >
        <ScheduleForm
          initialDate={selectedDate}
          onSubmit={handleAdd}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </>
  )
}
