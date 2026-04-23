import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import Icon from '../common/Icon.jsx'

const commonNav = [
  { to: '/', label: '대시보드', icon: 'home', end: true },
  { to: '/schedule', label: '학사 일정', icon: 'calendar' },
  { to: '/meals', label: '급식', icon: 'meal' },
  { to: '/rules', label: '학급 규칙', icon: 'book' },
  { to: '/penalties', label: '이번 주 패널티', icon: 'alert' },
  { to: '/jobs', label: '취업 정보', icon: 'briefcase' },
  { to: '/portfolio', label: '포트폴리오', icon: 'folder' },
]

const teacherNav = [{ to: '/admin', label: '관리자', icon: 'settings' }]

export default function Sidebar() {
  const { isTeacher, user } = useAuth()
  const nav = [...commonNav, ...(isTeacher ? teacherNav : [])]

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-logo">3-2</span>
        <div>
          <div className="sidebar-title">3학년 2반</div>
          <div className="sidebar-sub">학급 운영 워크스페이스</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `sidebar-link${isActive ? ' is-active' : ''}`
            }
          >
            <span className="sidebar-icon">
              <Icon name={item.icon} size={18} />
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {user && (
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{user.name.slice(0, 1)}</div>
            <div>
              <div className="sidebar-user-name">{user.name}</div>
              <div className="sidebar-user-role">
                {user.role === 'admin'
                  ? '시스템 관리자'
                  : user.role === 'teacher'
                    ? '교사'
                    : `학생 · ${user.studentNo ?? ''}${user.canPostJobs ? ' · 반 대표' : ''}`}
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
