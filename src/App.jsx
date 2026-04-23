import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout.jsx'
import RoleGate from './components/auth/RoleGate.jsx'
import { useAuth } from './context/AuthContext.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import SchedulePage from './pages/SchedulePage.jsx'
import JobsPage from './pages/JobsPage.jsx'
import JobDetailPage from './pages/JobDetailPage.jsx'
import JobWritePage from './pages/JobWritePage.jsx'
import MealsPage from './pages/MealsPage.jsx'
import PortfolioListPage from './pages/PortfolioListPage.jsx'
import PortfolioDetailPage from './pages/PortfolioDetailPage.jsx'
import PortfolioEditPage from './pages/PortfolioEditPage.jsx'
import RulesPage from './pages/RulesPage.jsx'
import PenaltiesPage from './pages/PenaltiesPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import ForbiddenPage from './pages/ForbiddenPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import './App.css'
import './components/common/ui.css'

export default function App() {
  const { booting } = useAuth()

  if (booting) {
    return (
      <div className="login-page">
        <div className="login-card">
          <p style={{ color: 'var(--text-muted)' }}>불러오는 중…</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <RoleGate allow={['student', 'teacher', 'admin']}>
            <AppLayout />
          </RoleGate>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="schedule" element={<SchedulePage />} />

        <Route path="jobs" element={<JobsPage />} />
        <Route path="jobs/new" element={<JobWritePage />} />
        <Route path="jobs/:id" element={<JobDetailPage />} />

        <Route path="meals" element={<MealsPage />} />

        <Route path="portfolio" element={<PortfolioListPage />} />
        <Route path="portfolio/:ownerId" element={<PortfolioDetailPage />} />
        <Route path="portfolio/:ownerId/edit" element={<PortfolioEditPage />} />

        <Route path="rules" element={<RulesPage />} />
        <Route path="penalties" element={<PenaltiesPage />} />

        <Route
          path="admin"
          element={
            <RoleGate allow={['teacher', 'admin']}>
              <AdminPage />
            </RoleGate>
          }
        />

        <Route path="forbidden" element={<ForbiddenPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
