import { Link, Navigate, useParams } from 'react-router-dom'
import PageHeader from '../components/common/PageHeader.jsx'
import Card from '../components/common/Card.jsx'
import Badge from '../components/common/Badge.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import Icon from '../components/common/Icon.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useData } from '../context/DataContext.jsx'
import { formatDate } from '../utils/date.js'
import { formatBytes } from '../utils/file.js'

function FileCard({ title, file }) {
  if (!file) {
    return (
      <Card title={title}>
        <EmptyState title="등록된 파일이 없습니다" />
      </Card>
    )
  }

  const hasPreview = !!file.dataUrl

  return (
    <Card
      title={title}
      subtitle={`${formatDate(file.uploadedAt)} 업로드`}
      action={
        hasPreview ? (
          <a href={file.dataUrl} download={file.name} className="card-link">
            <Icon name="download" size={14} />
            다운로드
          </a>
        ) : (
          <Badge>샘플</Badge>
        )
      }
    >
      <div className="file-row" style={{ marginBottom: 12 }}>
        <div className="file-icon">
          <Icon name="fileText" size={18} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="file-name">{file.name}</div>
          <div className="file-meta">{formatBytes(file.size)}</div>
        </div>
      </div>

      {hasPreview ? (
        <iframe
          src={file.dataUrl}
          title={file.name}
          className="pdf-preview"
        />
      ) : (
        <div className="pdf-placeholder">
          업로드된 파일 미리보기는 이곳에 표시됩니다.
        </div>
      )}
    </Card>
  )
}

export default function PortfolioDetailPage() {
  const { ownerId } = useParams()
  const { user, isTeacher } = useAuth()
  const { portfolios } = useData()
  const portfolio = portfolios.find((p) => p.ownerId === ownerId)

  // 학생은 본인 것만 열람 가능
  if (!isTeacher && ownerId !== user.id) {
    return <Navigate to="/forbidden" replace />
  }

  if (!portfolio) {
    return (
      <>
        <PageHeader
          title="포트폴리오"
          description="아직 등록되지 않았습니다."
          actions={
            ownerId === user.id && (
              <Link to={`/portfolio/${ownerId}/edit`} className="btn btn-primary">
                포트폴리오 등록
              </Link>
            )
          }
        />
        <EmptyState title="등록된 포트폴리오가 없습니다" />
      </>
    )
  }

  const canEdit = portfolio.ownerId === user.id

  return (
    <>
      <PageHeader
        title={portfolio.title}
        description={`${portfolio.ownerName} · ${formatDate(portfolio.updatedAt)} 수정`}
        actions={
          <>
            <Link to="/portfolio" className="btn btn-ghost">목록</Link>
            {canEdit && (
              <Link to={`/portfolio/${ownerId}/edit`} className="btn btn-primary">수정</Link>
            )}
          </>
        }
      />

      <div className="grid grid-2">
        <FileCard title="이력서" file={portfolio.resume} />
        <FileCard title="포트폴리오" file={portfolio.portfolio} />
      </div>

      {(portfolio.summary || portfolio.legacyContent || portfolio.link) && (
        <div className="grid" style={{ marginTop: 18 }}>
          <Card title="추가 정보">
            {portfolio.summary && (
              <p style={{ marginBottom: 12, color: 'var(--text-muted)' }}>
                {portfolio.summary}
              </p>
            )}
            {portfolio.legacyContent && (
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                {portfolio.legacyContent}
              </div>
            )}
            {portfolio.link && (
              <p style={{ marginTop: 14 }}>
                <a href={portfolio.link} target="_blank" rel="noreferrer" className="card-link">
                  외부 링크 열기
                </a>
              </p>
            )}
          </Card>
        </div>
      )}
    </>
  )
}
