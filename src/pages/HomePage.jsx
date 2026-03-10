import { Link } from 'react-router-dom'
import { useData } from '../hooks/useData'
import { computeStandings, computeTopScorers } from '../lib/hockey'
import { G } from '../lib/theme'
import { useMemo } from 'react'

export default function HomePage() {
  const { fixtures, scorers, teams, loading } = useData()

  const firstFixtures = useMemo(() => fixtures.filter(f => f.class === 'first'), [fixtures])
  const secondFixtures = useMemo(() => fixtures.filter(f => f.class === 'second'), [fixtures])

  const today = new Date().toISOString().split('T')[0]
  const upcoming = useMemo(() =>
    fixtures.filter(f => f.match_date && f.match_date >= today && f.home_goals == null)
      .sort((a, b) => a.match_date.localeCompare(b.match_date))
      .slice(0, 5),
    [fixtures, today])

  const recent = useMemo(() =>
    fixtures.filter(f => f.home_goals != null)
      .sort((a, b) => b.match_date?.localeCompare(a.match_date || '') || 0)
      .slice(0, 5),
    [fixtures])

  const firstStandings = useMemo(() => computeStandings(firstFixtures, scorers), [firstFixtures, scorers])
  const secondStandings = useMemo(() => computeStandings(secondFixtures, scorers), [secondFixtures, scorers])
  const firstTopScorers = useMemo(() => computeTopScorers(firstFixtures, scorers).slice(0, 3), [firstFixtures, scorers])
  const secondTopScorers = useMemo(() => computeTopScorers(secondFixtures, scorers).slice(0, 3), [secondFixtures, scorers])

  if (loading) return <div className="spinner" />

  const quickLinks = [
    { to: '/standings', icon: '🏆', label: 'Standings', sub: 'League tables' },
    { to: '/leaderboard', icon: '🥾', label: 'Leaderboard', sub: 'Top scorers' },
    { to: '/upcoming', icon: '📅', label: 'Upcoming', sub: 'Fixtures schedule' },
    { to: '/summary', icon: '📋', label: 'Summary', sub: 'All results' },
  ]

  return (
    <div className="page">
      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {quickLinks.map(l => (
          <Link key={l.to} to={l.to} style={{ textDecoration: 'none' }}>
            <div style={{
              background: G.pitchLight, borderRadius: 8, padding: '16px 12px', textAlign: 'center',
              border: `1px solid rgba(255,255,255,0.07)`, transition: 'transform 0.15s',
              cursor: 'pointer',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = ''}
            >
              <div style={{ fontSize: '1.8rem', marginBottom: 6 }}>{l.icon}</div>
              <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '1rem', color: G.white, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l.label}</div>
              <div style={{ fontSize: '0.74rem', color: G.muted, marginTop: 2 }}>{l.sub}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid2" style={{ gap: 20, alignItems: 'start' }}>
        {/* Left column */}
        <div>
          {/* Mini standings */}
          {[{ standings: firstStandings, label: '1st Class', color: G.lime }, { standings: secondStandings, label: '2nd Class', color: G.sky }].map(({ standings, label, color }) => (
            standings.length > 0 && (
              <div key={label} style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '1rem', color, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                  🏆 {label} — Top 5
                </div>
                <div style={{ background: G.pitchLight, borderRadius: 8, overflow: 'hidden' }}>
                  <table className="league-table">
                    <thead>
                      <tr>
                        <th style={{ color }}>#</th>
                        <th className="left" style={{ color }}>Team</th>
                        <th>P</th><th>W</th><th>D</th><th>L</th>
                        <th style={{ color }}>Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.slice(0, 5).map((row, idx) => (
                        <tr key={row.name}>
                          <td style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, color: idx === 0 ? '#ffd700' : idx === 1 ? '#c0c0c0' : idx === 2 ? '#cd7f32' : G.white }}>{idx + 1}</td>
                          <td className="left">{row.name}</td>
                          <td style={{ color: G.muted }}>{row.P}</td>
                          <td style={{ color: G.lime }}>{row.W}</td>
                          <td style={{ color: G.muted }}>{row.D}</td>
                          <td style={{ color: G.danger }}>{row.L}</td>
                          <td style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, color }}>{row.Pts}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ textAlign: 'right', marginTop: 4 }}>
                  <Link to="/standings" style={{ color: G.lime, fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}>Full table →</Link>
                </div>
              </div>
            )
          ))}
        </div>

        {/* Right column */}
        <div>
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '1rem', color: G.lime, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                📅 Next Fixtures
              </div>
              {upcoming.map(f => (
                <div key={f.id} style={{ background: G.pitchLight, borderRadius: 6, padding: '10px 14px', marginBottom: 6, borderLeft: `3px solid ${f.class === 'first' ? G.lime : G.sky}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: 700, color: G.white, fontSize: '0.88rem' }}>{f.home_team}</span>
                      <span style={{ color: G.muted, margin: '0 6px', fontWeight: 700 }}>vs</span>
                      <span style={{ fontWeight: 700, color: G.white, fontSize: '0.88rem' }}>{f.away_team}</span>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.75rem', color: G.muted }}>
                      <div>{f.match_date ? new Date(f.match_date + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'}</div>
                      {f.match_time && <div>{f.match_time.slice(0, 5)}</div>}
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ textAlign: 'right', marginTop: 4 }}>
                <Link to="/upcoming" style={{ color: G.lime, fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}>All fixtures →</Link>
              </div>
            </div>
          )}

          {/* Recent results */}
          {recent.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '1rem', color: G.lime, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                ✅ Recent Results
              </div>
              {recent.map(f => (
                <div key={f.id} style={{ background: G.pitchLight, borderRadius: 6, padding: '10px 14px', marginBottom: 6, borderLeft: `3px solid ${f.class === 'first' ? G.lime : G.sky}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: G.white, fontSize: '0.88rem' }}>{f.home_team}</span>
                    <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '1.2rem', color: G.white, padding: '0 12px' }}>
                      {f.home_goals} – {f.away_goals}
                    </span>
                    <span style={{ fontWeight: 700, color: G.white, fontSize: '0.88rem' }}>{f.away_team}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Top scorers mini */}
          {(firstTopScorers.length > 0 || secondTopScorers.length > 0) && (
            <div>
              <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '1rem', color: G.lime, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                🥾 Top Scorers
              </div>
              {[{ list: firstTopScorers, label: '1st', color: G.lime }, { list: secondTopScorers, label: '2nd', color: G.sky }].map(({ list, label, color }) =>
                list.length > 0 && (
                  <div key={label} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>{label} Class</div>
                    {list.map((s, i) => (
                      <div key={s.playerName} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ color: i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : '#cd7f32', fontWeight: 800, fontFamily: "'Barlow Condensed'", width: 18 }}>{i + 1}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, color: G.white, fontSize: '0.85rem' }}>{s.playerName}</div>
                          <div style={{ fontSize: '0.72rem', color: G.muted }}>{s.team}</div>
                        </div>
                        <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '1.2rem', color: i === 0 ? '#ffd700' : color }}>{s.goals}</span>
                      </div>
                    ))}
                  </div>
                )
              )}
              <div style={{ textAlign: 'right', marginTop: 4 }}>
                <Link to="/leaderboard" style={{ color: G.lime, fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}>Full leaderboard →</Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {fixtures.length === 0 && !loading && (
        <div className="alert alert-info" style={{ textAlign: 'center', marginTop: 20 }}>
          No fixtures yet. An admin needs to set up teams and generate fixtures.
        </div>
      )}
    </div>
  )
}
