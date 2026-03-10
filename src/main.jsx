import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { globalCss } from './lib/theme'

import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import StandingsPage from './pages/StandingsPage'
import LeaderboardPage from './pages/LeaderboardPage'
import UpcomingPage from './pages/UpcomingPage'
import SummaryPage from './pages/SummaryPage'

import AdminSetupPage from './pages/admin/AdminSetupPage'
import AdminVenuesPage from './pages/admin/AdminVenuesPage'
import AdminPlayersPage from './pages/admin/AdminPlayersPage'
import AdminFixturesPage from './pages/admin/AdminFixturesPage'
import AdminResultsPage from './pages/admin/AdminResultsPage'

// Inject global styles
const style = document.createElement('style')
style.textContent = globalCss
document.head.appendChild(style)

const AdminWrap = ({ children }) => (
  <ProtectedRoute>{children}</ProtectedRoute>
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/standings" element={<StandingsPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/upcoming" element={<UpcomingPage />} />
            <Route path="/summary" element={<SummaryPage />} />
            <Route path="/admin" element={<Navigate to="/admin/setup" replace />} />
            <Route path="/admin/setup" element={<AdminWrap><AdminSetupPage /></AdminWrap>} />
            <Route path="/admin/venues" element={<AdminWrap><AdminVenuesPage /></AdminWrap>} />
            <Route path="/admin/players" element={<AdminWrap><AdminPlayersPage /></AdminWrap>} />
            <Route path="/admin/fixtures" element={<AdminWrap><AdminFixturesPage /></AdminWrap>} />
            <Route path="/admin/results" element={<AdminWrap><AdminResultsPage /></AdminWrap>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
)
