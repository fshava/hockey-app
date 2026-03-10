import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const PUBLIC_TABS = [
  { path: '/',            label: '📅 Upcoming Fixtures' },
  { path: '/standings',   label: '🏆 Standings' },
  { path: '/leaderboard', label: '🥾 Top Scorers' },
  { path: '/summary',     label: '📋 Full Summary' },
]

export default function PublicLayout({ data }) {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()

  return (
    <div className="pitch-bg">
      {/* Header */}
      <div className="app-header">
        <span className="stick-icon">🏑</span>
        <div>
          <div className="sub">School Hockey</div>
          <h1>Fixtures Manager</h1>
        </div>
        <div style={{ marginLeft:'auto' }}>
          {user
            ? <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin')}>Admin Panel →</button>
            : <button className="btn btn-ghost btn-sm" onClick={() => navigate('/login')}>Admin Login</button>
          }
        </div>
      </div>

      {/* Nav */}
      <div className="nav-bar">
        {PUBLIC_TABS.map(t => (
          <button key={t.path} className={`nav-btn ${location.pathname === t.path ? 'active' : ''}`} onClick={() => navigate(t.path)}>
            {t.label}
          </button>
        ))}
      </div>

      <Outlet context={data} />
    </div>
  )
}
