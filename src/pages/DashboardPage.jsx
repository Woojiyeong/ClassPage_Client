import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useData } from '../context/DataContext.jsx'
import Card from '../components/common/Card.jsx'
import Badge from '../components/common/Badge.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import Icon from '../components/common/Icon.jsx'
import {
  daysUntilLabel,
  endOfWeek,
  formatDate,
  startOfDay,
  startOfWeek,
  toISO,
} from '../utils/date.js'

export default function DashboardPage() {
  const { user, isTeacher } = useAuth()
  const { schedules, meals, penalties, rules, jobPosts, portfolios } = useData()

  const todayIso = toISO(new Date())
  const todayMeal = meals.find((m) => m.date === todayIso)

  const upcoming = useMemo(() => {
    const today = startOfDay(new Date()).getTime()
    return schedules
      .map((s) => ({ ...s, ts: new Date(s.date).getTime() }))
      .filter((s) => s.ts >= today)
      .sort((a, b) =>
        a.important === b.important ? a.ts - b.ts : a.important ? -1 : 1,
      )
      .slice(0, 4)
  }, [schedules])

  const weekPenalties = useMemo(() => {
    const s = startOfWeek(new Date()).getTime()
    const e = endOfWeek(new Date()).getTime()
    return penalties.filter((p) => {
      const t = new Date(p.date).getTime()
      return t >= s && t <= e
    })
  }, [penalties])

  const myJobs = useMemo(() => {
    if (!user) return []
    if (isTeacher) return jobPosts
    return jobPosts.filter((j) => j.authorId === user.id)
  }, [jobPosts, user, isTeacher])

  const visiblePortfolios = useMemo(() => {
    // 목록 카드에서는 반 전체 현황 노출 (제목/내용은 비공개, 업로드 여부만 표시)
    return [...portfolios].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
  }, [portfolios])

  return (
    <>
      <div className="page-header">
        <div>
          <h1>대시보드</h1>
          <p>
            {isTeacher
              ? '관리자 권한으로 오늘의 학급 현황을 확인할 수 있어요.'
              : '오늘의 일정과 학급 소식을 한눈에 확인해보세요.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/schedule" className="btn btn-ghost">일정 보기</Link>
          <Link to={isTeacher ? '/admin' : '/portfolio'} className="btn btn-primary">
            {isTeacher ? '관리자 페이지' : '내 포트폴리오'}
          </Link>
        </div>
      </div>

      <div className="grid grid-3">
        <Card
          title="임박한 학사 일정"
          subtitle="오늘 이후 중요한 일정"
          action={<Link to="/schedule" className="card-link">전체보기 <Icon name="arrowRight" size={13} /></Link>}
        >
          {upcoming.length === 0 ? (
            <EmptyState title="예정된 일정이 없습니다" />
          ) : (
            <ul className="upcoming-list">
              {upcoming.map((s) => (
                <li key={s.id} className="upcoming-item">
                  <div>
                    <div className="upcoming-title">
                      {s.important && <Badge tone="warning">중요</Badge>} {s.title}
                    </div>
                    <div className="upcoming-date">{formatDate(s.date, true)}</div>
                  </div>
                  <Badge tone={s.important ? 'warning' : 'primary'}>
                    {daysUntilLabel(s.date)}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="오늘의 급식"
          subtitle={formatDate(new Date(), true)}
          action={<Link to="/meals" className="card-link">주간보기 <Icon name="arrowRight" size={13} /></Link>}
        >
          {todayMeal ? (
            <ul className="dash-meal-list">
              {[
                { key: 'breakfast', label: '조식' },
                { key: 'lunch', label: '중식' },
                { key: 'dinner', label: '석식' },
              ].map(({ key, label }) => {
                const s = todayMeal[key]
                return (
                  <li key={key} className="dash-meal-item">
                    <span className="dash-meal-label">{label}</span>
                    <span className="dash-meal-dishes">
                      {s ? s.dishes.join(' · ') : <em>등록된 메뉴 없음</em>}
                    </span>
                  </li>
                )
              })}
            </ul>
          ) : (
            <EmptyState title="오늘은 급식 정보가 없습니다" />
          )}
        </Card>

        <Card
          title="이번 주 패널티"
          subtitle="7일간 현황"
          action={<Link to="/penalties" className="card-link">전체보기 <Icon name="arrowRight" size={13} /></Link>}
        >
          {weekPenalties.length === 0 ? (
            <EmptyState title="이번 주 패널티가 없습니다" />
          ) : (
            <ul className="upcoming-list">
              {weekPenalties.slice(0, 4).map((p) => (
                <li key={p.id} className="upcoming-item">
                  <div>
                    <div className="upcoming-title">{p.studentName}</div>
                    <div className="upcoming-date">{p.reason}</div>
                  </div>
                  <Badge
                    tone={
                      p.status === 'open'
                        ? 'danger'
                        : p.status === 'resolved'
                        ? 'success'
                        : 'default'
                    }
                  >
                    {p.status === 'open' ? '진행중' : p.status === 'resolved' ? '해결' : '면제'}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="학급 규칙 요약"
          subtitle={`총 ${rules.length}개`}
          action={<Link to="/rules" className="card-link">전체보기 <Icon name="arrowRight" size={13} /></Link>}
        >
          <ol className="rule-list">
            {rules.slice(0, 4).map((r) => (
              <li key={r.id}>
                <span className="rule-number">{r.order}</span>
                <span>{r.text}</span>
              </li>
            ))}
          </ol>
        </Card>

        <Card
          title="취업 정보 요약"
          subtitle={isTeacher ? '전체 게시글' : '내가 올린 게시글'}
          action={<Link to="/jobs" className="card-link">전체보기 <Icon name="arrowRight" size={13} /></Link>}
        >
          {myJobs.length === 0 ? (
            <EmptyState
              title="게시된 내용이 없습니다"
              description={isTeacher ? '학생들이 올린 취업 정보가 이곳에 표시됩니다.' : '첫 글을 작성해보세요.'}
            />
          ) : (
            <ul className="upcoming-list">
              {myJobs.slice(0, 3).map((j) => (
                <li key={j.id} className="upcoming-item">
                  <div>
                    <div className="upcoming-title">{j.title}</div>
                    <div className="upcoming-date">
                      {j.authorName} · {formatDate(j.createdAt)}
                    </div>
                  </div>
                  <Badge tone="primary">교사 열람</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="반 포트폴리오 현황"
          subtitle={isTeacher ? '전체 학생 업로드 현황' : '반 친구들의 업로드 현황'}
          action={<Link to="/portfolio" className="card-link">전체보기 <Icon name="arrowRight" size={13} /></Link>}
        >
          {visiblePortfolios.length === 0 ? (
            <EmptyState title="등록된 포트폴리오가 없습니다" />
          ) : (
            <ul className="upcoming-list">
              {visiblePortfolios.slice(0, 3).map((p) => {
                const isOwn = p.ownerId === user?.id
                const canOpen = isTeacher || isOwn
                const hasBody = !!(p.content && String(p.content).trim())
                const hasLink = !!(p.link && String(p.link).trim())
                const count = (hasBody ? 1 : 0) + (hasLink ? 1 : 0)
                return (
                  <li key={p.id} className="upcoming-item">
                    <div>
                      <div className="upcoming-title">
                        {canOpen ? p.title : `${p.ownerName}님의 포트폴리오`}
                      </div>
                      <div className="upcoming-date">
                        {p.ownerName} · {formatDate(p.updatedAt)} 수정
                      </div>
                    </div>
                    <Badge tone={count === 2 ? 'success' : count === 1 ? 'primary' : 'default'}>
                      작성 {count}/2
                    </Badge>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      </div>
    </>
  )
}
