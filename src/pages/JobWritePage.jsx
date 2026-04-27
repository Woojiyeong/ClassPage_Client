import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import PageHeader from '../components/common/PageHeader.jsx'
import Card from '../components/common/Card.jsx'
import Button from '../components/common/Button.jsx'
import Badge from '../components/common/Badge.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useData } from '../context/DataContext.jsx'

export default function JobWritePage() {
  const navigate = useNavigate()
  const { user, canPostJobs } = useAuth()
  const { addJobPost } = useData()
  const [form, setForm] = useState({ title: '', company: '', content: '' })

  if (!canPostJobs) return <Navigate to="/forbidden" replace />


  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) return
    try {
      await addJobPost({
        title: form.title,
        company: form.company,
        content: form.content,
        authorId: user.id,
        authorName: user.name,
        visibility: 'teacher-only',
      })
      navigate('/jobs', { replace: true })
    } catch (err) {
      window.alert(err?.message || '게시에 실패했습니다.')
    }
  }

  return (
    <>
      <PageHeader
        title="새 취업 정보 작성"
        description="게시글은 학급 전체에 공유됩니다."
      />

      <Card>
        <div style={{ marginBottom: 12 }}>
          <Badge tone="primary">공개 범위: 학급 전체</Badge>
        </div>

        <form onSubmit={submit}>
          <div className="form-field">
            <label>제목</label>
            <input value={form.title} onChange={set('title')} required placeholder="예) ○○회사 서류 통과" />
          </div>

          <div className="form-field">
            <label>회사명 (선택)</label>
            <input value={form.company} onChange={set('company')} placeholder="회사/기관명" />
          </div>

          <div className="form-field">
            <label>내용</label>
            <textarea
              value={form.content}
              onChange={set('content')}
              required
              placeholder="상세 내용, 피드백 요청 사항 등을 작성하세요"
            />
          </div>

          <div className="form-actions">
            <Button variant="ghost" type="button" onClick={() => navigate('/jobs')}>
              취소
            </Button>
            <Button type="submit">게시하기</Button>
          </div>
        </form>
      </Card>
    </>
  )
}
