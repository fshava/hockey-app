import { Link } from 'react-router-dom'
import { useData } from '../hooks/useData'
import { computeStandings, computeTopScorers } from '../lib/hockey'
import { G } from '../lib/theme'
import { useMemo } from 'react'

export default function HomePage() {
  const { leagues, fixtures, scorers, loading } = useData()

  const today = new Date().toISOString().split('T')[0]

  const upcoming = useMemo(() =>
    fixtures.filter(f => f.match_date && f.match_date >= today && f.home_goals == null)
      .sort((a, b) => a.match_date.localeCompare(b.match_date))
      .slice(0, 5),
    [fixtures, today])

  const recent = useMemo(() =>
    fixtures.filter(f => f.home_goals != null)
      .sort((a, b) => (b.match_date || '').localeCompare(a.match_date || ''))
      .slice(0, 5),
    [fixtures])

  // ── Match of the Day: highest combined goals in recent results ──
  const motd = useMemo(() => {
    const played = fixtures.filter(f => f.home_goals != null && f.away_goals != null)
    if (!played.length) return null
    const best = played.reduce((a, b) =>
      (a.home_goals + a.away_goals) >= (b.home_goals + b.away_goals) ? a : b
    )
    const lg = leagues.find(l => l.id === best.league_id)
    const fScorers = scorers.filter(s => s.fixture_id === best.id && !s.own_goal)
    return { ...best, league: lg, scorers: fScorers }
  }, [fixtures, scorers, leagues])

  // Per-league mini-standings + top scorers
  const leagueData = useMemo(() =>
    leagues.map(lg => {
      const lf = fixtures.filter(f => f.league_id === lg.id)
      return {
        league: lg,
        standings:  computeStandings(lf, scorers).slice(0, 5),
        topScorers: computeTopScorers(lf, scorers).slice(0, 3),
      }
    }),
    [leagues, fixtures, scorers])

  if (loading) return <div className="spinner" />

  const quickLinks = [
    { to: '/standings', icon: '🏆', label: 'Standings' },
    { to: '/leaderboard', icon: '🥾', label: 'Scorers' },
    { to: '/upcoming', icon: '📅', label: 'Upcoming' },
    { to: '/summary', icon: '📋', label: 'Summary' },
  ]

  return (
    <div className="page">
      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
        {quickLinks.map(l => (
          <Link key={l.to} to={l.to} style={{ textDecoration: 'none' }}>
            <div style={{
              background: G.pitchLight, borderRadius: 8, padding: '14px 8px', textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.07)', transition: 'transform 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = ''}
            >
              <div style={{ fontSize: '1.6rem', marginBottom: 4 }}>{l.icon}</div>
              <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '0.9rem', color: G.white, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{l.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── MATCH OF THE DAY ── */}
      {motd && (
        <div style={{
          background: `linear-gradient(135deg, ${G.pitchLight} 0%, rgba(0,0,0,0.4) 100%)`,
          borderRadius: 10, padding: '18px 20px', marginBottom: 24,
          border: `1px solid ${motd.league?.color || G.lime}55`,
          boxShadow: `0 0 30px ${motd.league?.color || G.lime}22`,
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Background glow */}
          <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: `${motd.league?.color || G.lime}15`, pointerEvents: 'none' }} />

          <div style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: motd.league?.color || G.lime, marginBottom: 8 }}>
            ⭐ Match of the Day · {motd.league?.name || 'League'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 12, marginBottom: motd.scorers.length > 0 ? 10 : 0 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '1.3rem', color: G.white }}>{motd.home_team}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '2.4rem', color: G.white,
                background: 'rgba(0,0,0,0.35)', borderRadius: 8, padding: '4px 18px',
                border: `2px solid ${motd.league?.color || G.lime}66`,
              }}>
                {motd.home_goals} – {motd.away_goals}
              </div>
              <div style={{ fontSize: '0.7rem', color: G.muted, marginTop: 3 }}>
                {motd.home_goals + motd.away_goals} goals · Rd {motd.round}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '1.3rem', color: G.white }}>{motd.away_team}</div>
            </div>
          </div>
          {motd.scorers.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 8 }}>
              {[motd.home_team, motd.away_team].map(team => {
                const ts = motd.scorers.filter(s => s.team_name === team)
                if (!ts.length) return null
                return (
                  <span key={team} style={{ fontSize: '0.78rem', color: G.muted }}>
                    ⚽ <span style={{ color: G.white }}>{ts.map(s => `${s.player_name}${s.goals>1?` (${s.goals})`:''}`).join(', ')}</span>
                    <span style={{ marginLeft: 4 }}>({team})</span>
                  </span>
                )
              })}
            </div>
          )}
        </div>
      )}

      <div className="grid2" style={{ gap: 20, alignItems: 'start' }}>
        {/* Left — standings */}
        <div>
          {leagueData.map(({ league, standings }) =>
            standings.length > 0 && (
              <div key={league.id} style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '1rem', color: league.color, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                  🏆 {league.name} — Top 5
                </div>
                <div className="league-table-wrap" style={{ background: G.pitchLight, borderRadius: 8 }}>
                  <table className="league-table">
                    <thead>
                      <tr>
                        <th style={{ color: league.color }}>#</th>
                        <th className="left" style={{ color: league.color }}>Team</th>
                        <th>P</th><th>W</th><th className="hide-mobile">D</th><th className="hide-mobile">L</th>
                        <th style={{ color: league.color }}>Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.map((row, idx) => (
                        <tr key={row.name}>
                          <td style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, color: idx===0?'#ffd700':idx===1?'#c0c0c0':idx===2?'#cd7f32':G.white }}>{idx+1}</td>
                          <td className="left">{row.name}</td>
                          <td style={{ color: G.muted }}>{row.P}</td>
                          <td style={{ color: G.lime }}>{row.W}</td>
                          <td className="hide-mobile" style={{ color: G.muted }}>{row.D}</td>
                          <td className="hide-mobile" style={{ color: G.danger }}>{row.L}</td>
                          <td style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, color: league.color }}>{row.Pts}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ textAlign: 'right', marginTop: 4 }}>
                  <Link to="/standings" style={{ color: league.color, fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}>Full table →</Link>
                </div>
              </div>
            )
          )}
        </div>

        {/* Right — upcoming + recent + top scorers */}
        <div>
          {upcoming.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '1rem', color: G.lime, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>📅 Next Up</div>
              {upcoming.map(f => {
                const lg = leagues.find(l => l.id === f.league_id)
                return (
                  <div key={f.id} style={{ background: G.pitchLight, borderRadius: 6, padding: '10px 14px', marginBottom: 6, borderLeft: `3px solid ${lg?.color || G.muted}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: G.white, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.home_team} vs {f.away_team}</div>
                        {lg && <div style={{ fontSize: '0.68rem', color: lg.color, fontWeight: 700 }}>{lg.name}</div>}
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '0.75rem', color: G.muted, flexShrink: 0 }}>
                        <div>{f.match_date ? new Date(f.match_date+'T00:00:00').toLocaleDateString('en-GB',{day:'2-digit',month:'short'}) : '—'}</div>
                        {f.match_time && <div>{f.match_time.slice(0,5)}</div>}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div style={{ textAlign: 'right', marginTop: 4 }}>
                <Link to="/upcoming" style={{ color: G.lime, fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}>All →</Link>
              </div>
            </div>
          )}

          {recent.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '1rem', color: G.lime, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>✅ Recent</div>
              {recent.map(f => {
                const lg = leagues.find(l => l.id === f.league_id)
                return (
                  <div key={f.id} style={{ background: G.pitchLight, borderRadius: 6, padding: '10px 14px', marginBottom: 6, borderLeft: `3px solid ${lg?.color || G.muted}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontWeight: 700, color: G.white, fontSize: '0.82rem', flex: 1, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.home_team}</span>
                      <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '1.15rem', color: G.white, padding: '0 8px', flexShrink: 0 }}>{f.home_goals}–{f.away_goals}</span>
                      <span style={{ fontWeight: 700, color: G.white, fontSize: '0.82rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.away_team}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Top scorers per league */}
          {leagueData.some(d => d.topScorers.length > 0) && (
            <div>
              <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '1rem', color: G.lime, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>🥾 Top Scorers</div>
              {leagueData.map(({ league, topScorers }) =>
                topScorers.length > 0 && (
                  <div key={league.id} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: league.color, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>{league.name}</div>
                    {topScorers.map((s, i) => (
                      <div key={s.playerName} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ color: i===0?'#ffd700':i===1?'#c0c0c0':'#cd7f32', fontWeight: 800, fontFamily: "'Barlow Condensed'", width: 16 }}>{i+1}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, color: G.white, fontSize: '0.83rem' }}>{s.playerName}</div>
                          <div style={{ fontSize: '0.7rem', color: G.muted }}>{s.team}</div>
                        </div>
                        <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '1.15rem', color: i===0?'#ffd700':league.color }}>{s.goals}</span>
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
          No fixtures yet. An admin needs to set up leagues, teams and generate fixtures.
        </div>
      )}
    </div>
  )
}
