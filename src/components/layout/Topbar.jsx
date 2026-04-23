import { useAuth } from '../../context/AuthContext.jsx'
import Icon from '../common/Icon.jsx'

export default function Topbar() {
  const { logout } = useAuth()

  return (
    <header className="topbar">
      <div className="topbar-actions">
        <button type="button" className="topbar-logout" onClick={logout}>
          <Icon name="logOut" size={15} />
          로그아웃
        </button>
      </div>
    </header>
  )
}
