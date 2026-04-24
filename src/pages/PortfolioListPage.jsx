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
  const [fileFilter, setFileFilter] = useState('')

  const myPortfolio = [...portfolios]
    .filter((p) => p.ownerId === user.id)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]

  const visible = useMemo(() => {
    // 내 포트폴리오가 목록 맨 앞, 이후 최근 수정 순
    const sorted = [...portfolios].sort((a, b) => {
      if (a.ownerId === user.id) return -1
      if (b.ownerId === user.id) return 1
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })

    return sorted
      .filter((p) => {
        if (!q.trim()) return true
        const needle = q.toLowerCase()
        // 학생이 남의 카드를 검색할 때는 이름만 매칭 (title은 비공개)
        const searchable =
          isTeacher || p.ownerId === user.id
            ? `${p.title} ${p.ownerName}`
            : p.ownerName
        return searchable.toLowerCase().includes(needle)
      })
      .filter((p) => {
        if (fileFilter === 'resume') return !!p.resume
        if (fileFilter === 'portfolio') return !!p.portfolio
        if (fileFilter === 'both') return !!p.resume && !!p.portfolio
        if (fileFilter === 'missing') return !p.resume || !p.portfolio
        return true
      })
  }, [portfolios, user, isTeacher, q, fileFilter])

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
            : '반 전체의 업로드 현황을 볼 수 있어요. PDF 내용은 본인 것만 열람할 수 있어요.'
        }
        actions={
          !isTeacher && (
            <Link to={`/portfolio/${user.id}/edit`} className="btn btn-primary">
              {myPortfolio ? '내 포트폴리오 수정' : '포트폴리오 등록'}
            </Link>
          )
        }
      />

      <div className="filter-bar">
        <input
          type="search"
          placeholder={isTeacher ? '학생 이름 검색' : '반 친구 이름 검색'}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ flex: 1, minWidth: 220 }}
        />
        {!isTeacher && (
          <select value={fileFilter} onChange={(e) => setFileFilter(e.target.value)}>
            <option value="">업로드 상태 전체</option>
            <option value="both">이력서 + 포트폴리오</option>
            <option value="resume">이력서 업로드</option>
            <option value="portfolio">포트폴리오 업로드</option>
            <option value="missing">누락 있음</option>
          </select>
        )}
      </div>

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
