import { useMemo, useState } from 'react'
import { useData } from '../hooks/useData'
import { computeStandings } from '../lib/hockey'
import { G } from '../lib/theme'
import TeamPDFButton from '../components/TeamPDFButton'

export default function SummaryPage() {
  const { fixtures, venues, scorers, teams, loading } = useData()
  const [cls, setCls] = useState('first')
  const [selectedTeam, setSelectedTeam] = useState('')

  const clsFixturesForStandings = useMemo(() => fixtures.filter(f => f.class === cls), [fixtures, cls])
  const standings = useMemo(() => computeStandings(clsFixturesForStandings, scorers), [clsFixturesForStandings, scorers])

  const clsFixtures = useMemo(() => fixtures.filter(f => f.class === cls), [fixtures, cls])
  const clsTeams    = useMemo(() => teams.filter(t => t.class === cls).sort((a,b) => a.name.localeCompare(b.name)), [teams, cls])
  const played      = clsFixtures.filter(f => f.home_goals != null).length
  const color       = cls === 'first' ? G.lime : G.sky

  // When class changes, reset team selection
  const handleClsChange = (c) => { setCls(c); setSelectedTeam('') }

  if (loading) return <div className="spinner" />

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <div className="section-title">📋 Results Summary</div>
          <div className="section-sub">All fixtures and results</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className={`class-tab first ${cls === 'first' ? 'sel' : ''}`} onClick={() => handleClsChange('first')}>1st Class</span>
          <span className={`class-tab second ${cls === 'second' ? 'sel' : ''}`} onClick={() => handleClsChange('second')}>2nd Class</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid3" style={{ marginBottom: 20 }}>
        {[
          ['Total Matches', clsFixtures.length, color],
          ['Played', played, played === clsFixtures.length && clsFixtures.length > 0 ? G.lime : G.warn],
          ['Remaining', clsFixtures.length - played, clsFixtures.length - played === 0 ? G.lime : G.muted],
        ].map(([lbl, num, c]) => (
          <div className="stat-box" key={lbl}>
            <div className="stat-num" style={{ color: c }}>{num}</div>
            <div className="stat-lbl">{lbl}</div>
          </div>
        ))}
      </div>

      {/* ── Team PDF Export ── */}
      {clsTeams.length > 0 && (
        <div className="pdf-export-bar" style={{
          background: G.pitchLight, borderRadius: 8, padding: '14px 18px',
          marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
          borderLeft: `3px solid ${color}`,
        }}>
          <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: '0.88rem', color: G.white, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
            ⬇ Download Team Report
          </span>
          <select
            value={selectedTeam}
            onChange={e => setSelectedTeam(e.target.value)}
            style={{ flex: 1, minWidth: 180, maxWidth: 280, background: 'rgba(0,0,0,0.25)', border: `1.5px solid ${color}44`, color: G.white, fontSize: '0.88rem', padding: '7px 10px', borderRadius: 5 }}
          >
            <option value="">— Select a team —</option>
            {clsTeams.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
          </select>
          {selectedTeam && (
            <TeamPDFButton teamName={selectedTeam} cls={cls} standings={standings} />
          )}
          {selectedTeam && (
            <span style={{ fontSize: '0.75rem', color: G.muted }}>
              Includes fixtures, results & standings for {selectedTeam}
            </span>
          )}
        </div>
      )}

      {clsFixtures.length === 0 ? (
        <div className="alert alert-info">No fixtures for this class yet.</div>
      ) : (
        Array.from(new Set(clsFixtures.map(f => f.round))).map(round => {
          const roundFixtures = clsFixtures.filter(f => f.round === round)
          return (
            <div key={round} style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '1rem', color, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8, borderBottom: `1px solid ${color}33`, paddingBottom: 4 }}>
                Round {round}
              </div>
              {roundFixtures.map(f => {
                const venue    = venues.find(v => v.id === f.venue_id)
                const fScorers = scorers.filter(s => s.fixture_id === f.id && !s.own_goal)
                const wasPlayed = f.home_goals != null
                return (
                  <div key={f.id} style={{
                    background: G.pitchLight, borderRadius: 6, padding: '12px 16px', marginBottom: 6,
                    borderLeft: `3px solid ${wasPlayed ? color : 'rgba(255,255,255,0.1)'}`,
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center', marginBottom: fScorers.length > 0 ? 8 : 0 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, color: G.white }}>{f.home_team}</div>
                        {venue && <div style={{ fontSize: '0.72rem', color: G.muted }}>{venue.name}</div>}
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        {wasPlayed ? (
                          <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '1.5rem', color: G.white, padding: '2px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: 5 }}>
                            {f.home_goals} – {f.away_goals}
                          </span>
                        ) : (
                          <div>
                            <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, color: G.muted, fontSize: '0.9rem' }}>VS</div>
                            {f.match_date && <div style={{ fontSize: '0.72rem', color: G.muted }}>
                              {new Date(f.match_date + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                              {f.match_time ? ' · ' + f.match_time.slice(0, 5) : ''}
                            </div>}
                          </div>
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: G.white }}>{f.away_team}</div>
                      </div>
                    </div>
                    {fScorers.length > 0 && (
                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 8 }}>
                        {[f.home_team, f.away_team].map(team => {
                          const ts = fScorers.filter(s => s.team_name === team)
                          if (!ts.length) return null
                          return (
                            <div key={team} style={{ fontSize: '0.78rem' }}>
                              <span style={{ color: G.muted, marginRight: 5 }}>⚽</span>
                              {ts.map(s => `${s.player_name}${s.goals > 1 ? ` (${s.goals})` : ''}`).join(', ')}
                              <span style={{ color: G.muted, marginLeft: 5, fontSize: '0.7rem' }}>{team}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })
      )}
    </div>
  )
}
