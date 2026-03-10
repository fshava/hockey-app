import { useState, useMemo } from 'react'
import { useData } from '../../hooks/useData'
import { G } from '../../lib/theme'

export default function AdminResultsPage() {
  const { fixtures, scorers, players, teams, venues, updateFixture, upsertScorers, loading } = useData()
  const [cls, setCls] = useState('first')
  const [expanded, setExpanded] = useState(null)
  const [localScorers, setLocalScorers] = useState({})
  const [saving, setSaving] = useState({})

  const clsFixtures = useMemo(() => fixtures.filter(f => f.class === cls), [fixtures, cls])

  const getFixtureScorers = (fid) => localScorers[fid] ?? scorers.filter(s => s.fixture_id === fid).map(s => ({ ...s, id: s.id }))

  const initLocal = (fid) => {
    if (!localScorers[fid]) {
      setLocalScorers(prev => ({ ...prev, [fid]: scorers.filter(s => s.fixture_id === fid).map(s => ({ ...s })) }))
    }
  }

  const toggleExpand = (fid) => {
    if (expanded === fid) { setExpanded(null); return }
    initLocal(fid)
    setExpanded(fid)
  }

  const addScorer = (fid, teamName) => {
    const curr = getFixtureScorers(fid)
    setLocalScorers(prev => ({
      ...prev,
      [fid]: [...curr, { id: `new-${Date.now()}`, fixture_id: fid, player_name: '', team_name: teamName, goals: 1, own_goal: false }]
    }))
  }

  const updateScorer = (fid, sid, field, val) => {
    setLocalScorers(prev => ({
      ...prev,
      [fid]: (prev[fid] || []).map(s => s.id === sid ? { ...s, [field]: val } : s)
    }))
  }

  const removeScorer = (fid, sid) => {
    setLocalScorers(prev => ({ ...prev, [fid]: (prev[fid] || []).filter(s => s.id !== sid) }))
  }

  const handleSaveResult = async (f) => {
    setSaving(prev => ({ ...prev, [f.id]: true }))
    // Save score
    await updateFixture(f.id, { home_goals: f.home_goals, away_goals: f.away_goals })
    // Save scorers
    const sc = getFixtureScorers(f.id).filter(s => s.player_name)
    await upsertScorers(f.id, sc.map(s => ({
      player_name: s.player_name,
      team_name: s.team_name,
      goals: parseInt(s.goals) || 1,
      own_goal: !!s.own_goal,
    })))
    setSaving(prev => ({ ...prev, [f.id]: false }))
    setExpanded(null)
  }

  const handleScoreChange = (fid, field, val) => {
    // Optimistic local update through updateFixture (which does DB + local)
    const parsed = val === '' ? null : parseInt(val)
    updateFixture(fid, { [field]: parsed })
  }

  if (loading) return <div className="spinner" />

  const color = cls === 'first' ? G.lime : G.sky

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <div className="section-title">⚽ Results Entry</div>
          <div className="section-sub">Enter scores and goal scorers</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <span className={`class-tab first ${cls === 'first' ? 'sel' : ''}`} onClick={() => setCls('first')}>1st Class</span>
          <span className={`class-tab second ${cls === 'second' ? 'sel' : ''}`} onClick={() => setCls('second')}>2nd Class</span>
        </div>
      </div>

      {clsFixtures.length === 0 ? (
        <div className="alert alert-warn">No fixtures yet. Generate them in Setup first.</div>
      ) : (
        clsFixtures.map(f => {
          const played = f.home_goals != null && f.away_goals != null
          const isExpanded = expanded === f.id
          const fScorers = getFixtureScorers(f.id)
          const venue = venues.find(v => v.id === f.venue_id)

          return (
            <div key={f.id} style={{ marginBottom: 8 }}>
              {/* Score row */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 56px 28px 56px auto 80px',
                gap: 8, alignItems: 'center',
                padding: '10px 16px', borderRadius: expanded === f.id ? '6px 6px 0 0' : 6,
                background: G.pitchLight,
                borderLeft: `3px solid ${played ? color : 'rgba(255,255,255,0.15)'}`,
              }}>
                <div>
                  <div style={{ fontWeight: 700, color: G.white, fontSize: '0.88rem' }}>{f.home_team} <span style={{ color: G.muted, fontWeight: 400, fontSize: '0.75rem' }}>vs</span> {f.away_team}</div>
                  <div style={{ fontSize: '0.72rem', color: G.muted, marginTop: 1 }}>
                    {venue ? venue.name + ' · ' : ''}{f.match_date || 'No date'}{f.match_time ? ' · ' + f.match_time.slice(0, 5) : ''}
                  </div>
                </div>
                <input
                  type="number" min="0" max="99"
                  placeholder="—"
                  value={f.home_goals ?? ''}
                  onChange={e => handleScoreChange(f.id, 'home_goals', e.target.value)}
                  style={{
                    width: 56, textAlign: 'center', fontFamily: "'Barlow Condensed'",
                    fontSize: '1.3rem', fontWeight: 800, padding: '5px 4px',
                    background: 'rgba(0,0,0,0.25)', border: `1.5px solid ${color}44`, color: G.white, borderRadius: 4,
                  }}
                />
                <span style={{ textAlign: 'center', color: G.muted, fontFamily: "'Barlow Condensed'", fontWeight: 800 }}>:</span>
                <input
                  type="number" min="0" max="99"
                  placeholder="—"
                  value={f.away_goals ?? ''}
                  onChange={e => handleScoreChange(f.id, 'away_goals', e.target.value)}
                  style={{
                    width: 56, textAlign: 'center', fontFamily: "'Barlow Condensed'",
                    fontSize: '1.3rem', fontWeight: 800, padding: '5px 4px',
                    background: 'rgba(0,0,0,0.25)', border: `1.5px solid ${color}44`, color: G.white, borderRadius: 4,
                  }}
                />
                <span
                  onClick={() => toggleExpand(f.id)}
                  style={{
                    cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, color,
                    border: `1px solid ${color}44`, borderRadius: 3, padding: '4px 8px',
                    userSelect: 'none', whiteSpace: 'nowrap',
                  }}
                >
                  ⚽ Scorers {fScorers.length > 0 ? `(${fScorers.length})` : '+'}
                </span>
                {played && (
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => handleSaveResult(f)}
                    disabled={saving[f.id]}
                    style={{ justifyContent: 'center' }}
                  >
                    {saving[f.id] ? '…' : '💾 Save'}
                  </button>
                )}
              </div>

              {/* Scorer panel */}
              {isExpanded && (
                <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '0 0 6px 6px', padding: '12px 16px', borderLeft: `3px solid ${color}` }}>
                  {[f.home_team, f.away_team].map(team => {
                    const teamObj = teams.find(t => t.name === team)
                    const teamPlayers = teamObj ? players.filter(p => p.team_id === teamObj.id) : []
                    const teamScorers = fScorers.filter(s => s.team_name === team)
                    return (
                      <div key={team} style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: G.muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                          {team}
                        </div>
                        {teamScorers.map(s => (
                          <div key={s.id} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 5, flexWrap: 'wrap' }}>
                            {teamPlayers.length > 0 ? (
                              <select
                                value={s.player_name}
                                onChange={e => updateScorer(f.id, s.id, 'player_name', e.target.value)}
                                style={{ flex: 1, minWidth: 140, background: 'rgba(0,0,0,0.3)', border: '1.5px solid rgba(255,255,255,0.12)', color: G.white, fontSize: '0.85rem', padding: '5px 8px', borderRadius: 4 }}
                              >
                                <option value="">— Player —</option>
                                {teamPlayers.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                              </select>
                            ) : (
                              <input
                                placeholder="Player name"
                                value={s.player_name}
                                onChange={e => updateScorer(f.id, s.id, 'player_name', e.target.value)}
                                style={{ flex: 1, minWidth: 140, background: 'rgba(0,0,0,0.3)', border: '1.5px solid rgba(255,255,255,0.12)', color: G.white, fontSize: '0.85rem', padding: '5px 8px', borderRadius: 4 }}
                              />
                            )}
                            <input
                              type="number" min="1" max="20"
                              value={s.goals}
                              onChange={e => updateScorer(f.id, s.id, 'goals', Math.max(1, parseInt(e.target.value) || 1))}
                              style={{ width: 50, textAlign: 'center', background: 'rgba(0,0,0,0.3)', border: '1.5px solid rgba(255,255,255,0.12)', color: G.white, fontSize: '0.9rem', padding: '5px 4px', borderRadius: 4 }}
                            />
                            <span style={{ color: G.muted, fontSize: '0.75rem' }}>goal{s.goals > 1 ? 's' : ''}</span>
                            <span
                              onClick={() => updateScorer(f.id, s.id, 'own_goal', !s.own_goal)}
                              style={{
                                fontSize: '0.7rem', fontWeight: 700, padding: '3px 7px', borderRadius: 3,
                                background: s.own_goal ? G.danger : 'rgba(192,57,43,0.2)',
                                color: s.own_goal ? 'white' : G.danger,
                                border: `1px solid ${G.danger}44`, cursor: 'pointer', userSelect: 'none',
                              }}
                            >OG</span>
                            <span onClick={() => removeScorer(f.id, s.id)} style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.25)', fontSize: '1rem' }}>×</span>
                          </div>
                        ))}
                        <button
                          onClick={() => addScorer(f.id, team)}
                          style={{
                            fontSize: '0.75rem', fontWeight: 700, fontFamily: "'Barlow Condensed'",
                            letterSpacing: '0.06em', textTransform: 'uppercase',
                            background: 'rgba(126,203,53,0.1)', color,
                            border: `1px dashed ${color}66`, borderRadius: 4,
                            padding: '4px 10px', cursor: 'pointer',
                          }}
                        >+ Add scorer</button>
                      </div>
                    )
                  })}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setExpanded(null)}>Cancel</button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleSaveResult(f)}
                      disabled={saving[f.id]}
                    >
                      {saving[f.id] ? 'Saving…' : '💾 Save Result & Scorers'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
