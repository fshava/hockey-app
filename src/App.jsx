import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { useData } from './hooks/useData'

import AdminLayout    from './components/AdminLayout'
import PublicLayout   from './components/PublicLayout'

import LoginPage      from './pages/LoginPage'
import AdminSetup     from './pages/admin/AdminSetup'
import AdminVenues    from './pages/admin/AdminVenues'
import AdminPlayers   from './pages/admin/AdminPlayers'
import AdminFixtures  from './pages/admin/AdminFixtures'
import AdminResults   from './pages/admin/AdminResults'

import PublicUpcoming    from './pages/public/PublicUpcoming'
import PublicStandings   from './pages/public/PublicStandings'
import PublicLeaderboard from './pages/public/PublicLeaderboard'
import PublicSummary     from './pages/public/PublicSummary'

function AppRoutes() {
  const data = useData()

  if (data.loading) {
    return (
      <div className="pitch-bg loading-full">
        <span className="spinner" />
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout data={data} />}>
        <Route path="/"            element={<PublicUpcoming />} />
        <Route path="/standings"   element={<PublicStandings />} />
        <Route path="/leaderboard" element={<PublicLeaderboard />} />
        <Route path="/summary"     element={<PublicSummary />} />
      </Route>

      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />

      {/* Admin routes (protected inside AdminLayout) */}
      <Route path="/admin" element={<AdminLayout data={data} />}>
        <Route index element={<Navigate to="/admin/setup" replace />} />
        <Route path="setup"    element={<AdminSetup />} />
        <Route path="venues"   element={<AdminVenues />} />
        <Route path="players"  element={<AdminPlayers />} />
        <Route path="fixtures" element={<AdminFixtures />} />
        <Route path="results"  element={<AdminResults />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
