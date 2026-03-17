import { useState, useMemo } from 'react'
import { useData } from '../../hooks/useData'
import { useLeagueTab } from '../../hooks/useLeagueTab'
import LeagueTabs from '../../components/LeagueTabs'
import { G } from '../../lib/theme'

export default function AdminResultsPage() {
  const { leagues, fixtures, scorers, players, teams, venues, updateFixture, upsertScorers, loading } = useData()
  const [activeId, setActiveId, activeLeague] = useLeagueTab(leagues)

  // Per-fixture local drafts: { [fixtureId]: { homeGoals, awayGoals, scorers[] } }
  const [drafts,   setDrafts]   = useState({})
  const [expanded, setExpanded] = useState(null)
  const [saving,   setSaving]   = useState({})
  const [saved,    setSaved]    = useState({})  // brief ✓ flash

  const clsFixtures = useMemo(() => fixtures.filter(f => f.league_id === activeId), [fixtures, activeId])

  // ── Draft helpers ─────────────────────────────────────────
  const getDraft = (f) => drafts[f.id] || {
    homeGoals: f.home_goals ?? '',
    awayGoals: f.away_goals ?? '',
    scorerList: scorers.filter(s => s.fixture_id === f.id).map(s => ({ ...s })),
  }

  const initDraft = (f) => {
    if (!drafts[f.id]) {
      setDrafts(prev => ({
        ...prev,
        [f.id]: {
          homeGoals:  f.home_goals ?? '',
          awayGoals:  f.away_goals ?? '',
          scorerList: scorers.filter(s => s.fixture_id === f.id).map(s => ({ ...s })),
        },
      }))
    }
  }

  const patchDraft = (fid, patch) => setDrafts(prev => ({
    ...prev,
    [fid]: { ...getDraftById(fid, prev), ...patch },
  }))

  const getDraftById = (fid, state) => state[fid] || {
    homeGoals: '', awayGoals: '', scorerList: [],
  }

  const patchScorer = (fid, sid, field, val) => setDrafts(prev => {
    const d = getDraftById(fid, prev)
    return { ...prev, [fid]: { ...d, scorerList: d.scorerList.map(s => s.id === sid ? { ...s, [field]: val } : s) } }
  })

  const addScorerRow = (fid, teamName) => setDrafts(prev => {
    const d = getDraftById(fid, prev)
    return {
      ...prev,
      [fid]: { ...d, scorerList: [...d.scorerList, { id: `new-${Date.now()}`, fixture_id: fid, player_name: '', team_name: teamName, goals: 1, own_goal: false }] },
    }
  })

  const removeScorerRow = (fid, sid) => setDrafts(prev => {
    const d = getDraftById(fid, prev)
    return { ...prev, [fid]: { ...d, scorerList: d.scorerList.filter(s => s.id !== sid) } }
  })

  // ── Save ──────────────────────────────────────────────────
  const handleSave = async (f) => {
    const d = getDraft(f)
    const homeGoals = d.homeGoals === '' ? null : parseInt(d.homeGoals)
    const awayGoals = d.awayGoals === '' ? null : parseInt(d.awayGoals)
    setSaving(prev => ({ ...prev, [f.id]: true }))
    await updateFixture(f.id, { home_goals: homeGoals, away_goals: awayGoals })
    const valid = d.scorerList.filter(s => s.player_name)
    await upsertScorers(f.id, valid.map(s => ({
      player_name: s.player_name,
      team_name:   s.team_name,
      goals:       parseInt(s.goals) || 1,
      own_goal:    !!s.own_goal,
    })))
    setSaving(prev => ({ ...prev, [f.id]: false }))
    setSaved(prev => ({ ...prev, [f.id]: true }))
    setDrafts(prev => { const n = { ...prev }; delete n[f.id]; return n })
    setExpanded(null)
    setTimeout(() => setSaved(prev => ({ ...prev, [f.id]: false })), 2500)
  }

  const toggleExpand = (f) => {
    if (expanded === f.id) { setExpanded(null); return }
    initDraft(f)
    setExpanded(f.id)
  }

  if (loading) return <div className="spinner" />

  const accent = activeLeague?.color || G.lime

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <div className="section-title">⚽ Results</div>
          <div className="section-sub">Enter scores and goal scorers — click Save to confirm</div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <LeagueTabs leagues={leagues} activeId={activeId} onChange={setActiveId} />
        </div>
      </div>

      {clsFixtures.length === 0 ? (
        <div className="alert alert-warn">No fixtures for {activeLeague?.name}. Generate them in Setup first.</div>
      ) : (
        clsFixtures.map(f => {
          const draft     = getDraft(f)
          const isExp     = expanded === f.id
          const hasResult = f.home_goals != null && f.away_goals != null
          const isDirty   = !!drafts[f.id]
          const venue     = venues.find(v => v.id === f.venue_id)

          return (
            <div key={f.id} style={{ marginBottom: 8 }}>
              {/* ── Score row ── */}
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center',
                padding: '10px 16px',
                borderRadius: isExp ? '6px 6px 0 0' : 6,
                background: G.pitchLight,
                borderLeft: `3px solid ${hasResult ? accent : 'rgba(255,255,255,0.15)'}`,
                transition: 'border-color 0.2s',
              }}>
                {/* Match info */}
                <div style={{ flex: '1 1 160px', minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: G.white, fontSize: '0.88rem' }}>
                    {f.home_team} <span style={{ color: G.muted, fontWeight: 400, fontSize: '0.75rem' }}>vs</span> {f.away_team}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: G.muted, marginTop: 1 }}>
                    Rd {f.round}{venue ? ' · ' + venue.name : ''}{f.match_date ? ' · ' + new Date(f.match_date+'T00:00:00').toLocaleDateString('en-GB',{day:'2-digit',month:'short'}) : ''}
                  </div>
                </div>

                {/* Score inputs */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input
                    type="number" min="0" max="99" placeholder="—"
                    value={isExp ? draft.homeGoals : (f.home_goals ?? '')}
                    onChange={e => isExp && patchDraft(f.id, { homeGoals: e.target.value })}
                    onClick={() => !isExp && toggleExpand(f)}
                    readOnly={!isExp}
                    style={{
                      width: 50, textAlign: 'center', fontFamily: "'Barlow Condensed'",
                      fontSize: '1.3rem', fontWeight: 800, padding: '5px 4px',
                      background: 'rgba(0,0,0,0.25)', border: `1.5px solid ${accent}44`,
                      color: G.white, borderRadius: 4, cursor: isExp ? 'text' : 'pointer',
                    }}
                  />
                  <span style={{ color: G.muted, fontFamily: "'Barlow Condensed'", fontWeight: 800, padding: '0 3px' }}>:</span>
                  <input
                    type="number" min="0" max="99" placeholder="—"
                    value={isExp ? draft.awayGoals : (f.away_goals ?? '')}
                    onChange={e => isExp && patchDraft(f.id, { awayGoals: e.target.value })}
                    onClick={() => !isExp && toggleExpand(f)}
                    readOnly={!isExp}
                    style={{
                      width: 50, textAlign: 'center', fontFamily: "'Barlow Condensed'",
                      fontSize: '1.3rem', fontWeight: 800, padding: '5px 4px',
                      background: 'rgba(0,0,0,0.25)', border: `1.5px solid ${accent}44`,
                      color: G.white, borderRadius: 4, cursor: isExp ? 'text' : 'pointer',
                    }}
                  />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span
                    onClick={() => toggleExpand(f)}
                    style={{
                      cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, color: accent,
                      border: `1px solid ${accent}44`, borderRadius: 3, padding: '5px 9px',
                      userSelect: 'none', background: isExp ? `${accent}18` : 'transparent',
                    }}
                  >
                    {isExp ? '▲ Close' : `⚽ Scorers${draft.scorerList.length > 0 ? ` (${draft.scorerList.length})` : ''}`}
                  </span>

                  {isDirty && (
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleSave(f)}
                      disabled={saving[f.id]}
                      style={{ background: accent, color: isLight(accent) ? G.pitch : '#fff', justifyContent: 'center' }}
                    >
                      {saving[f.id] ? '⏳…' : '💾 Save'}
                    </button>
                  )}
                  {saved[f.id] && !isDirty && (
                    <span style={{ fontSize: '0.78rem', color: G.lime, fontWeight: 700 }}>✓ Saved</span>
                  )}
                </div>
              </div>

              {/* ── Scorer panel ── */}
              {isExp && (
                <div style={{
                  background: 'rgba(0,0,0,0.3)', borderRadius: '0 0 6px 6px',
                  padding: '14px 16px', borderLeft: `3px solid ${accent}`,
                }}>
                  {[f.home_team, f.away_team].map(teamName => {
                    const teamObj      = teams.find(t => t.name === teamName)
                    const teamPlayers  = teamObj ? players.filter(p => p.team_id === teamObj.id) : []
                    const teamScorers  = draft.scorerList.filter(s => s.team_name === teamName)

                    return (
                      <div key={teamName} style={{ marginBottom: 14 }}>
                        <div style={{
                          fontSize: '0.78rem', fontWeight: 700, color: accent,
                          letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 7,
                          display: 'flex', alignItems: 'center', gap: 8,
                        }}>
                          🏑 {teamName}
                          <span style={{ color: G.muted, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                            ({teamPlayers.length} registered players)
                          </span>
                        </div>

                        {teamScorers.map(s => (
                          <div key={s.id} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                            {/* Player selector from registered list */}
                            {teamPlayers.length > 0 ? (
                              <select
                                value={s.player_name}
                                onChange={e => patchScorer(f.id, s.id, 'player_name', e.target.value)}
                                style={{ flex: '1 1 150px', minWidth: 140, background: 'rgba(0,0,0,0.3)', border: `1.5px solid ${accent}44`, color: G.white, fontSize: '0.85rem', padding: '6px 8px', borderRadius: 4 }}
                              >
                                <option value="">— Select player —</option>
                                {teamPlayers.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                              </select>
                            ) : (
                              <input
                                placeholder="Player name (register players for dropdown)"
                                value={s.player_name}
                                onChange={e => patchScorer(f.id, s.id, 'player_name', e.target.value)}
                                style={{ flex: '1 1 150px', background: 'rgba(0,0,0,0.3)', border: '1.5px solid rgba(255,255,255,0.12)', color: G.white, fontSize: '0.85rem', padding: '6px 8px', borderRadius: 4 }}
                              />
                            )}

                            {/* Goals count */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                              <button onClick={() => patchScorer(f.id, s.id, 'goals', Math.max(1, (s.goals||1)-1))} style={{ width: 26, height: 26, borderRadius: 3, border: 'none', background: 'rgba(255,255,255,0.1)', color: G.white, cursor: 'pointer', fontWeight: 800, fontSize: '1rem' }}>−</button>
                              <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '1.1rem', color: accent, minWidth: 22, textAlign: 'center' }}>{s.goals || 1}</span>
                              <button onClick={() => patchScorer(f.id, s.id, 'goals', (s.goals||1)+1)} style={{ width: 26, height: 26, borderRadius: 3, border: 'none', background: 'rgba(255,255,255,0.1)', color: G.white, cursor: 'pointer', fontWeight: 800, fontSize: '1rem' }}>+</button>
                            </div>

                            {/* OG toggle */}
                            <span
                              onClick={() => patchScorer(f.id, s.id, 'own_goal', !s.own_goal)}
                              style={{
                                fontSize: '0.7rem', fontWeight: 700, padding: '4px 8px', borderRadius: 3,
                                background: s.own_goal ? G.danger : 'rgba(192,57,43,0.15)',
                                color: s.own_goal ? 'white' : G.danger,
                                border: `1px solid ${G.danger}55`, cursor: 'pointer', userSelect: 'none',
                              }}
                            >OG</span>

                            {/* Remove */}
                            <span onClick={() => removeScorerRow(f.id, s.id)} style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.25)', fontSize: '1.2rem', lineHeight: 1, padding: '0 2px' }}>×</span>
                          </div>
                        ))}

                        <button
                          onClick={() => addScorerRow(f.id, teamName)}
                          style={{
                            fontSize: '0.75rem', fontWeight: 700, fontFamily: "'Barlow Condensed'",
                            letterSpacing: '0.06em', textTransform: 'uppercase',
                            background: `${accent}15`, color: accent,
                            border: `1px dashed ${accent}55`, borderRadius: 4,
                            padding: '5px 12px', cursor: 'pointer',
                          }}
                        >+ Add scorer</button>
                      </div>
                    )
                  })}

                  {/* Panel save / cancel */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setExpanded(null); setDrafts(prev => { const n={...prev}; delete n[f.id]; return n }) }}>
                      Cancel
                    </button>
                    <button
                      className="btn btn-sm"
                      style={{ background: accent, color: isLight(accent) ? G.pitch : '#fff' }}
                      onClick={() => handleSave(f)}
                      disabled={saving[f.id]}
                    >
                      {saving[f.id] ? '⏳ Saving…' : '💾 Save Result & Scorers'}
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

function isLight(hex) {
  const h = hex.replace('#','')
  const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16)
  return (r*299 + g*587 + b*114) / 1000 > 140
}
