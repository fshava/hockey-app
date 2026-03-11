import { Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const ADMIN_TABS = [
  { path: '/admin/setup',    label: '⚙ Setup' },
  { path: '/admin/venues',   label: '🏟 Venues' },
  { path: '/admin/players',  label: '👤 Players' },
  { path: '/admin/fixtures', label: '📅 Fixtures' },
  { path: '/admin/results',  label: '🏑 Results' },
]

const PUBLIC_TABS = [
  { path: '/',                label: '📅 Upcoming' },
  { path: '/standings',       label: '🏆 Standings' },
  { path: '/leaderboard',     label: '🥾 Scorers' },
  { path: '/summary',         label: '📋 Summary' },
]

export default function AdminLayout({ data }) {
  const { user, loading, signOut } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()

  if (loading) return <div className="pitch-bg loading-full"><span className="spinner" /></div>
  if (!user)   return <Navigate to="/login" replace />

  const handleSignOut = async () => { await signOut(); navigate('/') }

  return (
    <div className="pitch-bg">
      {/* Header */}
      <div className="app-header">
        <span className="stick-icon">🏑</span>
        <div>
          <div className="sub">Admin Panel</div>
          <h1>Hockey Fixtures</h1>
        </div>
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.8rem' }}>{user.email}</span>
          <button className="btn btn-ghost btn-sm" onClick={handleSignOut}>Sign Out</button>
        </div>
      </div>

      {/* Nav */}
      <div className="nav-bar">
        {ADMIN_TABS.map(t => (
          <button key={t.path} className={`nav-btn ${location.pathname === t.path ? 'active' : ''}`} onClick={() => navigate(t.path)}>
            {t.label}
          </button>
        ))}
        <div className="nav-divider" />
        {PUBLIC_TABS.map(t => (
          <button key={t.path} className={`nav-btn public ${location.pathname === t.path ? 'active' : ''}`} onClick={() => navigate(t.path)}>
            {t.label}
          </button>
        ))}
      </div>

      <Outlet context={data} />
    </div>
  )
}
