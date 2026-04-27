import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/common/PageHeader.jsx'
import Card from '../components/common/Card.jsx'
import Badge from '../components/common/Badge.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import Icon from '../components/common/Icon.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useData } from '../context/DataContext.jsx'
import { formatDate } from '../utils/date.js'

function PortfolioCardBody({ p, canOpen, isOwn }) {
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
        <div style={{ minWidth: 0 }}>
          {isOwn && <div className="portfolio-own-tag">내 포트폴리오</div>}
          <div className="job-title">
            {canOpen ? p.title : `${p.ownerName}님의 포트폴리오`}
          </div>
          <div className="job-meta">
            {p.ownerName} · {formatDate(p.updatedAt)} 수정
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Badge tone={p.resume ? 'success' : 'default'}>
            이력서 {p.resume ? '업로드' : '없음'}
          </Badge>
          <Badge tone={p.portfolio ? 'success' : 'default'}>
            포트폴리오 {p.portfolio ? '업로드' : '없음'}
          </Badge>
        </div>
      </div>

      {!canOpen && (
        <div className="portfolio-lock-hint">
          <Icon name="lock" size={13} />
          PDF 내용은 본인과 교사만 열람할 수 있어요.
        </div>
      )}
    </Card>
  )
}

export default function PortfolioListPage() {
  const { user, isTeacher } = useAuth()
  const { portfolios } = useData()
  const [q, setQ] = useState('')

  const myPortfolio = [...portfolios]
    .filter((p) => p.ownerId === user.id)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]

  const visible = useMemo(() => {
    // 학생/취업관리자는 본인 포트폴리오만 노출
    return [...portfolios]
      .filter((p) => p.ownerId === user.id)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [portfolios, user.id])

  const teacherVisible = useMemo(() => {
    if (!isTeacher) return []
    const latestByOwner = new Map()
    for (const p of portfolios) {
      const prev = latestByOwner.get(p.ownerId)
      if (!prev || new Date(p.updatedAt).getTime() > new Date(prev.updatedAt).getTime()) {
        latestByOwner.set(p.ownerId, p)
      }
    }
    const list = [...latestByOwner.values()].sort((a, b) =>
      a.ownerName.localeCompare(b.ownerName, 'ko'),
    )
    if (!q.trim()) return list
    const needle = q.toLowerCase()
    return list.filter((p) => p.ownerName.toLowerCase().includes(needle))
  }, [isTeacher, portfolios, q])

  return (
    <>
      <PageHeader
        title="포트폴리오"
        description={
          isTeacher
            ? '전체 학생의 이력서·포트폴리오 PDF를 열람할 수 있습니다.'
            : '본인 포트폴리오만 확인하고 수정할 수 있어요.'
        }
        actions={
          !isTeacher && (
            <Link to={`/portfolio/${user.id}/edit`} className="btn btn-primary">
              {myPortfolio ? '내 포트폴리오 수정' : '포트폴리오 등록'}
            </Link>
          )
        }
      />

      {isTeacher && (
        <div className="filter-bar">
          <input
            type="search"
            placeholder="학생 이름 검색"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ flex: 1, minWidth: 220 }}
          />
        </div>
      )}

      {isTeacher ? (
        teacherVisible.length === 0 ? (
          <EmptyState title="등록된 포트폴리오가 없습니다" />
        ) : (
          <Card title="학생별 포트폴리오">
            <ul className="upcoming-list">
              {teacherVisible.map((p) => (
                <li key={p.ownerId} className="upcoming-item">
                  <div>
                    <div className="upcoming-title">{p.ownerName}</div>
                    <div className="upcoming-date">{formatDate(p.updatedAt)} 수정</div>
                  </div>
                  <Link to={`/portfolio/${p.ownerId}`} className="btn btn-primary">
                    열기
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )
      ) : visible.length === 0 ? (
        <EmptyState title="등록된 포트폴리오가 없습니다" />
      ) : (
        <div className="grid grid-2">
          {visible.map((p) => {
            const isOwn = p.ownerId === user.id
            const canOpen = isTeacher || isOwn
            return canOpen ? (
              <Link key={p.id} to={`/portfolio/${p.ownerId}`} className="job-card">
                <PortfolioCardBody p={p} canOpen isOwn={isOwn} />
              </Link>
            ) : (
              <div key={p.id} className="portfolio-locked">
                <PortfolioCardBody p={p} canOpen={false} isOwn={false} />
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
