import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../components/common/PageHeader.jsx'
import Card from '../components/common/Card.jsx'
import Badge from '../components/common/Badge.jsx'
import Button from '../components/common/Button.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useData } from '../context/DataContext.jsx'
import { formatDate } from '../utils/date.js'

export default function JobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isTeacher } = useAuth()
  const { jobPosts, removeJobPost } = useData()
  const post = jobPosts.find((j) => j.id === id)

  if (!post) return <Navigate to="/jobs" replace />

  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠어요?')) return
    try {
      await removeJobPost(post.id)
      navigate('/jobs', { replace: true })
    } catch (err) {
      window.alert(err?.message || '삭제에 실패했습니다.')
    }
  }

  const canDelete = isTeacher || post.authorId === user.id

  return (
    <>
      <PageHeader
        title="취업 정보 상세"
        description="게시글 상세 내용"
        actions={<Link to="/jobs" className="btn btn-ghost">목록으로</Link>}
      />

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: 20, marginBottom: 6 }}>{post.title}</h2>
            <div className="job-meta">
              {post.authorName}
              {post.company ? ` · ${post.company}` : ''} · {formatDate(post.createdAt)}
            </div>
          </div>
          <Badge tone="primary">학급 공유</Badge>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />

        <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{post.content}</div>

        {canDelete && (
          <div className="form-actions">
            <Button variant="danger" onClick={handleDelete}>삭제</Button>
          </div>
        )}
      </Card>
    </>
  )
}
