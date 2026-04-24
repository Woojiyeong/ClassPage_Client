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
  const { isTeacher, canPostJobs } = useAuth()
  const { jobPosts } = useData()
  const [q, setQ] = useState('')

  const visible = useMemo(() => {
    const base = jobPosts
    if (!q.trim()) return base
    const needle = q.toLowerCase()
    return base.filter(
      (j) =>
        j.title.toLowerCase().includes(needle) ||
        j.content.toLowerCase().includes(needle) ||
        (j.company || '').toLowerCase().includes(needle),
    )
  }, [jobPosts, q])

  return (
    <>
      <PageHeader
        title="취업 정보"
        description={
          isTeacher
            ? '학급 취업 관련 게시글을 모두 열람하고 관리할 수 있습니다.'
            : canPostJobs
            ? '취업 담당 권한으로 취업 정보를 작성할 수 있어요. 게시글은 학급 전체에 공유됩니다.'
            : '학급 전체 취업 게시글을 열람할 수 있습니다.'
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
          {`총 ${visible.length}건 · 학급 전체 열람`}
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
                  <Badge tone="primary">학급 공유</Badge>
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
