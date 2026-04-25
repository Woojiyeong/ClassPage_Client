import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../components/common/PageHeader.jsx'
import Card from '../components/common/Card.jsx'
import Button from '../components/common/Button.jsx'
import Badge from '../components/common/Badge.jsx'
import Icon from '../components/common/Icon.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useData } from '../context/DataContext.jsx'
import { formatBytes, readPdfAsDataUrl, MAX_PDF_BYTES } from '../utils/file.js'

function FileField({ label, description, file, onChange, onRemove, error }) {
  const inputId = `file-${label}`
  return (
    <div className="form-field">
      <label>{label}</label>
      <div style={{ fontSize: 12, color: 'var(--text-soft)', marginBottom: 6 }}>
        {description} · PDF만, 최대 {formatBytes(MAX_PDF_BYTES)}
      </div>

      {file ? (
        <div className="file-row">
          <div className="file-icon">
            <Icon name="fileText" size={18} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="file-name">{file.name}</div>
            <div className="file-meta">{formatBytes(file.size)}</div>
          </div>
          <Badge tone="success">업로드됨</Badge>
          <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
            제거
          </Button>
        </div>
      ) : (
        <>
          <input
            id={inputId}
            type="file"
            accept="application/pdf"
            onChange={onChange}
            style={{ display: 'none' }}
          />
          <label htmlFor={inputId} className="file-drop">
            <div className="file-drop-icon">
              <Icon name="upload" size={20} />
            </div>
            <div>
              <div className="file-drop-title">클릭하여 PDF 선택</div>
              <div className="file-drop-sub">파일을 선택하면 자동으로 읽습니다.</div>
            </div>
          </label>
        </>
      )}

      {error && <div className="file-error">{error}</div>}
    </div>
  )
}

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
    resume: null,
    link: '',
  })
  const [errors, setErrors] = useState({ resume: '', general: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!existing) return
    setForm({
      title: existing.title || `${user.name} 포트폴리오`,
      resume: existing.resume || null,
      link: existing.link || '',
    })
  }, [existing?.id, user.name])

  const handleFile = (key) => async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const payload = await readPdfAsDataUrl(file)
      setForm((p) => ({ ...p, [key]: payload }))
      setErrors((p) => ({ ...p, [key]: '', general: '' }))
    } catch (err) {
      setErrors((p) => ({ ...p, [key]: err.message }))
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.link.trim()) {
      setErrors((p) => ({ ...p, general: '포트폴리오 링크를 입력하세요.' }))
      return
    }
    if (!form.title.trim()) {
      setErrors((p) => ({ ...p, general: '제목을 입력하세요.' }))
      return
    }
    setSaving(true)
    setErrors((p) => ({ ...p, general: '' }))
    try {
      await upsertPortfolio(user.id, user.name, {
        title: form.title.trim(),
        summary: '',
        link: form.link.trim(),
        resume: form.resume || undefined,
      })
      navigate(`/portfolio/${user.id}`, { replace: true })
    } catch (err) {
      setErrors((p) => ({ ...p, general: err?.message || '저장에 실패했습니다.' }))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader
        title={existing ? '포트폴리오 수정' : '포트폴리오 등록'}
        description="이력서 PDF와 포트폴리오 링크를 제출합니다. 저장 후 언제든 다시 수정할 수 있습니다."
      />

      <form onSubmit={submit}>
        <Card title="기본 정보" subtitle="제목은 목록에 표시됩니다.">
          <div className="form-field">
            <label>제목</label>
            <input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              required
            />
          </div>
        </Card>

        <div style={{ height: 16 }} />

        <Card
          title="이력서 제출"
          subtitle="포트폴리오 링크는 필수입니다. 이력서 PDF는 선택입니다."
        >
          <FileField
            label="이력서 PDF"
            description="학력, 경력, 자격사항이 포함된 이력서"
            file={form.resume}
            onChange={handleFile('resume')}
            onRemove={() => setForm((p) => ({ ...p, resume: null }))}
            error={errors.resume}
          />

          <div className="form-field">
            <label>포트폴리오 링크</label>
            <input
              value={form.link}
              onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))}
              placeholder="https://..."
              required
            />
          </div>

          {errors.general && <div className="file-error">{errors.general}</div>}
        </Card>

        <div className="form-actions">
          <Button variant="ghost" type="button" onClick={() => navigate(-1)}>
            취소
          </Button>
          <Button type="submit" disabled={saving || !form.link.trim()}>
            {saving ? '저장 중…' : '저장'}
          </Button>
        </div>
      </form>
    </>
  )
}
