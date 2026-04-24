import { Link } from 'react-router-dom'
import { useState } from 'react'
import PageHeader from '../components/common/PageHeader.jsx'
import Card from '../components/common/Card.jsx'
import Badge from '../components/common/Badge.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import Icon from '../components/common/Icon.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useData } from '../context/DataContext.jsx'
import { endOfWeek, formatDate, startOfWeek } from '../utils/date.js'

export default function AdminPage() {
  const { user } = useAuth()
  const { schedules, rules, penalties, jobPosts, portfolios, notices, addNotice, removeNotice, updateNotice } = useData()
  const [editingNoticeId, setEditingNoticeId] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editBody, setEditBody] = useState('')

  const weekPenalties = (() => {
    const s = startOfWeek(new Date()).getTime()
    const e = endOfWeek(new Date()).getTime()
    return penalties.filter((p) => {
      const t = new Date(p.date).getTime()
      return t >= s && t <= e
    })
  })()

  const postNotice = async (e) => {
    e.preventDefault()
    const formEl = e.currentTarget
    const title = formEl.title.value.trim()
    const body = formEl.body.value.trim()
    if (!title || !body) return
    try {
      await addNotice({ title, body, authorName: user?.name || '교사' })
      formEl.reset()
    } catch (err) {
      window.alert(err?.message || '공지 등록에 실패했습니다.')
    }
  }

  const startEditNotice = (n) => {
    setEditingNoticeId(n.id)
    setEditTitle(n.title)
    setEditBody(n.body)
  }

  return (
    <>
      <PageHeader
        title="관리자"
        description="학급 운영 전반을 관리할 수 있는 통합 페이지입니다."
      />

      <div className="grid grid-3">
        <Card
          title="일정 관리"
          subtitle={`총 ${schedules.length}건`}
          action={<Link to="/schedule" className="card-link">이동 <Icon name="arrowRight" size={13} /></Link>}
        >
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            학사 일정 페이지에서 추가/삭제할 수 있습니다.
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <Badge tone="warning">
              중요 {schedules.filter((s) => s.important).length}건
            </Badge>
          </div>
        </Card>

        <Card
          title="학급 규칙"
          subtitle={`총 ${rules.length}개`}
          action={<Link to="/rules" className="card-link">이동 <Icon name="arrowRight" size={13} /></Link>}
        >
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            규칙 페이지에서 추가/삭제가 가능합니다.
          </p>
        </Card>

        <Card
          title="패널티자 현황"
          subtitle={`이번 주 ${weekPenalties.length}건`}
          action={<Link to="/penalties" className="card-link">이동 <Icon name="arrowRight" size={13} /></Link>}
        >
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            진행중 {weekPenalties.filter((p) => p.status === 'open').length}건
            · 해결 {weekPenalties.filter((p) => p.status === 'resolved').length}건
          </p>
        </Card>

        <Card
          title="전체 포트폴리오"
          subtitle={`총 ${portfolios.length}명`}
          action={<Link to="/portfolio" className="card-link">이동 <Icon name="arrowRight" size={13} /></Link>}
        >
          {portfolios.length === 0 ? (
            <EmptyState title="등록된 포트폴리오가 없습니다" />
          ) : (
            <ul className="upcoming-list">
              {portfolios.slice(0, 3).map((p) => (
                <li key={p.id} className="upcoming-item">
                  <div>
                    <div className="upcoming-title">{p.ownerName}</div>
                    <div className="upcoming-date">{formatDate(p.updatedAt)} 수정</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="취업 정보 열람"
          subtitle={`총 ${jobPosts.length}건`}
          action={<Link to="/jobs" className="card-link">이동 <Icon name="arrowRight" size={13} /></Link>}
        >
          {jobPosts.length === 0 ? (
            <EmptyState title="게시글이 없습니다" />
          ) : (
            <ul className="upcoming-list">
              {jobPosts.slice(0, 3).map((j) => (
                <li key={j.id} className="upcoming-item">
                  <div>
                    <div className="upcoming-title">{j.title}</div>
                    <div className="upcoming-date">
                      {j.authorName} · {formatDate(j.createdAt)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="공지사항 발송" subtitle={`최근 ${notices.length}건`}>
          <form onSubmit={postNotice}>
            <div className="form-field">
              <label>제목</label>
              <input name="title" required />
            </div>
            <div className="form-field">
              <label>본문</label>
              <textarea name="body" required />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">게시</button>
            </div>
          </form>
          {notices.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12, color: 'var(--text-soft)', marginBottom: 8 }}>
                최근 공지 관리
              </div>
              <ul className="upcoming-list">
                {notices.slice(0, 5).map((n) => (
                  <li key={n.id} className="upcoming-item">
                    {editingNoticeId === n.id ? (
                      <form
                        style={{ width: '100%' }}
                        onSubmit={async (e) => {
                          e.preventDefault()
                          if (!editTitle.trim() || !editBody.trim()) return
                          try {
                            await updateNotice(n.id, { title: editTitle.trim(), body: editBody.trim() })
                            setEditingNoticeId('')
                            setEditTitle('')
                            setEditBody('')
                          } catch (err) {
                            window.alert(err?.message || '공지 수정에 실패했습니다.')
                          }
                        }}
                      >
                        <div className="form-field">
                          <label>제목</label>
                          <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
                        </div>
                        <div className="form-field">
                          <label>본문</label>
                          <textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} required />
                        </div>
                        <div className="form-actions">
                          <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => {
                              setEditingNoticeId('')
                              setEditTitle('')
                              setEditBody('')
                            }}
                          >
                            취소
                          </button>
                          <button type="submit" className="btn btn-primary">저장</button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div>
                          <div className="upcoming-title">{n.title}</div>
                          <div className="upcoming-date">
                            {n.authorName} · {formatDate(n.createdAt)}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => startEditNotice(n)}
                          >
                            수정
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={async () => {
                              if (!window.confirm('이 공지를 삭제할까요?')) return
                              try {
                                await removeNotice(n.id)
                                if (editingNoticeId === n.id) {
                                  setEditingNoticeId('')
                                  setEditTitle('')
                                  setEditBody('')
                                }
                              } catch (err) {
                                window.alert(err?.message || '공지 삭제에 실패했습니다.')
                              }
                            }}
                          >
                            삭제
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>
    </>
  )
}
