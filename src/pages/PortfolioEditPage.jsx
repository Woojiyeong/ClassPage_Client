import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../components/common/PageHeader.jsx'
import Card from '../components/common/Card.jsx'
import Button from '../components/common/Button.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useData } from '../context/DataContext.jsx'

export default function PortfolioEditPage() {
  const { ownerId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { portfolios, upsertPortfolio } = useData()

  if (ownerId !== user.id) return <Navigate to="/forbidden" replace />

  const mine = portfolios.filter((p) => p.ownerId === user.id)
  const existing = [...mine].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )[0]

  const [form, setForm] = useState({
    title: `${user.name} 포트폴리오`,
    summary: '',
    content: '',
    link: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!existing) return
    setForm({
      title: existing.title || `${user.name} 포트폴리오`,
      summary: existing.summary || '',
      content: existing.content || '',
      link: existing.link || '',
    })
  }, [existing?.id, user.name])

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) {
      window.alert('제목과 본문은 필수입니다.')
      return
    }
    setSaving(true)
    try {
      await upsertPortfolio(user.id, user.name, {
        title: form.title.trim(),
        summary: form.summary.trim(),
        content: form.content.trim(),
        link: form.link.trim(),
      })
      navigate(`/portfolio/${user.id}`, { replace: true })
    } catch (err) {
      window.alert(err?.message || '저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader
        title={existing ? '포트폴리오 수정' : '포트폴리오 등록'}
        description="제목·요약·본문은 서버에 저장됩니다. (PDF 직접 업로드는 추후 지원)"
      />

      <form onSubmit={submit}>
        <Card title="내용">
          <div className="form-field">
            <label>제목</label>
            <input value={form.title} onChange={set('title')} required />
          </div>
          <div className="form-field">
            <label>한 줄 소개</label>
            <input
              value={form.summary}
              onChange={set('summary')}
              placeholder="예: 프론트엔드 지망, React 프로젝트 위주"
            />
          </div>
          <div className="form-field">
            <label>본문</label>
            <textarea
              value={form.content}
              onChange={set('content')}
              required
              rows={10}
              placeholder="활동 내역, 링크 설명 등을 적어주세요."
            />
          </div>
          <div className="form-field">
            <label>외부 링크 (선택)</label>
            <input
              value={form.link}
              onChange={set('link')}
              placeholder="https://..."
            />
          </div>
        </Card>

        <div className="form-actions">
          <Button variant="ghost" type="button" onClick={() => navigate(-1)}>
            취소
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? '저장 중…' : '저장'}
          </Button>
        </div>
      </form>
    </>
  )
}
