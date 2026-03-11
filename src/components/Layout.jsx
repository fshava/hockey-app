import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { G } from '../lib/theme'

const css = `
  .app-header {
    background: linear-gradient(135deg, ${G.pitchLight} 0%, ${G.pitch} 60%);
    border-bottom: 3px solid ${G.lime};
    padding: 14px 24px;
    display: flex; align-items: center; gap: 16px;
    flex-wrap: wrap;
  }
  .app-header h1 {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 800; font-size: 1.8rem; color: ${G.white};
    letter-spacing: 0.04em; text-transform: uppercase;
    text-decoration: none;
  }
  .app-header h1 a { color: inherit; text-decoration: none; }
  .app-header .sub { color: ${G.lime}; font-size: 0.78rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; }
  .header-right { margin-left: auto; display: flex; align-items: center; gap: 12px; }
  .user-pill {
    background: rgba(255,255,255,0.08); border-radius: 20px; padding: 5px 14px;
    font-size: 0.8rem; color: rgba(255,255,255,0.7); font-weight: 600;
  }

  .nav-bar {
    background: ${G.pitchMid};
    display: flex; gap: 2px; padding: 0 24px;
    border-bottom: 2px solid rgba(255,255,255,0.07);
    overflow-x: auto;
  }
  .nav-link {
    background: transparent; border: none; cursor: pointer; text-decoration: none;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.92rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
    color: rgba(255,255,255,0.55); padding: 11px 16px;
    border-bottom: 3px solid transparent; transition: all 0.2s;
    white-space: nowrap; display: inline-block;
  }
  .nav-link:hover { color: ${G.white}; }
  .nav-link.active { color: ${G.lime}; border-bottom-color: ${G.lime}; }
  .nav-link.admin-link { color: rgba(224,123,42,0.7); }
  .nav-link.admin-link:hover { color: ${G.warn}; }
  .nav-link.admin-link.active { color: ${G.warn}; border-bottom-color: ${G.warn}; }
  .nav-sep { width: 1px; background: rgba(255,255,255,0.1); margin: 8px 4px; }
  .nav-label {
    font-size: 0.65rem; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase;
    padding: 4px 10px 0; color: rgba(255,255,255,0.25); align-self: flex-end; padding-bottom: 14px;
  }
`

const PUBLIC_LINKS = [
  { to: '/', label: '🏠 Home' },
  { to: '/standings', label: '🏆 Standings' },
  { to: '/leaderboard', label: '🥾 Leaderboard' },
  { to: '/upcoming', label: '📅 Upcoming' },
  { to: '/summary', label: '📋 Summary' },
]

const ADMIN_LINKS = [
  { to: '/admin/setup', label: '⚙ Setup' },
  { to: '/admin/venues', label: '🏟 Venues' },
  { to: '/admin/players', label: '👤 Players' },
  { to: '/admin/fixtures', label: '📝 Fixtures' },
  { to: '/admin/results', label: '⚽ Results' },
]

export default function Layout({ children }) {
  const { session, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (to) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <>
      <style>{css}</style>
      <div className="pitch-bg" style={{ minHeight: '100vh' }}>
        <div className="app-header">
          <span style={{ fontSize: '2rem' }}>🏑</span>
          <div>
            <div className="sub">School Sport</div>
            <h1><Link to="/">Hockey Fixtures</Link></h1>
          </div>
          <div className="header-right">
            {session ? (
              <>
                <span className="user-pill">👤 {session.user.email}</span>
                <button className="btn btn-ghost btn-sm" onClick={handleSignOut}>Sign Out</button>
              </>
            ) : (
              <Link to="/login" className="btn btn-sm" style={{ background: G.lime, color: G.pitch, fontFamily: "'Barlow Condensed'", fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', textDecoration: 'none', padding: '7px 16px', borderRadius: 5 }}>
                Admin Login
              </Link>
            )}
          </div>
        </div>

        <div className="nav-bar">
          {PUBLIC_LINKS.map(l => (
            <Link key={l.to} to={l.to} className={`nav-link ${isActive(l.to) ? 'active' : ''}`}>{l.label}</Link>
          ))}
          {session && (
            <>
              <div className="nav-sep" />
              <span className="nav-label">Admin</span>
              {ADMIN_LINKS.map(l => (
                <Link key={l.to} to={l.to} className={`nav-link admin-link ${isActive(l.to) ? 'active' : ''}`}>{l.label}</Link>
              ))}
            </>
          )}
        </div>

        {children}
      </div>
    </>
  )
}
