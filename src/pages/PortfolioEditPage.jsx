import { useState } from 'react'
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
              <div className="file-drop-sub">파일을 선택하면 자동으로 업로드됩니다.</div>
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

  // 본인 포트폴리오만 수정 가능
  if (ownerId !== user.id) return <Navigate to="/forbidden" replace />

  const existing = portfolios.find((p) => p.ownerId === user.id)
  const [form, setForm] = useState({
    resume: existing?.resume || null,
    portfolio: existing?.portfolio || null,
  })
  const [errors, setErrors] = useState({ resume: '', portfolio: '', general: '' })

  const handleFile = (key) => async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // 같은 파일 재선택 가능하도록 초기화
    if (!file) return
    try {
      const payload = await readPdfAsDataUrl(file)
      setForm((p) => ({ ...p, [key]: payload }))
      setErrors((p) => ({ ...p, [key]: '', general: '' }))
    } catch (err) {
      setErrors((p) => ({ ...p, [key]: err.message }))
    }
  }

  const submit = (e) => {
    e.preventDefault()
    if (!form.resume && !form.portfolio) {
      setErrors((p) => ({
        ...p,
        general: '이력서 또는 포트폴리오 중 최소 1개는 업로드해야 합니다.',
      }))
      return
    }
    upsertPortfolio(user.id, user.name, {
      title: existing?.title || `${user.name} 포트폴리오`,
      resume: form.resume || undefined,
      portfolio: form.portfolio || undefined,
    })
    navigate(`/portfolio/${user.id}`, { replace: true })
  }

  return (
    <>
      <PageHeader
        title={existing ? '포트폴리오 수정' : '포트폴리오 등록'}
        description="이력서 또는 포트폴리오 PDF 파일을 업로드하세요. 둘 다 올려도 좋아요."
      />

      <form onSubmit={submit}>
        <Card
          title="서류 업로드"
          subtitle="최소 1개의 PDF 파일을 업로드해야 저장할 수 있어요."
        >
          <FileField
            label="이력서 PDF"
            description="학력, 경력, 자격사항이 포함된 이력서"
            file={form.resume}
            onChange={handleFile('resume')}
            onRemove={() => setForm((p) => ({ ...p, resume: null }))}
            error={errors.resume}
          />

          <FileField
            label="포트폴리오 PDF"
            description="프로젝트/작업물 모음 포트폴리오"
            file={form.portfolio}
            onChange={handleFile('portfolio')}
            onRemove={() => setForm((p) => ({ ...p, portfolio: null }))}
            error={errors.portfolio}
          />

          {errors.general && <div className="file-error">{errors.general}</div>}
        </Card>

        <div className="form-actions">
          <Button variant="ghost" type="button" onClick={() => navigate(-1)}>취소</Button>
          <Button type="submit" disabled={!form.resume && !form.portfolio}>
            저장
          </Button>
        </div>
      </form>
    </>
  )
}
