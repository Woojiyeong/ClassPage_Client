import { useState } from 'react'
import PageHeader from '../components/common/PageHeader.jsx'
import Card from '../components/common/Card.jsx'
import Button from '../components/common/Button.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useData } from '../context/DataContext.jsx'

export default function RulesPage() {
  const { isTeacher } = useAuth()
  const { rules, addRule, removeRule } = useData()
  const [draft, setDraft] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!draft.trim()) return
    try {
      await addRule(draft.trim())
      setDraft('')
    } catch (err) {
      window.alert(err?.message || '추가에 실패했습니다.')
    }
  }

  return (
    <>
      <PageHeader
        title="학급 규칙"
        description={
          isTeacher
            ? '학급 규칙을 관리할 수 있습니다. 추가/삭제 시 즉시 반영됩니다.'
            : '우리 반의 약속입니다. 언제든 이 페이지에서 확인할 수 있어요.'
        }
      />

      <Card title="전체 규칙" subtitle={`총 ${rules.length}개`}>
        {rules.length === 0 ? (
          <EmptyState title="등록된 규칙이 없습니다" />
        ) : (
          <ol className="rule-list big">
            {rules.map((r) => (
              <li key={r.id}>
                <span className="rule-number">{r.order}</span>
                <span style={{ flex: 1 }}>{r.text}</span>
                {isTeacher && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      try {
                        await removeRule(r.id)
                      } catch (err) {
                        window.alert(err?.message || '삭제에 실패했습니다.')
                      }
                    }}
                  >
                    삭제
                  </Button>
                )}
              </li>
            ))}
          </ol>
        )}
      </Card>

      {isTeacher && (
        <>
          <div style={{ height: 18 }} />
          <Card title="규칙 추가">
            <form onSubmit={submit}>
              <div className="form-field">
                <label>규칙 내용</label>
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="예) 체육 시간 전에는 실내화를 따로 보관한다."
                />
              </div>
              <div className="form-actions">
                <Button type="submit">추가</Button>
              </div>
            </form>
          </Card>
        </>
      )}
    </>
  )
}
