import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/common/PageHeader.jsx'
import Button from '../components/common/Button.jsx'
import Card from '../components/common/Card.jsx'
import Badge from '../components/common/Badge.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import Icon from '../components/common/Icon.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useData } from '../context/DataContext.jsx'
import { formatDate } from '../utils/date.js'

export default function JobsPage() {
  const { user, isTeacher, canPostJobs } = useAuth()
  const { jobPosts } = useData()
  const [q, setQ] = useState('')

  const visible = useMemo(() => {
    const base = isTeacher ? jobPosts : jobPosts.filter((j) => j.authorId === user.id)
    if (!q.trim()) return base
    const needle = q.toLowerCase()
    return base.filter(
      (j) =>
        j.title.toLowerCase().includes(needle) ||
        j.content.toLowerCase().includes(needle) ||
        (j.company || '').toLowerCase().includes(needle),
    )
  }, [jobPosts, user, isTeacher, q])

  return (
    <>
      <PageHeader
        title="취업 정보"
        description={
          isTeacher
            ? '학생들이 올린 취업 관련 게시글을 모두 열람할 수 있습니다.'
            : canPostJobs
            ? '반 대표 권한으로 취업 정보를 작성할 수 있어요. 작성한 글은 담임 선생님만 함께 열람합니다.'
            : '취업 정보 작성은 담임 선생님과 반 대표 학생만 가능합니다. 본인이 관련된 게시글이 있으면 이곳에 표시됩니다.'
        }
        actions={
          canPostJobs && (
            <Link to="/jobs/new" className="btn btn-primary">
              <Icon name="plus" size={15} />
              새 글 작성
            </Link>
          )
        }
      />

      <div className="filter-bar">
        <input
          type="search"
          placeholder="제목, 내용, 회사명 검색"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ flex: 1, minWidth: 220 }}
        />
        <Badge tone="primary">
          {isTeacher ? `총 ${visible.length}건 · 전체 열람 가능` : '본인 + 교사만 열람'}
        </Badge>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title="표시할 게시글이 없습니다"
          description={
            isTeacher
              ? '아직 학생이 작성한 취업 정보가 없어요.'
              : '첫 게시글을 작성해보세요.'
          }
        />
      ) : (
        <div className="grid grid-2">
          {visible.map((j) => (
            <Link key={j.id} to={`/jobs/${j.id}`} className="job-card">
              <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <div className="job-title">{j.title}</div>
                  <Badge tone="primary">교사 열람</Badge>
                </div>
                <div className="job-meta">
                  {j.authorName}
                  {j.company ? ` · ${j.company}` : ''} · {formatDate(j.createdAt)}
                </div>
                <p className="job-excerpt">{j.content}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
