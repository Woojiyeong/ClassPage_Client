import { useMemo, useState } from 'react'
import PageHeader from '../components/common/PageHeader.jsx'
import Card from '../components/common/Card.jsx'
import Badge from '../components/common/Badge.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import { useData } from '../context/DataContext.jsx'
import { formatDate, toISO } from '../utils/date.js'

const SECTIONS = [
  { key: 'breakfast', label: '조식', sub: '아침' },
  { key: 'lunch', label: '중식', sub: '점심' },
  { key: 'dinner', label: '석식', sub: '저녁' },
]

function SectionCard({ label, sub, section }) {
  return (
    <Card
      title={label}
      subtitle={sub}
      action={section?.kcal ? <Badge>약 {section.kcal} kcal</Badge> : null}
    >
      {section ? (
        <ul className="meal-dishes">
          {section.dishes.map((dish, i) => (
            <li key={`${dish}-${i}`}>
              <span className="meal-dish-index">{i + 1}</span>
              <span className="meal-dish-name">{dish}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="meal-section-empty">등록된 메뉴가 없습니다</div>
      )}
    </Card>
  )
}

export default function MealsPage() {
  const { meals } = useData()
  const todayIso = toISO(new Date())
  const weekdayLabel = ['일', '월', '화', '수', '목', '금', '토']

  const tabs = useMemo(() => {
    const sorted = [...meals].sort((a, b) => a.date.localeCompare(b.date))
    return sorted.map((m) => {
      const dateObj = new Date(`${m.date}T00:00:00`)
      const day = weekdayLabel[dateObj.getDay()] ?? ''
      return {
        key: m.date,
        label: `${day}요일`,
        date: m.date,
      }
    })
  }, [meals])

  const initialSelected = useMemo(() => {
    if (!tabs.length) return ''
    return tabs.find((t) => t.date >= todayIso)?.key ?? tabs[0].key
  }, [tabs, todayIso])

  const [selected, setSelected] = useState('')
  const selectedKey = selected || initialSelected
  const selectedTab = tabs.find((t) => t.key === selectedKey)
  const selectedMeal = selectedTab
    ? meals.find((m) => m.date === selectedTab.date)
    : undefined

  return (
    <>
      <PageHeader
        title="급식"
        description="이번 주 급식(조식·중식·석식)을 날짜별로 확인해보세요."
      />

      {tabs.length > 0 && (
        <div className="meal-switch" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={selectedKey === tab.key}
              onClick={() => setSelected(tab.key)}
              className={`meal-switch-btn${selectedKey === tab.key ? ' is-active' : ''}`}
            >
              <span className="meal-switch-btn-label">{tab.label}</span>
              <span className="meal-switch-btn-sub">{formatDate(tab.date, true)}</span>
            </button>
          ))}
        </div>
      )}

      {selectedMeal ? (
        <div className="grid grid-3">
          {SECTIONS.map((sec) => (
            <SectionCard
              key={sec.key}
              label={sec.label}
              sub={sec.sub}
              section={selectedMeal[sec.key]}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={
            selectedTab
              ? `${selectedTab.label}은(는) 등록된 급식이 없습니다`
              : '등록된 급식이 없습니다'
          }
        />
      )}
    </>
  )
}
